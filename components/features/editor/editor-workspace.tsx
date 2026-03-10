"use client";

import { Suspense, useEffect, useState } from "react";
import { EditorToolbar } from "./toolbar/editor-toolbar";
import { SceneCanvas } from "./canvas/scene-canvas";
import { FurniturePanel } from "./panels/furniture-panel";
import { FURNITURE_CATALOG } from "../../../lib/furniture-catalog";
import { PropertiesPanel } from "./panels/properties-panel";
import { FengShuiPanel } from "./panels/feng-shui-panel";
import { RoomSettingsPanel } from "./panels/room-settings-panel";
import { ChatWidget } from "@/components/features/chat/chat-widget";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileBottomSheet } from "./mobile-bottom-sheet";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useProject } from "@/hooks/use-project";
import { useEditorStore } from "@/stores/editor-store";

// panorama scanner component removed; camera capture uses file input instead

interface EditorWorkspaceProps {
  projectId: string;
}

export function EditorWorkspace({ projectId }: EditorWorkspaceProps) {
  const { load } = useProject(projectId);

  // 🚨 เพิ่ม State จัดการหน้าต่างตัวเลือก
  const [showScannerOptions, setShowScannerOptions] = useState(false);
  // previously used for panorama scanner – removed, we now capture a single photo

  // ภาพล่าสุดที่มาจากมือถือเครื่องอื่น (ผ่าน SSE)
  const [incomingPhoto, setIncomingPhoto] = useState<string | null>(null);

  // ใน editor-workspace.tsx
const [isProcessing, setIsProcessing] = useState(false); // เช็คว่ากำลังประมวลผล AI หรือไม่
const [showUploadModal, setShowUploadModal] = useState(true); // เช็คว่าจะเปิด/ปิดหน้าเลือกรูป

  useEffect(() => {
    load();
  }, [load]);

  // subscribe to photo updates from any client
  useEffect(() => {
    const es = new EventSource("/api/chat/updates");
    es.onmessage = (e) => {
      try {
        const url = JSON.parse(e.data);
        setIncomingPhoto(url);
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setShowUploadModal(false); 
  setIsProcessing(true);

    // ดึงฟังก์ชัน addFurniture จาก Store เดียวกับที่ FurniturePanel ใช้
    const addFurniture = useEditorStore.getState().addFurniture;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("target_height", "2.5");

    try {
      console.log("📤 กำลังส่งรูปภาพ...");

      // proxy through Next.js so origin matches current host
      const response = await fetch("/api/chat/process-single-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        console.log("✅ ประมวลผลเสร็จสิ้น");

        if (data.status === "success" && data.objects) {
          // 🚨 เริ่มการเพิ่มเฟอร์นิเจอร์อัตโนมัติ
          data.objects.forEach((obj: any, index: number) => {
            console.log(`🔍 วัตถุชิ้นที่ ${index + 1}:`, {
              label: obj.label,
              confidence: `${(obj.confidence * 100).toFixed(2)}%`,
              size: `${obj.width_m}x${obj.height_m}m`,
              elevation: `${obj.elevation_m}m`,
            });

            // 2. ค้นหาไอเทมใน Catalog ที่ตรงกับคำที่ AI ตรวจเจอ
            // โดยหาจากชื่อ (name) หรือ หมวดหมู่ (category)
            const catalogItem = FURNITURE_CATALOG.find(
              (item) =>
                item.category.toLowerCase() === obj.label.toLowerCase() ||
                item.name.toLowerCase().includes(obj.label.toLowerCase()),
            );

            if (catalogItem) {
              // --- เริ่มการคำนวณตำแหน่งแบบโค้ง (Polar to Cartesian) ---
              const imgWidth = 1000; // หรือใช้ขนาดจริงของรูปที่ AI ส่งมา
              const distance = obj.distance_m;

              // 1. คำนวณมุมองศา (โดยให้กลางภาพคือ 0 องศา)
              // ถ้ารูปกว้างมาก (Panorama) มุมมองอาจจะกว้างถึง 120-180 องศา
              const fieldOfView = Math.PI; // สมมติมุมกว้าง 180 องศา (ปรับตามความโค้งของรูป)
              const angle =
                (obj.center_pixel[0] / imgWidth - 0.5) * fieldOfView;

              // 2. ใช้สูตรตรีโกณมิติเพื่อหาพิกัด x และ z
              // x = r * sin(theta), z = -r * cos(theta)
              const posX = distance * Math.sin(angle);
              const posZ = -distance * Math.cos(angle);

              addFurniture({
                id: catalogItem.id,
                instanceId: `${catalogItem.id}-ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: catalogItem.name,
                category: catalogItem.category,

                // ใช้พิกัดจริงที่ AI คำนวณมา (เมตร)
                pos_x: posX,
                pos_y: obj.elevation_m,
                pos_z: posZ, // ใช้ posZ แทน -obj.distance_m

                rotation: -angle * (180 / Math.PI), // แปลงเป็นองศา
                dimensions: {
                  width: obj.width_m,
                  height: obj.height_m,
                  depth: catalogItem.dimensions.depth, // ความลึกอ้างอิงจาก Catalog
                },
                is_essential: catalogItem.is_essential,
                feng_shui_notes: [
                  `สแกนอัตโนมัติ: ความแม่นยำ ${Math.round(obj.confidence * 100)}%`,
                ],
                model_url: catalogItem.model_url ?? undefined,
                model_rotation_offset: 0,
              });
            }
          });

          alert(
            `สแกนสำเร็จ! เพิ่มเฟอร์นิเจอร์ ${data.objects.length} ชิ้นลงในห้องแล้ว`,
          );
        }
      }
    } catch (error) {
      console.error("AI Auto-add error:", error);
      alert("เกิดข้อผิดพลาดในการสแกน กรุณาลองใหม่");
    setShowUploadModal(true); // ถ้าพลาด ให้เปิดหน้าเลือกรูปกลับมาใหม่
    } finally {
      setIsProcessing(false);
    }
  };

return (
    <div className="relative h-full w-full">
      {/* 1. หน้าจอ Loading แสดงข้อความ "กำลัง..." ระหว่างรอ AI */}
      {/* แสดงภาพที่มาจากมือถือเครื่องอื่น */}
      {incomingPhoto && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80">
          <div className="relative">
            <img src={incomingPhoto} className="max-w-full max-h-full" />
            <button
              className="absolute top-2 right-2 p-2 bg-white rounded-full"
              onClick={() => setIncomingPhoto(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {isProcessing && (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 text-white">
            <LoadingSpinner size="lg" className="text-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold animate-pulse">BuddyBuilder.ai กำลังทำงาน</h3>
              <p className="text-sm text-white/70">
                กำลังวิเคราะห์พื้นที่ของเฟอร์นิเจอร์...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. หน้าต่าง Modal ตัวเลือก ถ่ายรูป vs อัปโหลด */}
      {showScannerOptions && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background p-6 rounded-xl shadow-2xl w-80 max-w-[90%] flex flex-col gap-4 border border-border">
            <h3 className="text-xl font-bold text-center">เลือกวิธีเพิ่มรูปห้อง</h3>
            <p className="text-sm text-muted-foreground text-center mb-2">
              ถ่ายรูปห้องด้วยกล้องหรือเลือกรูปจากเครื่องของคุณ
            </p>
            {/* ปุ่มถ่ายรูป */}
            {/* ปุ่มถ่ายรูปด้วยกล้องมือถือ */}
            <label className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer">
              📸 ถ่ายรูประบบกล้อง
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  setShowScannerOptions(false); // ปิดหน้าตัวเลือก
                  handleFileUpload(e);
                }}
              />
            </label>

            {/* ปุ่มอัปโหลดไฟล์ */}
            <label className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg text-center cursor-pointer hover:bg-secondary/80 transition border border-border flex items-center justify-center gap-2">
              📁 เลือกรูปจากเครื่อง
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  setShowScannerOptions(false); // ปิดหน้าตัวเลือกทันทีที่เลือกรูป
                  handleFileUpload(e); // เรียกฟังก์ชันอัปโหลดที่ตั้งค่า setIsProcessing(true) ไว้ภายใน
                }}
              />
            </label>

            <button
              className="mt-2 text-sm text-muted-foreground hover:text-foreground underline transition"
              onClick={() => setShowScannerOptions(false)}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* removed panorama view; camera capture handled by hidden file input below */}
      <EditorToolbar
        projectId={projectId}
        onStartScan={() => setShowScannerOptions(true)} // now opens camera/photo modal
      />

      {/* Canvas area */}
      <div className="absolute inset-0 top-10 bottom-14 lg:top-12 lg:bottom-0">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center bg-muted">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <SceneCanvas />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Side panels & Mobile UI */}
      <FurniturePanel />
      <PropertiesPanel />
      <FengShuiPanel />
      <RoomSettingsPanel />
      <ChatWidget />

      <div className="lg:hidden">
        <MobileBottomNav />
        <MobileBottomSheet />
      </div>
    </div>
  );
}
