from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import base64
import matplotlib
matplotlib.use('Agg') # ป้องกัน Error GUI
import matplotlib.pyplot as plt
import cv2
import numpy as np
import time

app = Flask(__name__)
CORS(app)

def process_data(data):
    sid = data['student_id']
    folder = f"scan_results_{sid}"
    os.makedirs(folder, exist_ok=True)
    points = data['room_data']
    x_coords = [p['x'] for p in points]
    z_coords = [p['z'] for p in points]

    for p in points:
        img_data = p['image'].split(',')[1]
        with open(f"{folder}/angle_{p['angle']}.jpg", "wb") as fh:
            fh.write(base64.b64decode(img_data))

    min_x, max_x = min(x_coords), max(x_coords)
    min_z, max_z = min(z_coords), max(z_coords)
    sq_x, sq_z = [min_x, max_x, max_x, min_x, min_x], [min_z, min_z, max_z, max_z, min_z]

    plt.figure(figsize=(8, 8))
    plt.plot(sq_x, sq_z, 'r--', label='Calculated Layout')
    plt.scatter(x_coords, z_coords, c='blue', s=20)
    plt.fill(sq_x, sq_z, 'skyblue', alpha=0.2)
    plt.title(f"BuddyBuilder.ai Layout - ID: {sid}")
    plt.grid(True)
    plt.savefig(f"{folder}/room_layout.png")
    plt.close() # ปิดเพื่อป้องกันโปรแกรมค้าง
    print(f"✅ บันทึกผังห้อง: {folder}/room_layout.png")

def stitch_panorama(student_id):
    folder = f"scan_results_{student_id}"
    if not os.path.exists(folder):
        print(f"❌ ไม่พบโฟลเดอร์: {folder}")
        return

    # 1. เตรียมไฟล์และหน่วงเวลาให้ OS เขียนไฟล์เสร็จ
    time.sleep(1.5) 
    files = [f for f in os.listdir(folder) if f.startswith('angle_') and f.endswith('.jpg')]
    files.sort(key=lambda x: int(x.split('_')[1].split('.')[0]))
    
    if len(files) < 2:
        print("❌ รูปภาพไม่พอสำหรับการประมวลผล")
        return

    images = []
    for f in files:
        img = cv2.imread(os.path.join(folder, f))
        if img is not None and img.size > 0:
            images.append(img)

    print(f"📷 กำลังประมวลผลรูปภาพ {len(images)} ใบ...")

    # --- แบบที่ 1: การต่อแบบเนียน (OpenCV Stitcher) ---
    stitcher = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
    status, result_stitch = stitcher.stitch(images)
    
    if status == cv2.Stitcher_OK:
        path_stitch = f"{folder}/full_panorama_smooth_{student_id}.jpg"
        cv2.imwrite(path_stitch, result_stitch)
        print(f"✅ [Smooth] ต่อภาพแบบเนียนสำเร็จ: {path_stitch}")
    else:
        print(f"⚠️ [Smooth] ต่อแบบเนียนไม่สำเร็จ (Status: {status}) เนื่องจากจุดเชื่อมต่อไม่พอ")

    # --- แบบที่ 2: การต่อแบบดื้อ (Simple Concatenation) ---
    # วิธีนี้จะได้ภาพครบ 360 องศาแน่นอน
    try:
        # ปรับขนาดทุกรูปให้สูงเท่ากัน (เช่น 600px) เพื่อให้ต่อกันได้
        standard_h = 600
        resized_imgs = []
        for img in images:
            h, w = img.shape[:2]
            new_w = int(w * standard_h / h)
            resized_imgs.append(cv2.resize(img, (new_w, standard_h)))
        
        # นำรูปมาวางเรียงต่อกันในแนวนอน
        result_concat = np.hstack(resized_imgs)
        path_concat = f"{folder}/full_panorama_complete_{student_id}.jpg"
        cv2.imwrite(path_concat, result_concat)
        print(f"✅ [Complete] ต่อภาพแบบครบถ้วนสำเร็จ: {path_concat}")
    except Exception as e:
        print(f"❌ [Complete] เกิดข้อผิดพลาดในการเรียงภาพ: {e}")

        
@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/upload-room-data', methods=['POST'])
def handle_data():
    data = request.get_json(silent=True)
    if data:
        sid = data['student_id']
        with open('latest_full_scan.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        print(f"✅ ได้รับข้อมูลจาก {sid} เริ่มประมวลผล...")
        process_data(data)
        stitch_panorama(sid) # เรียกใช้ฟังก์ชันรวมภาพที่นี่
        return jsonify({"status": "success"}), 200
    return jsonify({"status": "error"}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)