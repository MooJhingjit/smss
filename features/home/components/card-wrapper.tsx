import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  onCreate?: () => void;
  children?: React.ReactNode;
  link?: string;
  actionNeed?: boolean;
}
export default function CardWrapper(props: Props) {
  const { title, description, onCreate, children, link, actionNeed } = props;

  const bgColor = ""; // actionNeed ? "bg-yellow-100" : "bg-blue-100";
  const textColor = actionNeed ? "text-yellow-600" : "text-slate-700";
  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader
        className={`${bgColor} p-4 flex flex-row items-center  border-b border-dotted relative`}
      >
        <div
          className={cn(
            "absolute h-1 right-0 left-0 top-0 bg-primary",
            actionNeed ? "bg-orange-400" : "bg-primary"
          )}
        ></div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            {actionNeed && <AlertCircle className="text-yellow-600" />}
            <CardTitle className={textColor}>{title}</CardTitle>
          </div>
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </div>
        <div className="flex-none flex items-center space-x-4">
          {link && (
            <Link
              href={link}
              passHref
              className="text-xs text-gray-600 underline cursor-pointer"
            >
              ดูทั้งหมด
            </Link>
          )}
          {onCreate && (
            <Plus
              className={`h-5 w-5 cursor-pointer ${textColor}`}
              onClick={onCreate}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="min-h-32 pt-2">
        {children
          ? children
          : Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-5 bg-gray-200 w-full mt-2"></div>
            ))}
      </CardContent>
    </Card>
  );
}
