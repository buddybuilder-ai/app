"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function MobileUploadPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !sessionId) return;

    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("sessionId", sessionId);

    try {
      const response = await fetch("/api/chat/process-single-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadStatus("success");
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "เกิดข้อผิดพลาดในการอัปโหลด");
        setUploadStatus("error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
        <h1 className="text-xl font-bold text-red-600">เกิดข้อผิดพลาด</h1>
        <p className="text-gray-600 mt-2">
          ไม่พบ Session ID ใน URL, กรุณาสแกน QR Code ใหม่อีกครั้ง
        </p>
      </div>
    );
  }

  if (uploadStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-center p-4">
        <div className="text-green-600">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <h1 className="text-2xl font-bold mt-4">อัปโหลดสำเร็จ!</h1>
          <p className="text-gray-700 mt-2">
            คุณสามารถกลับไปที่หน้าจอหลักบนคอมพิวเตอร์ของคุณได้แล้ว
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800">
          อัปโหลดรูปภาพเฟอร์นิเจอร์
        </h1>
        <p className="text-gray-600 mt-2 mb-8">
          ถ่ายรูปหรือเลือกรูปภาพจากคลังของคุณเพื่อส่งไปยังคอมพิวเตอร์
        </p>

        {isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">กำลังอัปโหลด...</p>
          </div>
        ) : (
          <>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <button
              onClick={triggerFileSelect}
              className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
            >
              📸 ถ่ายหรือเลือกรูปภาพ
            </button>
            {uploadStatus === "error" && (
              <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-lg">
                <p className="font-semibold">เกิดข้อผิดพลาด:</p>
                <p>{errorMessage}</p>
              </div>
            )}
          </>
        )}

        <p className="text-xs text-gray-400 mt-8">
          Session ID: {sessionId}
        </p>
      </div>
    </div>
  );
}
