"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/custom-input";
import { Label } from "@/components/ui/label";
import LOGO from "@/public/logo.png";
import Image from "next/image";
import useSignIn from "../api/use-sign-in";

export default function SignInCard() {
  const { action, isPending, error } = useSignIn();

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 ">
      <div className="absolute w-full z-10 inset-0  	">
        <Image
          className="h-full w-full object-cover "
          src="/assets/3409297.jpg"
          alt=""
          layout="fill"
        />
      </div>
      <div className="w-full max-w-sm space-y-10 relative z-20 backdrop-blur-sm bg-white/40 p-8 rounded">
        <div className="flex items-center space-x-4 justify-center">
          <Image width="100" height="80" src={LOGO.src} alt="Workflow" />
        </div>
        <form action={action} className="space-y-6">
          <div className="relative space-y-2  rounded-md shadow-sm">
            <div>
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="text-white placeholder:text-white"
                required
                placeholder="Enter your email."
              />
            </div>
            <div>
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="text-white placeholder:text-white"
                placeholder="Enter your password."
              />
            </div>
          </div>
          <div>
            <Button
              disabled={isPending}
              type="submit"
              variant={"secondary"}
              className="w-full"
            >
              Sign in
            </Button>
          </div>
        </form>
        {error && (
          <div className="bg-red-400 border-red-100 p-2 text-center rounded">
            <p className="text-sm text-white  text-center ">
              อีเมล์หรือรหัสผ่านไม่ถูกต้อง
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
