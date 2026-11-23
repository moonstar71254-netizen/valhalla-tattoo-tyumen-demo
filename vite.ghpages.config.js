import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const IMPORT_MAP = {
  imports: {
    react: 'https://esm.sh/react@18.3.1',
    'react-dom': 'https://esm.sh/react-dom@18.3.1',
    'react-dom/client': 'https://esm.sh/react-dom@18.3.1/client',
    'react/jsx-runtime': 'https://esm.sh/react@18.3.1/jsx-runtime',
    three: 'https://esm.sh/three@0.169.0',
    '@react-three/fiber': 'https://esm.sh/@react-three/fiber@8.17.10?external=react,react-dom,three',
    '@react-three/drei':
      'https://esm.sh/@react-three/drei@9.114.3?external=react,react-dom,three,@react-three/fiber',
    gsap: 'https://esm.sh/gsap@3.12.5',
    'gsap/Observer': 'https://esm.sh/gsap@3.12.5/Observer',
  },
};

function injectImportMapPlugin() {
  return {
    name: 'inject-ghpages-importmap',
    transformIndexHtml(html) {
      const importMapTag = `    <script type="importmap">\n${JSON.stringify(IMPORT_MAP, null, 2)
        .split('\n')
        .map((line) => `      ${line}`)
        .join('\n')}\n    </script>\n`;
      return html.replace('    <script src="./site-config.js"></script>', `${importMapTag}    <script src="./site-config.js"></script>`);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), injectImportMapPlugin()],
  build: {
    outDir: 'dist-ghpages',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        'gsap',
        'gsap/Observer',
      ],
      output: {
        entryFileNames: 'assets/index-[hash].js',
        chunkFileNames: 'assets/chunk-[hash].js',
        assetFileNames: 'assets/index-[hash].[ext]',
      },
    },
  },
});
