import { Metadata } from 'next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import StorachaProvider from '@/components/StorachaProvider'

import { Authenticator } from './authentication'
import { dmMono, dmSans, epilogue } from './globalStyle'
import { SWRConfigProvider } from './swr'

export const metadata: Metadata = {
  title: 'Bb',
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
            <NuqsAdapter>
              <Authenticator as="div">{children}</Authenticator>
            </NuqsAdapter>
          </body>
        </html>
      </SWRConfigProvider>
    </StorachaProvider>
  )
}
