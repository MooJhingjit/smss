"use client";
import { authenticate } from "@/actions/auth";
import { useFormState, useFormStatus } from "react-dom";

export default function useSignIn() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);
  const { pending } = useFormStatus();

  return { error: errorMessage, action: dispatch, isPending: pending };
}
