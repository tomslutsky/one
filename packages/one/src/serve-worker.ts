import { createProdServer } from 'vxrn/serve'
import { oneServe } from './server/oneServe'
import type { One } from './vite/types'
import { setupBuildInfo } from './server/setupBuildOptions'
import { ensureExists } from './utils/ensureExists'

export async function serve(buildInfo: One.BuildInfo) {
  setupBuildInfo(buildInfo)
  ensureExists(buildInfo.oneOptions)

  const app = await createProdServer(buildInfo.oneOptions)

  await oneServe(buildInfo.oneOptions, buildInfo.oneOptions, buildInfo, app, false)

  return app
}
