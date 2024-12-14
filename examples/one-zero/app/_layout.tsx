import './app.css'
import './tamagui.css'

import { ZeroProvider } from '@rocicorp/zero/react'
import { ToastProvider, ToastViewport } from '@tamagui/toast'
import { SchemeProvider, useColorScheme } from '@vxrn/color-scheme'
import { LoadProgressBar, Slot } from 'one'
import { useState } from 'react'
import { isWeb, TamaguiProvider } from 'tamagui'
import { AuthEffects } from '~/src/better-auth/AuthEffects'
import { ToastDisplay } from '~/src/interface/Toast'
import { DragDropFile } from '~/src/interface/upload/DragDropFile'
import { useZeroEmit, zero } from '~/src/state/zero'
import config from '~/src/tamagui/tamagui.config'

export default function Layout() {
  return (
    <>
      {isWeb && (
        <>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta property="og:image" content={`${process.env.ONE_SERVER_URL}/og.jpg`} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:image" content={`${process.env.ONE_SERVER_URL}/og.jpg`} />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          <link rel="icon" href="/favicon.svg" />
        </>
      )}

      <LoadProgressBar startDelay={1_000} />

      <AuthEffects />

      <DragDropFile>
        <DataProvider>
          <SchemeProvider>
            <ThemeProvider>
              <ToastProvider swipeDirection="horizontal">
                <Slot />
                <ToastDisplay />
                <ToastViewport
                  flexDirection="column-reverse"
                  top={0}
                  left={0}
                  right={0}
                  mx="auto"
                />
              </ToastProvider>
            </ThemeProvider>
          </SchemeProvider>
        </DataProvider>
      </DragDropFile>
    </>
  )
}

const DataProvider = ({ children }) => {
  const [instance, setInstance] = useState(zero)

  useZeroEmit((next) => {
    setInstance(next)
  })

  return <ZeroProvider zero={instance}>{children}</ZeroProvider>
}

const ThemeProvider = ({ children }) => {
  const [scheme] = useColorScheme()

  return (
    <TamaguiProvider disableInjectCSS config={config} defaultTheme={scheme}>
      {children}
    </TamaguiProvider>
  )
}