import { assertString } from './assert'
import { type DepPatch, bailIfExists, bailIfUnchanged } from './patches'

export const depPatches: DepPatch[] = [
  {
    module: 'h3',
    patchFiles: {
      'dist/index.mjs': (contents) => {
        assertString(contents)
        bailIfExists(contents, '/** patch-version-1 **/')
        return contents.replace(
          `function getProxyRequestHeaders(event) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name)) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}`,
          `function getProxyRequestHeaders(event) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name)) {
      headers[name] = reqHeaders[name];
    }
  }

  // The expoManifestRequestHandlerPlugin (Vite plugin) needs the original request host so that it can compose URLs that can be accessed by physical devices. This won't be needed once we retire h3 and use the Vite Dev Server directly.
  // This may not work if one installed vxrn from NPM since this patch may not apply.
  const originalHost = reqHeaders.host;
  if (originalHost) {
    headers['X-Forwarded-Host'] = originalHost;
  }

  return headers;
}`
        )
      },
    },
  },

  // Older versions of the cli-config package will not look for `.cjs` files when loading the config. This isn't necessary for v14.x (which comes with RN 0.75). See: https://hackmd.io/@z/SJghMPN6C.
  {
    module: '@react-native-community/cli-config',
    patchFiles: {
      version: '^13',
      'build/readConfigFromDisk.js': (contents) => {
        assertString(contents)

        return contents
          .replace(
            `['react-native.config.js']`,
            `['react-native.config.js', 'react-native.config.cjs']`
          )
          .replace(
            'searchPlaces,',
            `searchPlaces, loaders: { '.cjs': _cosmiconfig().default.loadJs },`
          )
          .replace(
            'stopDir: rootFolder,',
            `stopDir: rootFolder, loaders: { '.cjs': _cosmiconfig().default.loadJs },`
          )
      },
    },
  },

  {
    module: '@react-native-masked-view/masked-view',
    patchFiles: {
      '**/*.js': ['flow', 'swc'],
    },
  },

  {
    module: 'react-native-vector-icons',
    patchFiles: {
      '**/*.js': ['jsx', 'flow'],
    },
  },

  {
    module: 'react-native-webview',
    patchFiles: {
      '**/*.js': ['jsx'],
    },
  },

  // {
  //   module: 'rollup',
  //   patchFiles: {
  //     'dist/es/shared/node-entry.js': (contents) => {
  //       assertString(contents)
  //       // fixes problem with @sentry/react-native 5.5.0 using setimmediate polyfill causing error
  //       contents = contents.replace(
  //         `return this.exportNamesByVariable.get(variable)[0];`,
  //         `return this.exportNamesByVariable.get(variable)?.[0];`
  //       )

  //       // fix https://github.com/rollup/rollup/issues/5770
  //       contents = contents.replaceAll(
  //         `this.expressionsToBeDeoptimized = EMPTY_ARRAY;`,
  //         `this.expressionsToBeDeoptimized = [];`
  //       )

  //       return contents
  //     },
  //   },
  // },

  {
    module: '@react-native/assets-registry',
    patchFiles: {
      '**/*.js': ['flow'],
    },
  },

  {
    module: 'expo',
    patchFiles: {
      'build/**/*.js': ['jsx'],
    },
  },

  {
    module: 'expo-image',
    patchFiles: {
      'build/**/*.js': ['jsx'],
    },
  },

  {
    module: 'expo-clipboard',
    patchFiles: {
      'build/**/*.js': ['jsx'],
    },
  },

  {
    module: '@expo/vector-icons',
    patchFiles: {
      'build/**/*.js': ['jsx'],
    },
  },

  {
    module: '@sentry/react-native',
    patchFiles: {
      version: '>=5.6.0',
      'dist/**/*.js': ['jsx'],
    },
  },

  {
    module: '@sentry/react-native',
    patchFiles: {
      version: '>=5.0.0 <5.6.0',

      'dist/js/utils/environment.js': (contents) => {
        assertString(contents)
        return contents.replace(
          `import { version as RNV } from 'react-native/Libraries/Core/ReactNativeVersion';`,
          `import { Platform } from 'react-native';\nconst RNV = Platform.constants.reactNativeVersion;\n`
        )
      },

      'dist/**/*.js': ['jsx'],
    },
  },

  {
    module: 'qrcode',
    patchFiles: {
      version: '<=1.5.1',

      'lib/server.js': (contents) => {
        assertString(contents)
        return contents.replace(
          `const TerminalRenderer = require('./renderer/terminal')`,
          `const TerminalRenderer = require('./renderer/terminal.js')`
        )
      },
    },
  },

  {
    module: 'vite',
    patchFiles: {
      version: '6.0.0-beta.2',

      // vite is going nuts when i install outside the monorepo
      // expo touches .expo/devices.json and for some strange reason vite
      // treats any .json changing in the entire repo as a reason to reload the entire app?
      'dist/node/chunks/dep-DXWVQosX.js': (contents) => {
        assertString(contents)
        // just disable it fully for now for some reason its always triggering for me
        return contents.replace(
          `// any tsconfig.json that's added in the workspace could be closer to a code file than a previously cached one`,
          `return`
        )
      },
    },
  },

  {
    module: '@hono/node-server',
    patchFiles: {
      'dist/serve-static.mjs': (contents) => {
        assertString(contents)
        return contents.replace(
          `const chunksize = end - start + 1;`,
          `if (isNaN(start) || isNaN(end)) console.log('nan start or end', start, end, range, parts)
const chunksize = end - start + 1;`
        )
      },
    },
  },

  {
    module: 'expo-camera',
    patchFiles: {
      version: '<=16.0.0',
      '**/*.js': ['jsx'],
    },
  },
  {
    module: 'expo-blur',
    patchFiles: {
      '**/*.js': ['jsx'],
    },
  },

  {
    module: 'whatwg-url-without-unicode',
    // https://github.com/onejs/one/issues/258
    patchFiles: {
      '**/*.js': (contents) =>
        contents
          ?.replace(/punycode\.ucs2\.decode/gm, '(punycode.ucs2decode || punycode.ucs2.decode)')
          ?.replace(/punycode\.ucs2\.encode/gm, '(punycode.ucs2encode || punycode.ucs2.encode)'),
    },
  },

  {
    module: '@rocicorp/zero',
    patchFiles: {
      version: '^0.9.0',
      'out/chunk-3L5FRWGX.js': (contents) => {
        return contents?.replace(
          `import xxhash from "xxhash-wasm";
var { create64, h32, h64 } = await xxhash();`,
          `function h64(str) {
  let i = str.length
  let hash1 = 5381
  let hash2 = 52711
  while (i--) {
    const char = str.charCodeAt(i)
    hash1 = (hash1 * 33) ^ char
    hash2 = (hash2 * 33) ^ char
  }
  return BigInt((hash1 >>> 0) * 4096 + (hash2 >>> 0))
}`
        )
      },
    },
  },

  // {
  //   module: 'react-native-reanimated',
  //   patchFiles: {
  //     'package.json': (contents) => {
  //       assertString(contents)
  //       const pkg = JSON.parse(contents)
  //       pkg.type = 'module'
  //       return JSON.stringify(pkg, null, 2)
  //     },
  //   },
  // },

  // could almost do this? it has a couple errors though
  // {
  //   module: 'react-native',
  //   patchFiles: {
  //     '**/*.js': ['flow'],
  //   },
  // },
]
