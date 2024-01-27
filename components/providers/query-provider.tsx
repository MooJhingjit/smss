"use client";

import { useState } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast } from "sonner";

export type MutationResponseType = {
  success: boolean;
  message: string;
  data?: any;
  errors?: any;
  invalidateKeys?: string[];
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // handle error globally
    onError: (error: unknown) => {
      const title =
        error instanceof Error && process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong! Please contact the administrator.";
      toast.error(title);
    },
  }),
  mutationCache: new MutationCache({
    // handle error globally
    onError: (error: any) => {
      let title = "Something went wrong! Please contact the administrator.";
      // const errorMessage = error?.response?.data?.message;

      // if (
      //   process.env.NODE_ENV === "development" ||
      //   publicErrors.includes(errorMessage)
      // ) {
      //   title = errorMessage;
      // }
      toast.error(title);
    },
  }),
});

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export { QueryProvider, queryClient };
