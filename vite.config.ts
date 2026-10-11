import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// 直接导入组件模块，避免根导出入口将未使用的组件带入公共分包。
const elementPlusResolvers = () => ElementPlusResolver({ importStyle: 'sass' }).map(resolver => {
  if (typeof resolver === 'function') return resolver
  return {
  type: resolver.type,
  async resolve(name: string) {
    const result = await resolver.resolve(name)
    if (!result || typeof result === 'string' || !result.from.startsWith('element-plus')) return result
    const aliases: Record<string, string> = { Loading: 'loading', ElDropdownMenu: 'dropdown', ElDropdownItem: 'dropdown', ElFormItem: 'form' }
    const directory = aliases[name] || name.replace(/^El/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
    return { ...result, from: `element-plus/es/components/${directory}/index` }
  }
  }
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 从环境变量读取 base 路径，如果没有则使用默认值
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || '/'
  
  return {
    base,
    plugins: [
      vue(),
      AutoImport({
        resolvers: elementPlusResolvers(),
      }),
      Components({
        resolvers: elementPlusResolvers(),
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
        },
        '/sitemap.xml': {
          target: 'http://localhost:48080', changeOrigin: true,
          rewrite: () => '/admin-api/seo/sitemap.xml'
        },
        '/robots.txt': {
          target: 'http://localhost:48080', changeOrigin: true,
          rewrite: () => '/admin-api/seo/robots.txt'
        }
      }
    },
    build: {
      // Vite 7 调整了默认浏览器目标，这里保持原有兼容范围。
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      sourcemap: false,
      // 代码分割优化
      rollupOptions: {
        output: {
          // 分包策略
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                id.includes('/node_modules/vue/') ||
                id.includes('/node_modules/@vue/') ||
                id.includes('/node_modules/@vueuse/') ||
                id.includes('/node_modules/vue-demi/')
              ) return 'vue-core'
              if (id.includes('/node_modules/vue-router/')) return 'vue-router'
              if (id.includes('/node_modules/pinia/')) return 'pinia'
              if (['element-plus', '@element-plus'].some(p => id.includes(`/node_modules/${p}/`))) return 'element-plus'
              if (['axios', 'dayjs', 'dompurify'].some(p => id.includes(`/node_modules/${p}/`))) return 'utils'
            }
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
          drop_console: false,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.debug', 'console.info']
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
      include: ['vue', 'vue-router', 'pinia', 'element-plus', 'axios', 'dompurify']
    }
  }
})
