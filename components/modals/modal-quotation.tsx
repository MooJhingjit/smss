"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DialogFooter } from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuotationModal } from "@/hooks/use-quotation-modal";
import { useAction } from "@/hooks/use-action";
import { createQuotation } from "@/actions/quotation/create";
import { FormSearchAsync } from "../form/form-search-async";
import { User } from "@prisma/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ArrowDown, ChevronsUpDown, UserRoundCog } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const QuotationFormSchema = z.object({
  type: z.enum(["product", "service"]),
  buyerId: z.string().min(1, { message: "Customer is required" }),
  overrideContactName: z.string().optional(),
  overrideContactEmail: z.string().optional(),
  overrideContactPhone: z.string().optional(),
  vatIncluded: z.boolean(),
});

export const NewQuotationModal = () => {
  const router = useRouter();
  const modal = useQuotationModal();
  const [customerDetails, setCustomerDetails] = React.useState<User | null>(null);

  const form = useForm<z.infer<typeof QuotationFormSchema>>({
    resolver: zodResolver(QuotationFormSchema),
    defaultValues: {
      type: "product",
      buyerId: "",
      overrideContactName: "",
      overrideContactEmail: "",
      overrideContactPhone: "",
      vatIncluded: true,
    },
  });

  const handleCreate = useAction(createQuotation, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
      form.reset();
      router.push(`quotations/${data.id}`);
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  function onSubmit(data: z.infer<typeof QuotationFormSchema>) {
    handleCreate.execute({
      type: data.type,
      buyerId: parseInt(data.buyerId),
      overrideContactName: data.overrideContactName || undefined,
      overrideContactEmail: data.overrideContactEmail || undefined,
      overrideContactPhone: data.overrideContactPhone || undefined,
      vatIncluded: data.vatIncluded,
    });
  }

  const onTypeChange = (value: "product" | "service") => {
    form.setValue("type", value);
  };

  return (
    <ResponsiveDialog
      open={modal.isOpen}
      onOpenChange={modal.onClose}
      title="สร้างใบเสนอราคาใหม่"
      description="เลือกชื่อลูกค้า และประเภทของ QT"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ประเภท</FormLabel>
                  <FormControl>
                    <Tabs value={field.value} onValueChange={(value) => onTypeChange(value as "product" | "service")}>
                      <TabsList className="w-full flex">
                        <TabsTrigger className="flex-1 text-xs" value="product">
                          สินค้า
                        </TabsTrigger>
                        <TabsTrigger className="flex-1 text-xs" value="service">
                          บริการ
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ลูกค้า (บริษัท) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <FormSearchAsync
                      id="customer"
                      config={{
                        endpoint: "/contacts",
                      }}
                      onSelected={(item) => {
                        field.onChange(item.value ? String(item.value) : "");
                        setCustomerDetails(item.data);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {customerDetails && (
              <>
                <div className="col-span-1">
                  <CustomerInfo
                    data={customerDetails}
                    form={form}
                  />
                  
                </div>



              </>
            )}
          </div>

          <DialogFooter className="flex items-center justify-end gap-4">
            <FormField
              control={form.control}
              name="vatIncluded"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      รวม Vat
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={handleCreate.isLoading}>
              {handleCreate.isLoading ? "กำลังสร้าง..." : "สร้าง"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};

const CustomerInfo = (props: {
  data: User, form: ReturnType<typeof useForm<z.infer<typeof QuotationFormSchema>>>

}) => {
  const { data, form } = props;
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="rounded-md bg-yellow-50 border border-yellow-300 p-2 mt-3">
      <dl className=" space-y-1 text-xs leading-6 text-gray-600">
        <div className="flex space-x-2">
          <dt>เลขประจำตัวผู้เสียภาษี:</dt>
          <dd className="font-semibold">{data.taxId}</dd>
        </div>
        <div className="flex space-x-2">
          <dt>ผู้ติดต่อ:</dt>
          <dd className="font-semibold">{data.contact}</dd>
        </div>
        <div className="flex space-x-2">
          <dt>อีเมล:</dt>
          <dd className="font-semibold">{data.email}</dd>
        </div>
        <div className="flex space-x-2">
          <dt>เบอร์โทรศัพท์:</dt>
          <dd className="font-semibold">{data.phone}</dd>
        </div>
        <div className="flex space-x-2">
          <dt>แฟกซ์:</dt>
          <dd className="font-semibold">
            <span className="block">{data.fax}</span>
          </dd>
        </div>
        <div className="flex space-x-2">
          <dt>ที่อยู่:</dt>
          <dd className="font-semibold">
            <span className="block">{data.address}</span>
          </dd>
        </div>
      </dl>

      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex  flex-col gap-2 mt-4"
      >

        <CollapsibleTrigger asChild>
          <Button
            variant={"outline"}
            className="flex items-center justify-center gap-3  " type="button">
            <p>แก้ไขข้อมูลผู้ติดต่อ</p>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4  bg-white p-3 ">

          <FormField
            control={form.control}
            name="overrideContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อ</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="overrideContactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>อีเมล</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="overrideContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เบอร์โทรศัพท์</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CollapsibleContent>
      </Collapsible>



    </div>
  );
};
