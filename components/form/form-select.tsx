"use client";

import { forwardRef } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { FormErrors } from "./form-errors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface FormInputProps {
  id: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  className?: string;
  defaultValue?: string;
  onBlur?: () => void;
  options: { id: string; title: string }[];
}

export const FormSelect = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      label,
      required,
      disabled,
      errors,
      className,
      defaultValue = "",
      onBlur,
      options,
    },
    ref
  ) => {
    const { pending } = useFormStatus();

    return (
      <div className="">
        <div className="flex justify-between">
          {label ? (
            <Label htmlFor={id} className="text-xs capitalize">
              {label}
            </Label>
          ) : null}
          <FormErrors id={id} errors={errors} />
        </div>
        <Select name={id} disabled={pending || disabled} defaultValue={defaultValue}>
          <SelectTrigger className="w-[180px] text-xs">
            <SelectValue
              placeholder={
                defaultValue
                  ? options.find(({ id }) => id === defaultValue)?.title
                  : "Select"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {options.map(({ id, title }) => (
              <SelectItem key={id} value={id}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
