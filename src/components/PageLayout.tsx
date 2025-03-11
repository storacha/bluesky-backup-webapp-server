"use client";

export default function PageLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[url(/bluesky-storacha.webp)] bg-contain">
      <div className="min-h-screen py-16 flex flex-col items-center bg-white/30 backdrop-blur-xs">
        {children}
      </div>
    </div>
  );
}