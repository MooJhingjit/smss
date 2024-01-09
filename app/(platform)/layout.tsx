import { Toaster } from "sonner";
// import { ClerkProvider } from "@clerk/nextjs";

import { ModalProvider } from "@/components/providers/modal-provider";

const PlatformLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // <ClerkProvider>
    // <QueryProvider>
    <>
      <Toaster position="top-center" richColors/>
      <ModalProvider />
      {children}
    </>
    // </QueryProvider>
    // </ClerkProvider>
  );
};

export default PlatformLayout;
