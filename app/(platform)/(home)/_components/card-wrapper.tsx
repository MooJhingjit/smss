import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

interface Props {
  title: string;
  description?: string;
  onCreate?: () => void;
  children?: React.ReactNode;
  link?: string;
}
export default function CardWrapper(props: Props) {
  const { title, description, onCreate, children, link } = props;
  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="bg-blue-100 p-4 flex flex-row items-center">
        <div className="flex-1 space-y-2">
          <CardTitle className="text-gray-700">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
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
              className="h-5 w-5 cursor-pointer text-blue-500"
              onClick={onCreate}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children
          ? children
          : Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-5 bg-gray-200 w-full mt-2"></div>
            ))}
      </CardContent>
    </Card>
  );
}
