import * as React from "react";

import { cn } from "@/lib/utils";
import { UseFormRegister } from "react-hook-form";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  register?: UseFormRegister<any>;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, register, ...props }, ref) => {
    const classNames = cn(
      "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className,
    );

    if (!register) {
      return <textarea id={id} className={classNames} ref={ref} {...props} />;
    }

    return (
      <textarea id={id} className={classNames} {...register(id)} {...props} />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
