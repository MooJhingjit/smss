import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ModalProvider } from "@/components/providers/modal-provider";

const PlatformLayout = async ({ children }: { children: React.ReactNode }) => {

  return (

    <QueryProvider>
      <>
        <Toaster position="top-center" richColors />
        <ModalProvider />
        {children}
      </>
    </QueryProvider>
  );
};

export default PlatformLayout;
