"use client";

import RootProviders from "./providers";
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[url(/bluesky-storacha.webp)] bg-contain backdrop-blur-xs">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
