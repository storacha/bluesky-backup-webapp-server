"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { BackupsProvider } from "@/contexts/backups";
import { Loader } from "@/components/Loader";

export default function RootProviders ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      })
  );

  const BskyAuthProvider = dynamic(() => import('../components/BlueskyAuthProvider'), {
    loading: () => <Loader />,
    ssr: false
  })

  const StorachaAuthProvider = dynamic(() => import('../components/StorachaProvider'), {
    loading: () => <Loader />,
    ssr: false
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BackupsProvider>
        <BskyAuthProvider>
          <StorachaAuthProvider>
            {children}
          </StorachaAuthProvider>
        </BskyAuthProvider>
      </BackupsProvider>
    </QueryClientProvider>
  );
}
