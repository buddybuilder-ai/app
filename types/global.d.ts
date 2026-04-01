declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        embedded?: boolean | string;
        arjs?: string;
        renderer?: string;
        'vr-mode-ui'?: string;
      }, HTMLElement>;
      'a-camera': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'look-controls'?: string;
        'rotation-reader'?: boolean | string;
      }, HTMLElement>;
      'a-entity': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string;
        position?: string;
        rotation?: string;
      }, HTMLElement>;
      'a-plane': React.detailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string;
        position?: string;
        rotation?: string;
        width?: string;
        height?: string;
        material?: string;
        color?: string;
      }, HTMLElement>;
      'a-assets': any;
      'a-asset-item': any;
    }
  }
}
export {};