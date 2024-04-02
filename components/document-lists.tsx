"use client";
import React from "react";
import { Upload, Download, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import PageComponentWrapper from "@/components/page-component-wrapper";
import ImageUpload from "@/components/form/form-image-upload";
import { Media } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import MEDIA_SERVICES from "@/app/services/service.media";
import {
  MutationResponseType,
  queryClient,
} from "@/components/providers/query-provider";
import { toast } from "sonner";
type Props = {
  refType: string;
  refId: number;
};

export default function DocumentItems(props: Props) {
  const { refType, refId } = props;
  const queryKey = ["media" + refType, refId];
  // get files from the server
  const { data } = useQuery<Media[]>({
    queryKey,
    queryFn: async () => {
      const params = {
        refType: refType,
        refId: refId,
      };
      return await MEDIA_SERVICES.get(params);
    },
  });

  const { mutate } = useMutation<
    MutationResponseType,
    Error,
    {
      refType: string;
      refId: number;
      url: string;
    }
  >({
    mutationFn: async (formData) => {
      console.log(formData);
      const res = await MEDIA_SERVICES.post({
        refType: refType,
        refId: refId,
        url: formData.url,
      });
      return { ...res };
    },
    onSuccess: async (n) => {
      queryClient.invalidateQueries({ queryKey });

      toast.success("Updated successfully");
    },
  });

  // upload file to the server
  const onUpload = (value: string) => {
    mutate({
      refType,
      refId,
      url: value,
    });
  };

  const renderPreview = (doc: Media) => {
    const ext = doc.url.split(".").pop();
    if (ext === "pdf") {
      return (
        <object
          data={doc.url}
          type="application/pdf"
          className="w-full h-full rounded-lg"
        >
          <p>
            <a href={doc.url}>PDF</a>
          </p>
        </object>
      );
    }

    if (ext === "jpg" || ext === "jpeg" || ext === "png") {
      return <img src={doc.url} alt="preview" className="w-full rounded-lg" />;
    }
    return (
      <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-md">
        <img width="64" src="/file.svg" alt="file" className="w-8 h-8" />
      </div>
    );
  };

  return (
    <PageComponentWrapper
      headerIcon={
        <Upload className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700" />
      }
      headerTitle="เอกสาร"
    >
      <ImageUpload onChange={onUpload} />
      <ul role="list" className="divide-y divide-gray-100 ">
        {data?.map((doc, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
          >
            <div className="max-w-[200px]">{renderPreview(doc)}</div>
            <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
              <span className="flex-shrink-0 text-gray-400 text-xs">
                {format(new Date(doc.createdAt), "MMM d, yyyy")}
              </span>
              <ExternalLink
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700"
                onClick={() => {
                  // open new tab and download the file
                  window.open(doc.url, "_blank");
                }}
              />
              <Download
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700"
                onClick={() => {
                  // open new tab and download the file
                  window.open(doc.url, "_blank");
                }}
              />
              <Trash2 className="w-4 h-4 text-red-300 cursor-pointer hover:text-red-700" />
            </div>
          </li>
        ))}
      </ul>
    </PageComponentWrapper>
  );
}
