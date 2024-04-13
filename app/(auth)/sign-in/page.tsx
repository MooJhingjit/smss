"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LOGO from "@/public/logo.png";
import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/actions/auth";
import Image from "next/image";

export default function SignInPage() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);
  const { pending } = useFormStatus();

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* image bg */}

      <div className="absolute w-full z-10 inset-0  	">
        <Image
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }} // optional
          className="h-full w-full object-cover "
          src="https://smartss9168.com/wp-content/uploads/2018/08/network-2402637_1280.jpg"
          alt=""
        />
      </div>
      <div className="w-full max-w-md space-y-10 relative z-20 backdrop-blur-sm bg-white/40 p-20 rounded">
        <div className="flex items-center space-x-4 justify-center">
          <Image width="100" height="80" src={LOGO.src} alt="Workflow" />
          <span className="text-2xl font-semibold text-white">เข้าสู่ระบบ</span>
        </div>
        <form action={dispatch} className="space-y-6">
          <div className="relative space-y-2  rounded-md shadow-sm">
            <div>
              <Label htmlFor="email" className="sr-only">
                อีเมล์
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="text-white placeholder:text-white"
                required
                placeholder="อีเมล์"
              />
            </div>
            <div>
              <Label htmlFor="password" className="sr-only">
                รหัสผ่าน
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="text-white placeholder:text-white"
                placeholder="รหัสผ่าน"
              />
            </div>
          </div>
          {/* 
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <Label
                htmlFor="remember-me"
                className="ml-3 block text-sm leading-6 text-gray-900"
              >
                จำฉันไว้
              </Label>
            </div>

            <div className="text-sm leading-6">
              <p className="font-semibold text-primary-600 hover:text-primary-500">
                ลืมรหัสผ่าน?
              </p>
            </div>
          </div> */}

          <div>
            <Button
              disabled={pending}
              type="submit"
              variant={"secondary"}
              className="w-full"
            >
              ยืนยัน
            </Button>
          </div>
        </form>
        {errorMessage && (
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
