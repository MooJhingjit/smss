import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import ConfirmActionButton from "@/components/confirm-action";

export const ReceiptPrint = ({ endpoint, defaultBillDate }: { endpoint: string, defaultBillDate?: Date }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const triggerSubmit = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    }
  };


  const onPrintClick = async (date: Date) => {
    setIsSubmitting(true);
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: date.toISOString() }),
      })
        .then((res) => res.blob())
        .then((blob) => URL.createObjectURL(blob))
        .then((url) => {
          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank"; // Ensure it opens in a new tab
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const date = formData.get("bill") as string;
        if (date) {
          onPrintClick(new Date(date));
        }
      }}
      className="flex w-full max-w-sm items-center space-x-2"
    >
      <Input
        id="bill"
        name="bill"
        type="date"
        placeholder="วันที่"
        defaultValue={defaultBillDate?.toISOString().split("T")[0] ?? new Date().toISOString().split("T")[0]}
      />

      <ConfirmActionButton
        onConfirm={() => {
          triggerSubmit(); // Call this to programmatically trigger the form submission
        }}
      >
        <Button size={"sm"} variant={"secondary"} type="button" disabled={isSubmitting}>
          <PrinterIcon className="w-4 h-4" />
        </Button>
      </ConfirmActionButton>


    </form>
  );
};
