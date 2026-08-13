"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "~/server/api/root";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient());
};

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
          fetch: async (url, options) => {
            let response = await fetch(url, options);
            if (response.status === 401) {
              console.log("[tRPC Client] 401 Intercepted. Attempting silent-refresh...");
              try {
                const refreshResponse = await fetch(getBaseUrl() + "/api/auth/session");
                if (refreshResponse.ok) {
                  const sessionData = await refreshResponse.json() as Record<string, any>;
                  if (sessionData && Object.keys(sessionData).length > 0) {
                    console.log("[tRPC Client] Silent-refresh succeeded. Retrying request...");
                    response = await fetch(url, options);
                  } else {
                    throw new Error("Expired or empty session");
                  }
                } else {
                  throw new Error("Session fetch returned non-200 status");
                }
              } catch (refreshErr) {
                console.error("[tRPC Client] Silent-refresh failed:", refreshErr);
                if (typeof window !== "undefined") {
                  const { clearAllMobileState } = await import("~/lib/mobile/native-service");
                  await clearAllMobileState();
                  window.location.href = "/";
                }
              }
            }
            return response;
          }
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
