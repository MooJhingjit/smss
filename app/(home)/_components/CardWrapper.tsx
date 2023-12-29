import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";

interface Props {
  title: string;
  description: string;
}
export default function CardWrapper(props: Props) {
  const { title, description } = props;
  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="bg-blue-100 p-4 flex flex-row items-center">
        <div className="flex-1 space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex-none flex items-center space-x-4">
          <p className="text-xs text-gray-600 underline cursor-pointer">View All</p>
          <Plus className="h-5 w-5 cursor-pointer text-blue-500" />
        </div>
      </CardHeader>
      <CardContent className="py-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="h-5 bg-gray-200 w-full mb-2"></div>
        ))}
      </CardContent>
    </Card>
  );
}
