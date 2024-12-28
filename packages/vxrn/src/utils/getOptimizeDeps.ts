import type { UserConfig } from 'vite'
import { webExtensions } from '../constants'

// TODO we need to traverse to get sub-deps...

export function getOptimizeDeps(mode: 'build' | 'serve') {
  const needsInterop = [
    '@vxrn/safe-area',
    'react',
    'react-is',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'react/compiler-runtime',
    'react-dom',
    'react-dom/server',
    'react-dom/client',
    'react-native-web-internals',
    'react-native-web',
    '@react-native-masked-view/masked-view',
    'url-parse',
    'query-string',
    'escape-string-regexp',
    'use-latest-callback',
    'fast-deep-equal',
    '@supabase/auth-helpers-react',
    'core-js',
    'parse-numeric-range',
    'use-sync-external-store',
    'use-sync-external-store/shim',
    'expo-constants',
    'expo-linking',
    'inline-style-prefixer',
    '@docsearch/react',
    '@algolia/autocomplete-core',
    '@algolia/autocomplete-plugin-algolia-insights',
    '@algolia/autocomplete-shared',
    'moti',
  ]

  const depsToOptimize = [
    ...needsInterop,

    // for react-native react 19 swap
    'scheduler',

    'fast-xml-parser',
    'set-cookie-parser',
    'ipaddr.js',
    'cross-fetch',
    'pg',
    '@rocicorp/zero',
    'react-scan',
    'react-native-svg',
    'react-native-screens',

    'lodash',
    'moti/author',

    // added these when using a worker env
    'reading-time',
    'mdx-bundler/client',
    'gray-matter',
    'glob',
    'memoize-one',
    'css-in-js-utils',
    'hyphenate-style-name',
    'use-sync-external-store',
    'react-native-reanimated', // uses .web.js extensions
    '@react-navigation/core',
    '@react-navigation/native',
    '@react-navigation/elements',
    '@react-navigation/bottom-tabs',
    '@react-navigation/native-stack',
    'one',
    'one/server-render',
    'styleq',
    'fbjs',
    'one/headers',
    '@vxrn/universal-color-scheme',
    '@vxrn/color-scheme',
    'requires-port',
    'querystringify',
    'compare-versions',
    'strict-uri-encode',
    'expo-document-picker',
    'decode-uri-component',
    'split-on-first',
    'filter-obj',
    'warn-once',
    '@radix-ui/react-compose-refs',
    '@radix-ui/react-slot',
    'expo-splash-screen',
    'nanoid',
    'swr',
    'swr/mutation',
    'one',
    'one/zero',
    'one/headers',
    'one/server-render',
    'refractor/lang/tsx',
    'invariant',
    'tamagui/linear-gradient',
    '@tamagui/linear-gradient',
    '@react-native/normalize-color',
    'expo-modules-core',
    'expo-status-bar',
    'react-native-web',
    'react-native-web-lite',
    'react-native',
    '@floating-ui/react',
    '@floating-ui/react-dom',
    '@tamagui/react-native-web-internals',
    '@tamagui/constants',
    '@tamagui/react-native-web',
    '@tamagui/button',
    '@tamagui/animate-presence',
    '@tamagui/presence-child',
    '@tamagui/config/v3',
    '@tamagui/config',
    '@tamagui/react-native-media-driver',
    '@tamagui/animations-moti',
    '@tamagui/animations-react-native',
    '@tamagui/react-native-use-responder-events',
    '@tamagui/react-native-svg',
    '@tamagui/alert-dialog',
    '@react-navigation/routers',
    '@tamagui/simple-hash',
    '@tamagui/one-theme',
    '@tamagui/use-did-finish-ssr',
    '@tamagui/use-event',
    '@tamagui/portal',
    '@tamagui/compose-refs',
    '@tamagui/use-debounce',
    '@tamagui/avatar',
    '@tamagui/core',
    '@tamagui/dialog',
    '@tamagui/group',
    '@tamagui/helpers-icon',
    '@tamagui/helpers',
    '@tamagui/image',
    '@tamagui/image-next',
    '@tamagui/lucide-icons',
    '@tamagui/animations-moti',
    '@tamagui/popover',
    '@tamagui/popper',
    '@tamagui/scroll-view',
    '@tamagui/select',
    '@tamagui/sheet',
    '@tamagui/switch',
    '@tamagui/tabs',
    '@tamagui/toast',
    '@tamagui/toggle-group',
    '@tamagui/tooltip',
    '@tamagui/use-window-dimensions',
    '@tamagui/web',
    'tamagui',
    'react-native-web',
    'reforest',
  ]

  if (mode === 'build') {
    // breaks in serve mode
    depsToOptimize.push('@babel/runtime')
  }

  return {
    needsInterop,
    depsToOptimize,
    optimizeDeps: {
      include: depsToOptimize,
      exclude: ['util', '@swc/wasm', '@swc/core-darwin-arm64', 'moti/author'],
      needsInterop,
      // TODO this should go away! native doesnt want this
      esbuildOptions: {
        target: 'esnext',
        resolveExtensions: webExtensions,
      },
    } satisfies UserConfig['optimizeDeps'],
  }
}
