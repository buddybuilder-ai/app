"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import * as THREE from "three";

// 1. สร้าง Interface มารองรับ Props ของ A-Frame โดยเฉพาะ
// ใช้ unknown แทน any เพื่อให้ผ่าน ESLint และ [key: string] เพื่อให้รับ attribute อะไรก็ได้
interface AFrameProps {
  children?: ReactNode;
  [key: string]: unknown; 
}

// 2. ประกาศตัวแปรโดยใช้ Interface ที่เราสร้างขึ้น
const AScene = 'a-scene' as unknown as React.FC<AFrameProps>;
const ACamera = 'a-camera' as unknown as React.FC<AFrameProps>;
const AEntity = 'a-entity' as unknown as React.FC<AFrameProps>;

// --- Types & Interfaces ---
interface ScanDataItem {
  angle: number;
  image: string;
  x: number;
  z: number;
}

interface FrameData {
  canvas: HTMLCanvasElement;
  base64: string;
}

// Interface สำหรับ A-Frame Elements
interface AFrameEntity extends HTMLElement {
  object3D: {
    rotation: { y: number };
    position: { x: number; z: number };
  };
  getObject3D(name: string): {
    material: {
      map: THREE.Texture;
      color: { setHex(hex: number): void };
      opacity: number;
      needsUpdate: boolean;
    };
  } | null;
}

export function PanoramaScanner() {
  const [isMounted, setIsMounted] = useState(false);
  const [arReady, setArReady] = useState(false);
  const [status, setStatus] = useState("กำลังเตรียมสภาพแวดล้อม 3D...");
  // ลบ progress ออกหากไม่ได้ใช้ใน UI อื่น นอกจากใน setStatus เพื่อลด warning
  const [, setProgress] = useState(0); 

  const capturedAngles = useRef(new Set<number>());
  const scanData = useRef<ScanDataItem[]>([]);
  const isSent = useRef(false);
  const STEP = 15;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const initAR = () => {
    const wall = document.querySelector("#panorama-wall");
    if (!wall) return;
    wall.innerHTML = "";

    for (let i = 0; i < 360; i += STEP) {
      const plane = document.createElement("a-plane");
      const rad = i * (Math.PI / 180);
      plane.setAttribute("id", `slice-${i}`);
      plane.setAttribute(
        "position",
        `${-Math.sin(rad) * 4} 0 ${-Math.cos(rad) * 4}`,
      );
      plane.setAttribute("rotation", `0 ${i} 0`);
      plane.setAttribute("width", "1.5");
      plane.setAttribute("height", "5");
      plane.setAttribute(
        "material",
        "shader: flat; color: #000000; side: double; opacity: 0.5",
      );
      wall.appendChild(plane);
    }
    renderLoop();
  };

  const captureFrame = (): FrameData | null => {
    const video = document.querySelector("video");
    if (!video) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    return {
      canvas: canvas,
      base64: canvas.toDataURL("image/jpeg", 0.8),
    };
  };

  const renderLoop = () => {
    // ใช้ Type Casting เพื่อเข้าถึง object3D
    const camera = document.querySelector("a-camera") as unknown as AFrameEntity;

    if (!camera || !camera.object3D) {
      requestAnimationFrame(renderLoop);
      return;
    }

    const rotationRad = camera.object3D.rotation.y;
    const degrees = rotationRad * (180 / Math.PI);

    let currentAngle = Math.round(degrees / STEP) * STEP;
    currentAngle = ((currentAngle % 360) + 360) % 360;

    if (!capturedAngles.current.has(currentAngle)) {
      const slice = document.querySelector(`#slice-${currentAngle}`) as unknown as AFrameEntity;
      
      if (slice) {
        const frameData = captureFrame();
        const AFRAME_GLOBAL = (window as { AFRAME?: { THREE: typeof THREE } }).AFRAME;

        if (frameData && AFRAME_GLOBAL) {
          const mesh = slice.getObject3D("mesh");
          const THREE = AFRAME_GLOBAL.THREE;

          if (mesh && THREE) {
            const texture = new THREE.CanvasTexture(frameData.canvas);
            mesh.material.map = texture;
            mesh.material.color.setHex(0xffffff);
            mesh.material.opacity = 1;
            mesh.material.needsUpdate = true;
          }

          capturedAngles.current.add(currentAngle);

          scanData.current.push({
            angle: currentAngle,
            image: frameData.base64,
            x: slice.object3D.position.x,
            z: slice.object3D.position.z,
          });

          const newProgress = Math.round(
            (capturedAngles.current.size / (360 / STEP)) * 100,
          );
          setProgress(newProgress);
          setStatus(`เก็บข้อมูลแล้ว: ${newProgress}%`);

          if (newProgress >= 100 && !isSent.current) {
            isSent.current = true;
            handleUpload();
          }
        }
      }
    }
    requestAnimationFrame(renderLoop);
  };

  const handleUpload = async () => {
    setStatus("กำลังส่งรูปภาพ...");
    try {
      const response = await fetch("/api/upload-room-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: "BuddyBuilder.ai",
          student_id: "66073169",
          room_data: scanData.current,
        }),
      });
      if (response.ok) {
        setStatus("สำเร็จ! บันทึกข้อมูลเรียบร้อย");
        alert("บันทึกข้อมูลเรียบร้อย!");
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + err);
    }
  };

  useEffect(() => {
    if (!isMounted) return;

    const loadScript = (src: string, id: string) => {
      return new Promise<void>((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.id = id;
        s.src = src;
        s.crossOrigin = "anonymous";
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
      });
    };

    const setupAR = async () => {
      try {
        setStatus("กำลังโหลดระบบ A-Frame...");
        await loadScript(
          "https://aframe.io/releases/1.3.0/aframe.min.js",
          "aframe-script",
        );

        setStatus("กำลังโหลดระบบ AR.js...");
        await loadScript(
          "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js",
          "arjs-script",
        );
        setArReady(true);
      } catch (err) {
        console.error(err);
        setStatus("❌ โหลดสคริปต์ไม่สำเร็จ กรุณารีเฟรช");
      }
    };

    setupAR();
  }, [isMounted]);

  useEffect(() => {
    if (!arReady) return;

    const startScanning = () => {
      setStatus("หมุนตัวช้าๆ เพื่อเก็บภาพ (0%)");
      initAR();
    };

    window.addEventListener("arjs-video-loaded", startScanning);

    const checkVideo = setInterval(() => {
      const video = document.querySelector("video");
      if (video && video.readyState >= 2) {
        clearInterval(checkVideo);
        // ใช้สถานะปัจจุบันจาก Ref หรือเช็คเงื่อนไขที่ปลอดภัย
        startScanning();
      }
    }, 1000);

    return () => {
      window.removeEventListener("arjs-video-loaded", startScanning);
      clearInterval(checkVideo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arReady]);

  const forceCameraStyle = `
    body { background-color: transparent !important; overflow: hidden !important; }
    #arjs-video {
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      z-index: 9999990 !important; 
      object-fit: cover !important;
    }
    .a-canvas { 
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      width: 100vw !important; height: 100vh !important;
      z-index: 9999995 !important; 
      background-color: transparent !important;
    }
    .a-enter-vr, .a-enter-ar { display: none !important; }
  `;

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-[9999999] bg-transparent pointer-events-none">
      <style dangerouslySetInnerHTML={{ __html: forceCameraStyle }} />

      <div className="absolute top-10 w-full text-center z-[9999999]">
        <span className="bg-black/80 px-4 py-2 rounded-full text-yellow-400 font-bold text-xl shadow-lg">
          {status}
        </span>
      </div>

      {arReady && (
        <div className="h-full w-full pointer-events-auto">
          
          <AScene
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false;"
          renderer="logarithmicDepthBuffer: true; alpha: true;"
          vr-mode-ui="enabled: false"
        >
          <ACamera look-controls="enabled: true" rotation-reader></ACamera>
          <AEntity id="panorama-wall"></AEntity>
        </AScene>
        </div>
      )}
    </div>
  );
}