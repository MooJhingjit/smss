import React from "react";
import { Loader } from "lucide-react";
type Props = {
  onConfirm: () => void;
  children: React.ReactNode;
};
export default function ConfirmActionButton(props: Props) {
  const { onConfirm, children } = props;
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  if (isPending) {
    return (
      <div className="h-full flex items-center">
        <Loader size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (showConfirm) {
    return (
      <span className="isolate inline-flex rounded-md shadow-sm">
        <button
          onClick={() => {
            onConfirm();
            setIsPending(true);
          }}
          type="button"
          className="relative inline-flex items-center gap-x-1.5 rounded-l-md text-white bg-red-600 px-8 py-1 text-xs  ring-0  focus:z-10"
        >
          ยืนยัน
        </button>
        {!isPending && (
          <button
            onClick={() => setShowConfirm(false)}
            type="button"
            className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-1 text-xs  text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
          >
            ยกเลิก
          </button>
        )}
      </span>
    );
  }

  return <button onClick={() => setShowConfirm(true)}>{children}</button>;
}
