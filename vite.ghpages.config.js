import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const IMPORT_MAP = {
  imports: {
    react: 'https://esm.sh/react@18.3.1',
    'react-dom': 'https://esm.sh/react-dom@18.3.1',
    'react-dom/client': 'https://esm.sh/react-dom@18.3.1/client',
    'react/jsx-runtime': 'https://esm.sh/react@18.3.1/jsx-runtime',
    three: 'https://esm.sh/three@0.169.0',
    'three/examples/jsm/postprocessing/SMAAPass.js':
      'https://esm.sh/three@0.169.0/examples/jsm/postprocessing/SMAAPass.js?external=three',
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
      const faviconTag = `    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23050505'/%3E%3Cpolygon points='16,5 27,16 16,27 5,16' fill='%23c8a86b'/%3E%3C/svg%3E" />\n`;
      let out = html.includes('rel="icon"')
        ? html
        : html.replace('    <meta name="theme-color" content="#050505" />', `    <meta name="theme-color" content="#050505" />\n${faviconTag}`);
      return out.replace('    <script src="./site-config.js"></script>', `${importMapTag}    <script src="./site-config.js"></script>`);
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
        'three/examples/jsm/postprocessing/SMAAPass.js',
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
