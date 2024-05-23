import type { Hono } from 'hono'
import { join } from 'node:path'
import { getOptionsFilled, type VXRNConfig } from 'vxrn'
import { createHandleRequest } from '../handleRequest'
import { resolveAPIRequest } from './resolveAPIRequest'

export async function serve(optionsIn: VXRNConfig, app: Hono) {
  const options = await getOptionsFilled(optionsIn, { mode: 'prod' })
  const handleRequest = createHandleRequest(
    {
      root: options.root,
    },
    {
      async handleAPI({ route, request }) {
        const apiFile = join(process.cwd(), 'dist/api', route.page + '.js')
        const exported = await import(apiFile)
        return resolveAPIRequest(exported, request)
      },
    }
  )

  app.use(async (context, next) => {
    const res = await handleRequest(context.req.raw)
    if (res) {
      if (
        res instanceof Response ||
        // for some reason this isnt instanceof properly???
        isResponseLike(res)
      ) {
        return res as Response
      }
      return context.json(res)
    }
    await next()
  })
}

function isResponseLike(res: any) {
  return res.status && res.body && res.ok
}