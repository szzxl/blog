import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 开发环境不使用 base，生产环境使用 /web/
  const base = mode === 'production' ? '/web/' : '/'
  
  return {
    base,
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver({
          importStyle: 'sass'
        })],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 80,
      host: '0.0.0.0',
      hmr: {
        overlay: false
      },
      proxy: {
        '/admin-api': {
          target: 'http://localhost:48080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/admin-api/, '/admin-api')
        }
      }
    },
    build: {
      sourcemap: false,
      // 代码分割优化
      rollupOptions: {
        output: {
          // 分包策略
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'element-plus': ['element-plus', '@element-plus/icons-vue'],
            'utils': ['axios', 'dayjs', '@vueuse/core']
          },
          // 文件名优化
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.')
            let extType = info?.[info.length - 1]
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name || '')) {
              extType = 'images'
            } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
              extType = 'fonts'
            }
            return `${extType}/[name]-[hash].[ext]`
          }
        }
      },
      // 压缩优化
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log']
        }
      },
      // chunk 大小警告阈值
      chunkSizeWarningLimit: 1000,
      // 关闭 brotli 压缩大小报告，提升构建速度
      reportCompressedSize: false
    },
    css: {
      devSourcemap: false
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'element-plus', 'axios']
    }
  }
})
