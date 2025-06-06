import React, { useEffect } from "react";
import { AlertCircleIcon, Loader, TriangleIcon } from "lucide-react";
import { classNames } from "@/lib/utils";
type Props = {
  disabled?: boolean;
  onConfirm: () => void;
  children: React.ReactNode;
  isDone?: boolean;
  warningMessage?: string[]
};
export default function ConfirmActionButton(props: Props) {
  const { onConfirm, children, disabled, isDone, warningMessage } = props;
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  useEffect(() => {
    setShowConfirm(false);
  }, [disabled]);

  // reset isPending when isDone is true
  useEffect(() => {
    if (isDone && isPending) {
      setIsPending(false);
      setShowConfirm(false);
    }
  }, [isDone, isPending]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPending) {
      timer = setTimeout(() => {
        setIsPending(false);
        setShowConfirm(false);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isPending]);

  if (isPending) {
    return (
      <div className="h-full flex items-center">
        <Loader size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="">
        <div className="">
          {
            warningMessage && (
              <div className="text-red-600 text-xs mb-2 flex items-center">
                <div className="">
                  <AlertCircleIcon className="w-4 h-4 mr-1" />
                </div>
                <div className="">
                  {warningMessage.map((msg, index) => (
                    <div key={index}>{msg}</div>
                  ))}
                </div>
              </div>
            )
          }
        </div>
        <span className="isolate flex rounded-md shadow-sm border">
          <button
            onClick={() => {
              onConfirm();
              setIsPending(true);
            }}
            type="button"
            className="flex-0 relative inline-flex items-center gap-x-1.5 rounded-l-md text-white bg-red-600 px-2 py-1 text-xs  ring-0  focus:z-10"
          >
            ยืนยัน
          </button>
          {!isPending && (
            <button
              onClick={() => setShowConfirm(false)}
              type="button"
              className="flex-1 justify-center flex relative -ml-px items-center rounded-r-md bg-white px-3 py-1 text-xs  text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
            >
              ยกเลิก
            </button>
          )}
        </span>

      </div>
    );
  }

  return (
    <button
      disabled={disabled}
      className={classNames(disabled && "cursor-not-allowed opacity-50")}
      onClick={() => !disabled && setShowConfirm(true)}
    >
      {children}
    </button>
  );
}
