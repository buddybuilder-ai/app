"use client";

import { Camera, FolderOpen, QrCode } from "lucide-react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

import { QRCodeSVG } from "qrcode.react";
import { FurnitureCatalogItem } from "@/types/furniture";
import { useEffect, useState } from "react";
import { FURNITURE_CATALOG } from "../../../lib/furniture-catalog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useProject } from "@/hooks/use-project";
import { useConversations } from "@/hooks/use-conversations";
import { useChatStore } from "@/stores/chat-store";
import { useEditorStore } from "@/stores/editor-store";
import { FurnitureConfirmationCard } from "../editor/furniture-confirmation-card";

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

export function ScanImagePage({ projectId }: { projectId: string }) {
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
        const response = await fetch(
          `http://localhost:8002/api/v1/chat/get-ip`,
        );
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
    if (!sessionId) return;

    let isCancelled = false;

    const poll = async () => {
      if (isCancelled) return;

      try {
        let isFetchComplete = false;

        // ถ้าเซิร์ฟเวอร์ใช้เวลาตอบกลับนานกว่า 1.5 วิ ถือว่าเริ่มประมวลผล AI แล้ว
        const timeoutId = setTimeout(() => {
          if (!isFetchComplete && !isCancelled) {
            setShowQrModal(false);
            setIsProcessing(true);
          }
        }, 1500);

        const response = await fetch(
          `http://localhost:8002/api/v1/chat/check-upload-status?sessionId=${sessionId}`,
        );

        isFetchComplete = true;
        clearTimeout(timeoutId);
        if (isCancelled) return;

        if (response.ok) {
          const data = await response.json();
          if (isCancelled) return;

          if (data.status === "processing") {
            setShowQrModal(false);
            setIsProcessing(true);
            setTimeout(poll, 3000);
          } else if (data.status !== "pending") {
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
          } else {
            // status === "pending"
            setTimeout(poll, 3000);
          }
        } else {
          setTimeout(poll, 3000);
        }
      } catch (error) {
        console.error("Polling error:", error);
        if (!isCancelled) setTimeout(poll, 3000);
      }
    };

    const initialTimeout = setTimeout(poll, 3000); // Poll every 3 seconds

    return () => {
      isCancelled = true;
      clearTimeout(initialTimeout);
    };
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
      const response = await fetch(
        `http://localhost:8002/api/v1/chat/process-single-image`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        const data = await response.json();

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
    const newSessionId = Math.random().toString(36).slice(2, 11);

    setSessionId(newSessionId);
    setShowScannerOptions(false);
    setShowQrModal(true);
  };

  return (
    <div>
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
        <div className="fixed inset-0 z-[999999999999999999999999999999] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md">
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
        <div className="fixed inset-0 z-[999999999999999999999999999999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
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
        <div className="fixed inset-0 z-[999999999999999999999999999999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background p-6 rounded-xl shadow-2xl w-80 max-w-[90%] flex flex-col gap-4 border border-border">
            <h3 className="text-xl font-bold text-center">
              เลือกวิธีเพิ่มเฟอนิเจอร์
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-2">
              เลือกรูปจากเครื่องของคุณหรือถ่ายรูปห้องด้วยกล้อง
            </p>
            {/* ปุ่มที่ 1: เลือกรูปจากเครื่อง (สี Secondary) */}
            <label className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg text-center cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md shadow-primary/20 group">
              <FolderOpen className="h-5 w-5 text-primary-foreground transition-transform group-hover:scale-110" />
              <span className="text-sm">เลือกรูปจากเครื่อง</span>
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

            {/* ปุ่มที่ 2: สแกนด้วย QR Code (เปลี่ยนเป็นสี Secondary) */}
            <button
              className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition border border-border flex items-center justify-center gap-2 group"
              onClick={handleQrScan}
            >
              <QrCode className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm">สแกนด้วย QR Code</span>
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

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="relative h-9 gap-2 overflow-hidden border-none bg-primary px-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary/40 active:scale-95 group"
            onClick={() => setShowScannerOptions(true)}
          >
            {/* เอฟเฟกต์แสงวิ่งผ่าน (Shine Effect) เมื่อ Hover */}
            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]" />

            {/* Icon พร้อม Animation เล็กน้อย */}
            <Camera className="h-4 w-4 text-white transition-transform group-hover:rotate-12" />

            <span className="hidden text-xs lg:inline font-semibold tracking-wide text-white">
              นำเข้าเฟอนิเจอร์
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-900 text-white border-none shadow-xl">
          <p className="flex items-center gap-2">
            <span className="text-primary-foreground font-bold">
              ✨ AI Scanning
            </span>
            <span>วิเคราะห์เฟอร์นิเจอร์จากภาพถ่าย</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
