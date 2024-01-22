import * as React from "react";

import { cn } from "@/lib/utils";
import { UseFormRegister } from "react-hook-form";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  register?: UseFormRegister<any>;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, register, type, id, readOnly, ...props }, ref) => {

    const classNames = cn(
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      readOnly ? "cursor-not-allowed bg-gray-100" : "cursor-pointer",
      className,
    );

    if (!register) {
      return (
        <input
          ref={ref}
          type={type}
          className={classNames}
          readOnly={readOnly}
          {...props}
        />
      );
    }

    // to support react-hook-form
    return (
      <input
        type={type}
        className={classNames}
        readOnly={readOnly}
        {...props}
        {...register(id)}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
