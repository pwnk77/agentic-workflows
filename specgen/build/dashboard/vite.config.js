import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
export default defineConfig({
    plugins: [react()],
    base: '/dashboard/',
    build: {
        outDir: 'build',
        assetsDir: 'assets',
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            }
        }
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:7851',
                changeOrigin: true
            },
            '/ws': {
                target: 'ws://localhost:7851',
                ws: true
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    }
});
//# sourceMappingURL=vite.config.js.map