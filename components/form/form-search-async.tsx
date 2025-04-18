"use client";

import { forwardRef } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { FormErrors } from "./form-errors";
import { SearchAsync } from "../ui/custom.search-async";

interface FormInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  className?: string;
  defaultValue?: any;
  onBlur?: () => void;
  onSelected: (item: any) => void;
  config: any;
}

export const FormSearchAsync = forwardRef<any, FormInputProps>(
  (
    {
      id,
      label,
      onSelected,
      placeholder,
      required,
      disabled = false,
      errors,
      className,
      defaultValue = "",
      onBlur,
      config,
    },
    ref,
  ) => {
    const { pending } = useFormStatus();
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="flex justify-between">
            {label ? (
              <Label htmlFor={id} className="text-xs capitalize">
                {label}
              </Label>
            ) : null}
            <FormErrors id={id} errors={errors} />
          </div>
          <SearchAsync
            disabled={disabled}
            id={id}
            ref={ref}
            placeholder={placeholder ?? ""}
            config={config}
            defaultValue={defaultValue}
            onSelected={onSelected}
          />
        </div>
      </div>
    );
  },
);

FormSearchAsync.displayName = "FormSearchAsync";
