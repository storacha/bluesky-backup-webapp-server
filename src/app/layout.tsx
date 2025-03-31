import { dmMono, dmSans, epilogue } from './globalStyle'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.className} ${dmSans.variable} ${dmMono.variable} ${epilogue.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
