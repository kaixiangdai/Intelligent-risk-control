import { resolve } from 'path';
import { ConfigEnv, UserConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { wrapperEnv } from './build/utils';
import pkg from './package.json';

// aq
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

process.env.VITE_APP_VERSION = pkg.version;
if (process.env.NODE_ENV === 'production') {
  process.env.VITE_APP_BUILD_EPOCH = new Date().getTime().toString();
}

export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();

  const env = loadEnv(mode, root);

  // The boolean type read by loadEnv is a string. This function can be converted to boolean type
  const viteEnv = wrapperEnv(env);

  const { VITE_PUBLIC_PATH, VITE_DROP_CONSOLE, VITE_PORT } = viteEnv;

  // const isBuild = command === 'build';

  return {
    base: VITE_PUBLIC_PATH,
    root,
    server: {
      // Listening on all local IPs
      host: true,
      port: VITE_PORT,
      // Load proxy configuration from .env
      // proxy: createProxy(VITE_PROXY),
    },
    plugins: [
      vue(),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          '@vueuse/head',
          'pinia',
          {
            '@/store': ['useStore'],
          },
        ],
        dts: 'src/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
        },
      }),
      Components({
        dirs: ['src/components'],
        extensions: ['vue'],
        resolvers: [AntDesignVueResolver()],
      }),
    ],
    esbuild: {
      pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : [],
    },
    build: {
      target: 'es2015',
      cssTarget: 'chrome80',
      outDir: 'dist',
      // minify: 'terser',
      /**
       * 当 minify=“minify:'terser'” 解开注释
       * Uncomment when minify="minify:'terser'"
       */
      // terserOptions: {
      //   compress: {
      //     keep_infinity: true,
      //     drop_console: VITE_DROP_CONSOLE,
      //   },
      // },
      // Turning off brotliSize display can slightly reduce packaging time
      brotliSize: false,
      chunkSizeWarningLimit: 2000,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '#': resolve(__dirname, './type'),
      },
    },
  };
};
// export default defineConfig({

// })

// import { resolve } from 'path';
// import { defineConfig } from 'vite';
// import vue from '@vitejs/plugin-vue';
// import AutoImport from 'unplugin-auto-import/vite';
// import Components from 'unplugin-vue-components/vite';
// import pkg from './package.json';

// process.env.VITE_APP_VERSION = pkg.version;
// if (process.env.NODE_ENV === 'production') {
//   process.env.VITE_APP_BUILD_EPOCH = new Date().getTime().toString();
// }

// export default defineConfig({
//   plugins: [
//     vue(),
//     AutoImport({
//       imports: [
//         'vue',
//         'vue-router',
//         '@vueuse/head',
//         'pinia',
//         {
//           '@/store': ['useStore'],
//         },
//       ],
//       dts: 'src/auto-imports.d.ts',
//       eslintrc: {
//         enabled: true,
//       },
//     }),
//     Components({
//       dirs: ['src/components'],
//       extensions: ['vue'],
//     }),
//   ],
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, './src'),
//     },
//   },
// });
