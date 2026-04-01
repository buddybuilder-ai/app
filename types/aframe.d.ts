// aframe.d.ts
import { DetailedHTMLProps, HTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        embedded?: boolean | string;
        arjs?: string;
        renderer?: string;
        'vr-mode-ui'?: string;
      }, HTMLElement>;
      'a-camera': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        'look-controls'?: string;
        'rotation-reader'?: boolean | string;
      }, HTMLElement>;
      'a-entity': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        id?: string;
        position?: string;
        rotation?: string;
      }, HTMLElement>;
      'a-plane': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        id?: string;
        position?: string;
        rotation?: string;
        width?: string;
        height?: string;
        material?: string;
        color?: string;
      }, HTMLElement>;
    }
  }
}