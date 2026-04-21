"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, Upload, CheckCircle2 } from "lucide-react";

export default function MobileUploadPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success">("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !sessionId) return;
    setStatus("uploading");

    const formData = new FormData();
    formData.append("image", file);

    try {
      // ยิงไปที่ Backend FastAPI (พอร์ต 8002 ตามที่คุณใช้)
      const response = await fetch(`http://192.168.1.126:8002/api/v1/chat/mobile-upload/${sessionId}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) setStatus("success");
    } catch (error) {
      console.error(error);
      // alert(`เกิดข้อผิดพลาด: ${error.message}`); // ดูว่ามันฟ้องว่า Network Error หรืออะไร
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold">ส่งข้อมูลเรียบร้อย!</h1>
        <p className="text-gray-500 mt-2">กรุณากลับไปดูที่หน้าจอคอมพิวเตอร์ของคุณ</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <h1 className="text-xl font-bold text-center mb-6">BuddyBuilder AI Camera</h1>
        
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
          <Camera className="h-12 w-12 text-slate-400 mb-2" />
          <span className="text-sm text-slate-500">แตะเพื่อถ่ายรูปห้อง</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
          {file && <p className="mt-2 text-xs text-blue-600 font-medium">{file.name}</p>}
        </label>

        <button
          onClick={handleUpload}
          disabled={!file || status === "uploading"}
          className="w-full mt-6 py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:bg-slate-300"
        >
          {status === "uploading" ? "กำลังประมวลผล..." : <><Upload size={20} /> ส่งรูปภาพเข้าคอมพิวเตอร์</>}
        </button>
      </div>
    </div>
  );
}