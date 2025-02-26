"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import dynamic from "next/dynamic";

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
    loading: () => <p>Loading...</p>,
    ssr: false
  })

  const StorachaAuthProvider = dynamic(() => import('../components/W3UIProvider'), {
    loading: () => <p>Loading...</p>,
    ssr: false
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BskyAuthProvider>
        <StorachaAuthProvider>
          {children}
        </StorachaAuthProvider>
      </BskyAuthProvider>
    </QueryClientProvider>
  );
}
