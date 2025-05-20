"use client";

import { useFormStatus } from "react-dom";
import { KeyboardEventHandler, forwardRef } from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { FormErrors } from "./form-errors";
import { UseFormRegister } from "react-hook-form";

interface FormTextareaProps {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  className?: string;
  rows?: number;
  onBlur?: () => void;
  onClick?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement> | undefined;
  defaultValue?: string;
  register?: UseFormRegister<any>;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      id,
      label,
      placeholder,
      required,
      disabled,
      errors,
      onBlur,
      onClick,
      onKeyDown,
      className,
      rows,
      register,
      defaultValue,
    },
    ref,
  ) => {
    const { pending } = useFormStatus();

    return (
      <div className="space-y-2 w-full h-full">
        <div className=" h-full">
          <div className="flex justify-between">
            {label ? (
              <Label htmlFor={id} className="text-xs  capitalize">
                {label}
              </Label>
            ) : null}
            <FormErrors id={id} errors={errors} />
          </div>
          <Textarea
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            onClick={onClick}
            ref={ref}
            required={required}
            placeholder={placeholder}
            name={id}
            id={id}
            register={register}
            rows={rows}
            disabled={pending || disabled}
            className={cn(
              "resize-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 focus:ring-0 outline-none shadow-sm text-xs",
              className,
            )}
            aria-describedby={`${id}-error`}
            defaultValue={defaultValue}
          />
        </div>
      </div>
    );
  },
);

FormTextarea.displayName = "FormTextarea";
