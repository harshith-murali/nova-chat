"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Instantiating the QueryClient inside useState ensures that each request has its own isolated client
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute stale time to prevent immediate double-fetching
            refetchOnWindowFocus: false, // Prevents aggressive background refetching when switching browser tabs
            retry: 1, // Safe fallback retry for standard request failure states
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}