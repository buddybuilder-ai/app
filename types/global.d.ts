import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          embedded?: boolean | string;
          arjs?: string;
          renderer?: string;
          'vr-mode-ui'?: string;
          [key: string]: unknown;
        },
        HTMLElement
      >;
      'a-camera': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'look-controls'?: string;
          'rotation-reader'?: boolean | string;
          [key: string]: unknown;
        },
        HTMLElement
      >;
      'a-entity': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id?: string;
          position?: string;
          rotation?: string;
          [key: string]: unknown;
        },
        HTMLElement
      >;
      'a-plane': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id?: string;
          position?: string;
          rotation?: string;
          width?: string;
          height?: string;
          material?: string;
          color?: string;
          [key: string]: unknown;
        },
        HTMLElement
      >;
      'a-assets': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      'a-asset-item': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id?: string;
          src?: string;
        },
        HTMLElement
      >;
      'a-sky': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          color?: string;
          src?: string;
        },
        HTMLElement
      >;
      'a-box': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          position?: string;
          rotation?: string;
          color?: string;
          [key: string]: unknown;
        },
        HTMLElement
      >;
      'a-sphere': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          position?: string;
          radius?: string;
          color?: string;
          [key: string]: unknown;
        },
        HTMLElement
      >;
      'a-cylinder': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          position?: string;
          radius?: string;
        },
        HTMLElement
      >;
      'a-cone': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          position?: string;
          color?: string;
          'radius-bottom'?: string;
        },
        HTMLElement
      >;
      'a-torus': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          position?: string;
          color?: string;
          'radius-tube'?: string;
        },
        HTMLElement
      >;
      'a-torus-knot': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          position?: string;
          color?: string;
          radius?: string;
        },
        HTMLElement
      >;
      'a-text': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          color?: string;
          position?: string;
        },
        HTMLElement
      >;
      'a-light': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          type?: string;
          color?: string;
          position?: string;
        },
        HTMLElement
      >;
    }
  }
}
