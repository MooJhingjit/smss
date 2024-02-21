import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LOGO from "@/public/logo.png";

export default function SignInPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-10">

        <form className="space-y-6" action="#" method="POST">
          <div className="relative space-y-2  rounded-md shadow-sm">
            <div>
              <Label htmlFor="name" className="sr-only">
                ชื่อผู้ใช้
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="ชื่อผู้ใช้"
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
                placeholder="รหัสผ่าน"
              />
            </div>
          </div>

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
          </div>

          <div>
            <Button
              type="submit"
              className="flex w-full space-x-2 justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              <span>
                เข้าสู่ระบบ

              </span>
              <img
                className="h-8 w-auto"
                src={LOGO.src}
                alt="Workflow"
              />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
