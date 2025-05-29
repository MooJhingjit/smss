"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@radix-ui/react-label";
import { useProductModal } from "@/hooks/use-product-modal";
import { useAction } from "@/hooks/use-action";
import { createProduct } from "@/actions/product/create";
import { updateProduct } from "@/actions/product/update";
import { FormSearchAsync } from "../form/form-search-async";

const ProductFormSchema = z.object({
  type: z.enum(["product", "service"]),
  vendorId: z.string().optional(),
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(3, {
      message: "Name is too short.",
    }),
  cost: z.string().optional(),
  percentage: z.string().optional(),
  unit: z.string().optional(),
  description: z.string().optional(),
});

export const NewProductModal = () => {
  const modal = useProductModal();
  const product = modal.data;

  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      type: product?.type ?? "product",
      vendorId: product?.vendor?.id ? String(product.vendor.id) : "",
      name: product?.name ?? "",
      cost: product?.cost ? String(product.cost) : "",
      percentage: product?.percentage ? String(product.percentage) : "",
      unit: product?.unit ?? "",
      description: product?.description ?? "",
    },
  });

  const handleCreate = useAction(createProduct, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      if (modal.onProductCreated) {
        modal.onProductCreated(data);
      }
      modal.onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const handleUpdate = useAction(updateProduct, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  function onSubmit(data: z.infer<typeof ProductFormSchema>) {
    if (product?.id) {
      handleUpdate.execute({
        id: product.id,
        name: data.name,
        type: data.type,
        percentage: data.percentage,
        unit: data.unit,
        cost: data.cost,
        description: data.description,
      });
      return;
    }
    handleCreate.execute({
      name: data.name,
      type: data.type,
      vendorId: data.vendorId ? parseInt(data.vendorId) : 0,
      cost: data.cost,
      percentage: data.percentage,
      unit: data.unit,
      description: data.description,
    });
  }

  const onTypeChange = (value: "product" | "service") => {
    form.setValue("type", value);
    
    // Set default percentage based on product type
    if (value === "product") {
      form.setValue("percentage", "15");
    } else if (value === "service") {
      form.setValue("percentage", "30");
    }
  };

  // Reset form when product data changes
  React.useEffect(() => {
    if (product) {
      form.reset({
        type: product.type ?? "product",
        vendorId: product.vendor?.id ? String(product.vendor.id) : "",
        name: product.name ?? "",
        cost: product.cost ? String(product.cost) : "",
        percentage: product.percentage ? String(product.percentage) : "",
        unit: product.unit ?? "",
        description: product.description ?? "",
      });
    } else {
      form.reset({
        type: "product",
        vendorId: "",
        name: "",
        cost: "",
        percentage: "",
        unit: "",
        description: "",
      });
    }
  }, [product, form]);

  console.log('error', form.formState.errors);
  return (
    <ResponsiveDialog 
      open={modal.isOpen} 
      onOpenChange={modal.onClose}
      title={product ? "แก้ไขกลุ่มสินค้า" : "กลุ่มสินค้าใหม่"}
      description=""
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="col-span-1 sm:col-span-2">
            <Label className="text-xs">ประเภท</Label>
            <Tabs value={form.watch("type")} className="w-full">
              <TabsList className="w-full flex">
                <TabsTrigger
                  className="flex-1 text-xs"
                  value="product"
                  onClick={() => onTypeChange("product")}
                >
                  สินค้า
                </TabsTrigger>
                <TabsTrigger
                  className="flex-1 text-xs"
                  value="service"
                  onClick={() => onTypeChange("service")}
                >
                  บริการ
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <FormSearchAsync
              disabled={!!product?.id}
              id="vendorId"
              label="ผู้ขาย/ร้านค้า"
              config={{
                endpoint: "/users",
                params: {
                  role: "vendor",
                },
              }}
              onSelected={(item) => {
                form.setValue("vendorId", item.value ? String(item.value) : "");
              }}
              defaultValue={
                product?.vendor
                  ? { id: String(product.vendor.id), label: product.vendor.name }
                  : undefined
              }
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">ชื่อสินค้า/บริการ <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="ชื่อสินค้า/บริการ"
                      className="text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">ต้นทุน</FormLabel>
                <FormControl>
                  <Input
                    id="cost"
                    type="number"
                    placeholder="ต้นทุน"
                    className="text-xs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">กำไร(%)</FormLabel>
                <FormControl>
                  <Input
                    id="percentage"
                    type="number"
                    placeholder="กำไร(%)"
                    className="text-xs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">หน่วย</FormLabel>
                <FormControl>
                  <Input
                    id="unit"
                    placeholder="หน่วย"
                    className="text-xs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-1 sm:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">รายละเอียด</FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      rows={6}
                      placeholder="รายละเอียด"
                      className="resize-none text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter className="col-span-1 sm:col-span-2 flex justify-end">
            <Button type="submit" size="sm">
              {product ? "แก้ไข" : "สร้าง"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
