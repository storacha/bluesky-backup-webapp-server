import StorachaProvider from '@/components/StorachaProvider'
import { dmMono, dmSans, epilogue } from './globalStyle'
import { Authenticator } from './authentication'
import { SWRConfigProvider } from './swr'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Bb",
  description: 'Backup & Restore your Bluesky Account'
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
            <Authenticator as="div">{children}</Authenticator>
          </body>
        </html>
      </SWRConfigProvider>
    </StorachaProvider>
  )
}
