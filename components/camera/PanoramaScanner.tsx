"use client"

import { useEffect, useRef, useState } from "react"

export function PanoramaScanner() {
  const [isMounted, setIsMounted] = useState(false)
  const [arReady, setArReady] = useState(false)
  const [status, setStatus] = useState("กำลังเตรียมสภาพแวดล้อม 3D...")
  const [progress, setProgress] = useState(0)
  
  const capturedAngles = useRef(new Set<number>())
  const scanData = useRef<any[]>([])
  const isSent = useRef(false)
  const STEP = 15

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const initAR = () => {
    const wall = document.querySelector('#panorama-wall')
    if (!wall) return
    wall.innerHTML = '' 

    for (let i = 0; i < 360; i += STEP) {
      const plane = document.createElement('a-plane')
      const rad = i * (Math.PI / 180)
      plane.setAttribute('id', `slice-${i}`)
      plane.setAttribute('position', `${-Math.sin(rad) * 4} 0 ${-Math.cos(rad) * 4}`)
      plane.setAttribute('rotation', `0 ${i} 0`)
      plane.setAttribute('width', '1.5')
      plane.setAttribute('height', '5')
      
      // กลับมาใช้ String แต่เซ็ตอัปล่วงหน้า ป้องกัน Shader Error
      plane.setAttribute('material', 'shader: flat; color: #000000; side: double; opacity: 0.5')
      wall.appendChild(plane)
    }
    renderLoop()
  }

const captureFrame = () => {
    const video = document.querySelector('video')
    if (!video) return null
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // 🚨 ส่งกลับทั้งตัว Canvas (เอาไว้วาด 3D) และ Base64 (เอาไว้ส่ง API)
    return {
      canvas: canvas,
      base64: canvas.toDataURL('image/jpeg', 0.8)
    }
  }

  const renderLoop = () => {
    const camera = document.querySelector('a-camera')
    if (!camera || !(camera as any).object3D) { 
      requestAnimationFrame(renderLoop); 
      return; 
    }

    const rotationRad = (camera as any).object3D.rotation.y
    const degrees = rotationRad * (180 / Math.PI)

    let currentAngle = Math.round(degrees / STEP) * STEP
    currentAngle = ((currentAngle % 360) + 360) % 360

    if (!capturedAngles.current.has(currentAngle)) {
      const slice = document.querySelector(`#slice-${currentAngle}`)
      if (slice) {
        const frameData = captureFrame() // ดึงค่าแบบใหม่มา
        if (frameData && (window as any).AFRAME) {
          
          // 🚨 ท่าไม้ตาย: ล้วงตับไปถึง Three.js สั่งวาดรูปจาก Canvas ตรงๆ ข้ามระบบ A-Frame ไปเลย!
          const mesh = (slice as any).getObject3D('mesh');
          const THREE = (window as any).AFRAME.THREE;
          
          if (mesh && THREE) {
            const texture = new THREE.CanvasTexture(frameData.canvas);
            mesh.material.map = texture;
            mesh.material.color.setHex(0xffffff); // เปลี่ยนเป็นสีขาวสว่าง
            mesh.material.opacity = 1;
            mesh.material.needsUpdate = true;
          }

          capturedAngles.current.add(currentAngle)
          
          // ส่ง API ด้วย Base64 เหมือนเดิม
          scanData.current.push({
            angle: currentAngle,
            image: frameData.base64,
            x: (slice as any).object3D.position.x,
            z: (slice as any).object3D.position.z
          })

          const newProgress = Math.round((capturedAngles.current.size / (360 / STEP)) * 100)
          setProgress(newProgress)
          setStatus(`เก็บข้อมูลแล้ว: ${newProgress}%`)

          if (newProgress >= 100 && !isSent.current) {
            isSent.current = true
            handleUpload()
          }
        }
      }
    }
    requestAnimationFrame(renderLoop)
  }

  const handleUpload = async () => {
    setStatus("กำลังส่งรูปภาพ...")
    try {
      const response = await fetch('/api/upload-room-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: "BuddyBuilder.ai",
          student_id: "66073169",
          room_data: scanData.current
        })
      })
      if (response.ok) {
        setStatus("สำเร็จ! บันทึกข้อมูลเรียบร้อย")
        alert("บันทึกข้อมูลเรียบร้อย!")
      }
    } catch (err) {
      alert("Error: " + err)
    }
  }

    useEffect(() => {
    if (!isMounted) return

    const loadScript = (src: string, id: string) => {
      return new Promise<void>((resolve, reject) => {
        if (document.getElementById(id)) { resolve(); return; }
        const s = document.createElement("script")
        s.id = id
        s.src = src
        s.crossOrigin = "anonymous"
        s.onload = () => resolve()
        s.onerror = (e) => reject(e)
        document.head.appendChild(s)
      })
    }

    const setupAR = async () => {
      try {
        setStatus("กำลังโหลดระบบ A-Frame...")
        await loadScript("https://aframe.io/releases/1.3.0/aframe.min.js", "aframe-script")

        setStatus("กำลังโหลดระบบ AR.js...")
        await loadScript("https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js", "arjs-script")

        console.log("✅ Scripts โหลดเสร็จสมบูรณ์")
        setArReady(true) // ให้ React สร้าง <a-scene> อย่างปลอดภัย
      } catch (err) {
        setStatus("❌ โหลดสคริปต์ไม่สำเร็จ กรุณารีเฟรช")
      }
    }

    setupAR()
  }, [isMounted])

    useEffect(() => {
    if (!arReady) return

    const startScanning = () => {
      setStatus("หมุนตัวช้าๆ เพื่อเก็บภาพ (0%)")
      initAR()
    }

    // ดักจับ Event ทันทีที่วิดีโอพร้อม
    window.addEventListener('arjs-video-loaded', startScanning)

    // Fallback: สอดแนมหากล้องเผื่อ Event ทำงานพลาด
    const checkVideo = setInterval(() => {
      const video = document.querySelector('video')
      // ถ้าวิดีโอมีขนาดแล้ว แปลว่ากล้องเปิดสำเร็จ
      if (video && video.readyState >= 2) {
        clearInterval(checkVideo)
        if (status.includes("กำลังโหลด")) {
          startScanning()
        }
      }
    }, 1000)

    return () => {
      window.removeEventListener('arjs-video-loaded', startScanning)
      clearInterval(checkVideo)
    }
  }, [arReady, status])

  // 🚨 CSS ดันระดับ 10 ล้าน! ชนะ Navbar และทุก UI ในจักรวาลแน่นอน
  const forceCameraStyle = `
    body { background-color: transparent !important; overflow: hidden !important; }
    
    #arjs-video {
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      z-index: 9999990 !important; 
      object-fit: cover !important;
      /* ปล่อยให้ AR.js ควบคุม Width/Height เองเพื่อแก้บั๊ก Invalid Array Length */
    }
    
    .a-canvas { 
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      width: 100vw !important; height: 100vh !important;
      z-index: 9999995 !important; 
      background-color: transparent !important;
    }
    .a-enter-vr, .a-enter-ar { display: none !important; }
  `

  if (!isMounted) return null

  return (
    // ครอบด้วย Z-index สูงสุดทะลุจอ
    <div className="fixed inset-0 z-[9999999] bg-transparent pointer-events-none">
      <style dangerouslySetInnerHTML={{ __html: forceCameraStyle }} />

      {/* UI สถานะอยู่ชั้นบนสุดเสมอ */}
      <div className="absolute top-10 w-full text-center z-[9999999]">
        <span className="bg-black/80 px-4 py-2 rounded-full text-yellow-400 font-bold text-xl shadow-lg">
          {status}
        </span>
      </div>

      {/* เมื่อ Script โหลดเสร็จค่อยสั่ง React วาด a-scene แบบคลีนๆ */}
      {arReady && (
        <div className="h-full w-full pointer-events-auto">
          {/* @ts-ignore */}
<a-scene 
            embedded 
            arjs="sourceType: webcam; debugUIEnabled: false;"
            renderer="logarithmicDepthBuffer: true; alpha: true;"
            vr-mode-ui="enabled: false"
          >
            {/* 🚨 แก้ตรงนี้: เติม look-controls เข้าไป */}
            <a-camera look-controls="enabled: true" rotation-reader></a-camera>
            
            {/* @ts-ignore */}
            <a-entity id="panorama-wall"></a-entity>
          </a-scene>
        </div>
      )}
    </div>
  )
}