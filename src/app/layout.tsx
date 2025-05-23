import { Metadata } from 'next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from 'sonner'

import StorachaProvider from '@/components/StorachaProvider'
import { KeychainProvider } from '@/contexts/keychain'

import { SWRConfigProvider } from '../lib/swr'

import { Authenticator } from './authentication'
import { dmMono, dmSans, epilogue } from './globalStyle'

export const metadata: Metadata = {
  title: 'Bluesky Backups by Storacha',
  description: 'Backup & Restore your Bluesky Account',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <StorachaProvider>
      <SWRConfigProvider>
        <html
          lang="en"
          className={`${dmSans.className} ${dmSans.variable} ${dmMono.variable} ${epilogue.variable}`}
        >
          <body>
            <div id="modal"></div>
            <NuqsAdapter>
              <Authenticator>
                <KeychainProvider>
                  {children}
                  <Toaster
                    position="top-center"
                    toastOptions={{
                      style: {
                        background: 'var(--color-black)',
                        color: 'var(--color-white)',
                      },
                    }}
                  />
                </KeychainProvider>
              </Authenticator>
            </NuqsAdapter>
          </body>
        </html>
      </SWRConfigProvider>
    </StorachaProvider>
  )
}
