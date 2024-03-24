"use client";

import { forwardRef } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { FormErrors } from "./form-errors";
import { UseFormRegister } from "react-hook-form";

interface FormInputProps {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  className?: string;
  defaultValue?: any;
  readOnly?: boolean;
  onBlur?: () => void;
  register?: UseFormRegister<any>;
  step?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      label,
      type,
      placeholder,
      required,
      disabled,
      errors,
      className,
      defaultValue = "",
      onBlur,
      register,
      readOnly,
      step = "any",
    },
    ref,
  ) => {
    const { pending } = useFormStatus();

    return (
      <div className="space-y-2 w-full">
        <div className="space-y-1">
          <div className="flex justify-between">
            {label ? (
              <Label htmlFor={id} className="text-xs capitalize">
                {label}
              </Label>
            ) : null}
            <FormErrors id={id} errors={errors} />
          </div>
          <Input
            autoComplete="off"
            onBlur={onBlur}
            defaultValue={defaultValue}
            ref={ref}
            required={required}
            name={id}
            id={id}
            register={register}
            placeholder={placeholder}
            type={type}
            readOnly={readOnly}
            disabled={pending || disabled}
            className={cn("text-xs", className)}
            aria-describedby={`${id}-error`}
            step={step}
          />
        </div>
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
