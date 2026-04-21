"use client";

import { QRCodeSVG } from "qrcode.react";
import { FurnitureCatalogItem } from "@/types/furniture";
import { Suspense, useEffect, useState } from "react";
import { EditorToolbar } from "./toolbar/editor-toolbar";
import { SceneCanvas } from "./canvas/scene-canvas";
import { FURNITURE_CATALOG } from "../../../lib/furniture-catalog";
import { FurnitureCatalogBar } from "./panels/furniture-catalog-bar";
import { FurniturePanel } from "./panels/furniture-panel";
import { PropertiesPanel } from "./panels/properties-panel";
import { FengShuiPanel } from "./panels/feng-shui-panel";
import { RoomSettingsDialog } from "./dialogs/room-settings-dialog";
import { ChatDock } from "@/components/features/chat/chat-dock";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileBottomSheet } from "./mobile-bottom-sheet";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useProject } from "@/hooks/use-project";
import { useConversations } from "@/hooks/use-conversations";
import { useChatStore } from "@/stores/chat-store";
import { useEditorStore } from "@/stores/editor-store";
import { FurnitureConfirmationCard } from "./furniture-confirmation-card";

interface EditorWorkspaceProps {
  projectId: string;
}

type DetectedObject = {
  label: string;
  confidence: number;
  width_m: number;
  height_m: number;
  elevation_m: number;
  distance_m: number;
  center_pixel: [number, number];
  catalogItem: FurnitureCatalogItem;
};

type ApiDetectedObject = Omit<DetectedObject, "catalogItem">;

export function EditorWorkspace({ projectId }: EditorWorkspaceProps) {
  const { load } = useProject(projectId);
  const setProjectId = useChatStore((s) => s.setProjectId);
  const setConversationId = useChatStore((s) => s.setConversationId);
  const setProjectName = useEditorStore((s) => s.setProjectName);
  const conversationId = useChatStore((s) => s.conversationId);
  const chatOpen = useChatStore((s) => s.isOpen);
  const { loadMessages } = useConversations();

  useEffect(() => {
    setProjectId(projectId);
    setConversationId(null);
    setProjectName(null);
    load();
    return () => {
      setProjectId(null);
      setProjectName(null);
    };
  }, [load, projectId, setProjectId, setConversationId, setProjectName]);

  useEffect(() => {
    if (conversationId) loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  const [showScannerOptions, setShowScannerOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showQrModal, setShowQrModal] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [serverIp, setServerIp] = useState("localhost");

  // State for the new confirmation flow
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [currentObjectIndex, setCurrentObjectIndex] = useState(0);

  useEffect(() => {
    load();
    // Fetch the server's IP address when the component mounts
    const fetchIp = async () => {
      try {
        const response = await fetch("/api/get-ip");
        const data = await response.json();
        if (data.ipAddress) {
          setServerIp(data.ipAddress);
        }
      } catch (error) {
        console.error("Failed to fetch server IP:", error);
      }
    };
    fetchIp();
  }, [load]);

  useEffect(() => {
    if (sessionId) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(
            `/api/check-upload-status?sessionId=${sessionId}`,
          );
          if (response.ok) {
            const data = await response.json();
            console.log("Polling response:", data);

            if (data.status === "processing") {
              setShowQrModal(false);
              setIsProcessing(true);
            } else if (data.status !== "pending") {
              clearInterval(interval);
              setShowQrModal(false);
              setSessionId(""); // stop polling

              setIsProcessing(true);
              if (data.status === "success" && data.objects) {
                const objectsWithCatalogItems = data.objects
                  .map((obj: ApiDetectedObject) => {
                    const catalogItem = FURNITURE_CATALOG.find(
                      (item) =>
                        item.category.toLowerCase() ===
                          obj.label.toLowerCase() ||
                        item.name
                          .toLowerCase()
                          .includes(obj.label.toLowerCase()),
                    );
                    return { ...obj, catalogItem };
                  })
                  .filter(
                    (obj: {
                      catalogItem: FurnitureCatalogItem | undefined;
                    }): obj is DetectedObject => obj.catalogItem !== undefined,
                  );

                if (objectsWithCatalogItems.length > 0) {
                  setDetectedObjects(objectsWithCatalogItems);
                  setCurrentObjectIndex(0); // Start confirmation from the first object
                } else {
                  alert("ไม่พบเฟอร์นิเจอร์ที่รู้จักในรูปภาพ");
                  setShowScannerOptions(true);
                }
                setIsProcessing(false);
              } else {
                alert(data.message || "ไม่สามารถประมวลผลรูปภาพได้");
                setShowScannerOptions(true);
                setIsProcessing(false);
              }
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [sessionId]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setShowScannerOptions(false);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("target_height", "2.5");

    try {
      console.log("📤 กำลังส่งรูปภาพ...");
      const response = await fetch("/api/chat/process-single-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ ประมวลผลเสร็จสิ้น");

        if (data.status === "success" && data.objects) {
          const objectsWithCatalogItems = data.objects
            .map((obj: ApiDetectedObject) => {
              const catalogItem = FURNITURE_CATALOG.find(
                (item) =>
                  item.category.toLowerCase() === obj.label.toLowerCase() ||
                  item.name.toLowerCase().includes(obj.label.toLowerCase()),
              );
              return { ...obj, catalogItem };
            })
            .filter(
              (obj: {
                catalogItem: FurnitureCatalogItem | undefined;
              }): obj is DetectedObject => obj.catalogItem !== undefined,
            );

          if (objectsWithCatalogItems.length > 0) {
            setDetectedObjects(objectsWithCatalogItems);
            setCurrentObjectIndex(0); // Start confirmation from the first object
          } else {
            alert("ไม่พบเฟอร์นิเจอร์ที่รู้จักในรูปภาพ");
            setShowScannerOptions(true);
          }
        } else {
          alert(data.message || "ไม่สามารถประมวลผลรูปภาพได้");
          setShowScannerOptions(true);
        }
      } else {
        alert("เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์");
        setShowScannerOptions(true);
      }
    } catch (error) {
      console.error("AI Auto-add error:", error);
      alert("เกิดข้อผิดพลาดในการสแกน กรุณาลองใหม่");
      setShowScannerOptions(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmFurniture = (
    confirmedObject: DetectedObject,
    dimensions: { width: number; height: number; depth: number },
  ) => {
    const addFurniture = useEditorStore.getState().addFurniture;
    const { catalogItem, distance_m, center_pixel, elevation_m, confidence } =
      confirmedObject;

    const imgWidth = 1000;
    const fieldOfView = Math.PI;
    const angle = (center_pixel[0] / imgWidth - 0.5) * fieldOfView;

    const posX = distance_m * Math.sin(angle);
    const posZ = -distance_m * Math.cos(angle);

    addFurniture({
      id: catalogItem.id,
      instanceId: `${catalogItem.id}-ai-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)}`,
      name: catalogItem.name,
      category: catalogItem.category,
      pos_x: posX,
      pos_y: elevation_m,
      pos_z: posZ,
      rotation: -angle * (180 / Math.PI),
      dimensions: dimensions,
      is_essential: catalogItem.is_essential,
      feng_shui_notes: [
        `สแกนอัตโนมัติ: ความแม่นยำ ${Math.round(confidence * 100)}%`,
      ],
      model_url: catalogItem.model_url ?? undefined,
      model_rotation_offset: 0,
    });

    // Move to the next object
    const nextIndex = currentObjectIndex + 1;
    if (nextIndex < detectedObjects.length) {
      setCurrentObjectIndex(nextIndex);
    } else {
      // Last object confirmed
      setDetectedObjects([]);
      setCurrentObjectIndex(0);
      alert(`เพิ่มเฟอร์นิเจอร์ที่ยืนยันทั้งหมดเรียบร้อยแล้ว`);
      setShowScannerOptions(false); // Don't show upload options again
    }
  };

  const handleDiscardFurniture = () => {
    const nextIndex = currentObjectIndex + 1;
    if (nextIndex < detectedObjects.length) {
      setCurrentObjectIndex(nextIndex);
    } else {
      // Last object discarded
      setDetectedObjects([]);
      setCurrentObjectIndex(0);
      alert("เสร็จสิ้นการตรวจสอบเฟอร์นิเจอร์");
      setShowScannerOptions(false); // Don't show upload options again
    }
  };

  const handleQrScan = () => {
    const newSessionId = Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
    setShowScannerOptions(false);
    setShowQrModal(true);
  };

  return (
    <div className="relative h-full w-full">
      {detectedObjects.length > 0 && (
        <FurnitureConfirmationCard
          key={currentObjectIndex}
          detectedObject={detectedObjects[currentObjectIndex]}
          onConfirm={handleConfirmFurniture}
          onDiscard={handleDiscardFurniture}
          totalItems={detectedObjects.length}
          currentIndex={currentObjectIndex}
        />
      )}

      {/* Loading overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 text-white">
            <LoadingSpinner size="lg" className="text-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold animate-pulse">
                BuddyBuilder.ai กำลังทำงาน
              </h3>
              <p className="text-sm text-white/70">
                กำลังวิเคราะห์พื้นที่ของเฟอร์นิเจอร์...
              </p>
            </div>
          </div>
        </div>
      )}

      {showQrModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background p-6 rounded-xl shadow-2xl w-80 max-w-[90%] flex flex-col gap-4 border border-border">
            <h3 className="text-xl font-bold text-center">
              สแกน QR Code ด้วยมือถือ
            </h3>
            <div className="flex justify-center">
              <QRCodeSVG
                value={`${window.location.protocol}//${serverIp}:${window.location.port}/upload-mobile?sessionId=${sessionId}`}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              หลังจากถ่ายและอัปโหลดรูปภาพแล้ว กรุณารอสักครู่
            </p>
            <button
              className="mt-2 text-sm text-muted-foreground hover:text-foreground underline transition"
              onClick={() => {
                setShowQrModal(false);
                setSessionId("");
              }}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Upload options modal */}
      {showScannerOptions && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background p-6 rounded-xl shadow-2xl w-80 max-w-[90%] flex flex-col gap-4 border border-border">
            <h3 className="text-xl font-bold text-center">
              เลือกวิธีเพิ่มรูปห้อง
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-2">
              ถ่ายรูปห้องด้วยกล้องหรือเลือกรูปจากเครื่องของคุณ
            </p>
            <label className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg text-center cursor-pointer hover:bg-secondary/80 transition border border-border flex items-center justify-center gap-2">
              📁 เลือกรูปจากเครื่อง
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  setShowScannerOptions(false);
                  handleFileUpload(e);
                }}
              />
            </label>
            <button
              className="w-full py-3 bg-gray-500 text-white font-semibold rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
              onClick={handleQrScan}
            >
              📱 สแกนด้วย QR Code
            </button>
            <button
              className="mt-2 text-sm text-muted-foreground hover:text-foreground underline transition"
              onClick={() => setShowScannerOptions(false)}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      <EditorToolbar
        projectId={projectId}
        onStartScan={() => setShowScannerOptions(true)}
      />

      {/* Desktop: canvas is fullscreen; chat + catalog overlay on top */}
      <div className="absolute inset-0 top-10 bottom-14 hidden lg:top-12 lg:bottom-0 lg:block">
        {/* Canvas — fills entire workspace, does not resize with overlays */}
        <div className="absolute inset-0">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center bg-muted">
                  <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      กำลังโหลดโปรแกรมแก้ไข 3 มิติ...
                    </p>
                  </div>
                </div>
              }
            >
              <SceneCanvas />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Floating panels overlay the canvas */}
        <PropertiesPanel />
        <FengShuiPanel />

        {/* Right: chat dock overlay */}
        <div className="absolute right-0 top-0 bottom-0 z-10">
          <ChatDock />
        </div>

        {/* Bottom: furniture catalog bar overlay — stops before the chat dock */}
        <div
          className={`absolute bottom-0 left-0 z-10 ${chatOpen ? "right-96" : "right-12"}`}
        >
          <FurnitureCatalogBar />
        </div>
      </div>

      {/* Mobile: use existing mobile flow (canvas fullscreen + bottom nav/sheet) */}
      <div className="absolute inset-0 top-10 bottom-14 lg:hidden">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center bg-muted">
                <div className="text-center">
                  <LoadingSpinner size="lg" className="mx-auto" />
                </div>
              </div>
            }
          >
            <SceneCanvas />
          </Suspense>
        </ErrorBoundary>
      </div>

      <RoomSettingsDialog projectId={projectId} />

      {/* Mobile-only panels */}
      <div className="lg:hidden">
        <FurniturePanel />
        <MobileBottomNav />
        <MobileBottomSheet />
      </div>
    </div>
  );
}
