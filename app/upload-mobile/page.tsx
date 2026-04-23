"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, Upload, CheckCircle2, X } from "lucide-react";

export default function MobileUploadPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const roomHeight = searchParams.get("roomHeight");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // State สำหรับเก็บ URL รูปตัวอย่าง
  const [status, setStatus] = useState<"idle" | "uploading" | "success">("idle");

  // ล้าง Memory เมื่อ Component ถูกถอดออก (Prevent Memory Leak)
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // สร้าง URL สำหรับแสดงรูปตัวอย่าง
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl); // ล้าง URL เก่าก่อน
      }
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !sessionId) return;
    setStatus("uploading");

    const formData = new FormData();
    formData.append("image", file);
    if (roomHeight) {
      formData.append("target_height", roomHeight);
    }

    try {
      // ยิงไปที่ Backend FastAPI (พอร์ต 8002 ตามที่คุณใช้)
      const response = await fetch(`http://192.168.1.126:8002/api/v1/chat/mobile-upload/${sessionId}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) setStatus("success");
    } catch (error) {
      console.error(error);
      // alert(`เกิดข้อผิดพลาด: ${error.message}`); 
      setStatus("idle");
    }
  };

  // --- หน้าจอเมื่อส่งสำเร็จ ---
  if (status === "success") {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center bg-slate-50">
        <CheckCircle2 className="h-20 w-20 text-green-500 mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold">ส่งข้อมูลเรียบร้อย!</h1>
        <p className="text-slate-600 mt-3 max-w-xs">ได้รับรูปภาพของคุณแล้ว กรุณากลับไปดูที่หน้าจอคอมพิวเตอร์</p>
      </div>
    );
  }

  // --- หน้าจอหลักสำหรับอัปโหลด ---
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
        <h1 className="text-2xl font-bold text-center mb-8 text-slate-900">
          BuddyBuilder AI Camera
        </h1>
        
        {/* ส่วนแสดงรูปตัวอย่าง / ช่องถ่ายรูป */}
        <div className="relative w-full h-64 border-2 border-dashed border-slate-300 rounded-3xl overflow-hidden group">
          {previewUrl ? (
            // แสดงรูปตัวอย่างเต็มช่อง
            <>
              <img 
                src={previewUrl} 
                alt="Room Preview" 
                className="w-full h-full object-cover"
              />
              {/* ปุ่มลบรูป */}
              <button 
                onClick={handleRemoveFile}
                className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            // แสดงไอคอนกล้องเมื่อยังไม่มีรูป
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-50 transition">
              <Camera className="h-16 w-16 text-slate-300 mb-3" />
              <span className="text-sm text-slate-500 font-medium">แตะเพื่อถ่ายรูปห้อง</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" // สั่งให้เปิดกล้องหลังทันที
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
          )}
        </div>

        {/* แสดงชื่อไฟล์และปุ่มกดส่ง */}
        {file && (
          <p className="mt-4 text-xs text-primary font-medium text-center truncate px-2">
            ไฟล์: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || status === "uploading"}
          className="w-full mt-6 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 disabled:bg-slate-200 disabled:text-slate-500 transition-all shadow-md shadow-primary/20 active:scale-[0.98]"
        >
          {status === "uploading" ? (
            <>
              <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              กำลังประมวลผล...
            </>
          ) : (
            <>
              <Upload size={20} />
              ส่งรูปภาพเข้าคอมพิวเตอร์
            </>
          )}
        </button>
      </div>
    </div>
  );
}