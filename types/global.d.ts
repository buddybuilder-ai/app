// global.d.ts
import { DetailedHTMLProps, HTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-camera': any;
      'a-entity': any;
      'a-plane': any;
      'a-assets': any;
      'a-asset-item': any;
      // เพิ่ม tag อื่นๆ ของ A-Frame ที่คุณใช้ที่นี่
    }
  }
}
export {}; // บอก TS ว่านี่เป็น module