import StorachaProvider from '@/components/StorachaProvider'
import { dmMono, dmSans, epilogue } from './globalStyle'
import { Authenticator } from './authentication'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <StorachaProvider>
      <Authenticator>
        <html
          lang="en"
          className={`${dmSans.className} ${dmSans.variable} ${dmMono.variable} ${epilogue.variable}`}
        >
          <body>{children}</body>
        </html>
      </Authenticator>
    </StorachaProvider>
  )
}
