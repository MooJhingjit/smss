"use client";

import { DialogFooter } from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { usePurchaseOrderListModal } from "@/hooks/use-po-list-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { Item, ItemStatus } from "@prisma/client";
import {
  InfoIcon,
  PackageOpenIcon,
  PackagePlus,
  TrashIcon,
} from "lucide-react";
import { updateItem } from "@/actions/item/update";
import { createPurchaseItem } from "@/actions/po-list/create";
import { updatePurchaseItem } from "@/actions/po-list/update";
import { deletePurchaseItem } from "@/actions/po-list/delete";
import { FormSearchAsync } from "../form/form-search-async";
import { ProductWithRelations } from "@/types";
import ConfirmActionButton from "../confirm-action";
import { Button } from "../ui/button";
import ProductBadge from "../badges/product-badge";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createItem } from "@/actions/item/create";
import { cn } from "@/lib/utils";
import { deleteItem } from "@/actions/item/delete";
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

// Schema for the item creation/update form
const ItemFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  serialNumber: z.string().optional(),
  warrantyDate: z.string().optional(),
  description: z.string().optional(),
});

export const PurchaseOrderListModal = () => {
  const modal = usePurchaseOrderListModal();
  const defaultData = modal.data;
  const purchaseOrderRelations = modal.refs;
  const isEditMode = !!defaultData?.id;

  // Schema for the main purchase order item form - conditional validation
  const PurchaseOrderItemFormSchema = z.object({
    productId: isEditMode 
      ? z.string().optional() // Optional in edit mode
      : z.string().min(1, { message: "Please select a product" }), // Required in create mode
    name: z.string().min(1, { message: "Product name is required" }),
    price: z.string(),
    unitPrice: z.string().min(1, { message: "Unit price is required" }),
    unit: z.string().min(1, { message: "Unit is required" }),
    quantity: z.string().min(1, { message: "Quantity is required" }),
    description: z.string().optional(),
    type: z.enum(["product", "service"]),
  });

  const form = useForm<z.infer<typeof PurchaseOrderItemFormSchema>>({
    resolver: zodResolver(PurchaseOrderItemFormSchema),
    defaultValues: {
      productId: "",
      name: defaultData?.name ?? "",
      unitPrice: defaultData?.unitPrice ? defaultData.unitPrice.toString() : "",
      unit: defaultData?.unit ?? "",
      price: defaultData?.price ? defaultData.price.toString() : "",
      quantity: defaultData?.quantity ? defaultData.quantity.toString() : "",
      description: defaultData?.description ?? "",
      type: defaultData?.type ?? "product",
    },
  });

  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [itemLists, setItemLists] = useState<Item[]>([]);

  // check if defaultData.items is not null then set to itemLists
  useEffect(() => {
    if (defaultData?.items) {
      setItemLists(defaultData.items);
    }
  }, [defaultData?.items]);

  useEffect(() => {
    const formData = {
      productId: "",
      name: defaultData?.name ?? "",
      unitPrice: defaultData?.unitPrice ? defaultData.unitPrice.toString() : "",
      unit: defaultData?.unit ?? "",
      price: defaultData?.price ? defaultData.price.toString() : "",
      quantity: defaultData?.quantity ? defaultData.quantity.toString() : "",
      description: defaultData?.description ?? "",
      type: defaultData?.type ?? ("product" as const),
    };
    form.reset(formData);
  }, [defaultData, form, purchaseOrderRelations?.timestamps]);

  const handleCreate = useAction(createPurchaseItem, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleUpdate = useAction(updatePurchaseItem, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleDelete = useAction(deletePurchaseItem, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const onSubmit = (data: z.infer<typeof PurchaseOrderItemFormSchema>) => {

    if (!purchaseOrderRelations) return;

    const unitPrice = Number(data.unitPrice);
    const quantity = Number(data.quantity);
    const totalPrice = unitPrice * quantity;

    if (defaultData?.id) {
      handleUpdate.execute({
        id: defaultData.id,
        unitPrice: unitPrice,
        unit: data.unit,
        quantity,
        description: data.description ?? "",
        price: totalPrice,
      });
      return;
    }

    if (!purchaseOrderRelations?.id) {
      toast.error("Purchase order information is missing");
      return;
    }

    handleCreate.execute({
      name: data.name,
      productId: Number(data.productId), // This will now be validated by the schema
      price: totalPrice,
      unitPrice: unitPrice,
      unit: data.unit,
      quantity,
      description: data.description ?? "",
      type: data.type,
      purchaseOrderId: purchaseOrderRelations.id,
    });
  };

  // on unitprice and quantity change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "unitPrice" || name === "quantity") {
        const unitPrice = Number(value.unitPrice ?? 0);
        const quantity = Number(value.quantity ?? 0);
        form.setValue("price", (unitPrice * quantity).toString());
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const isNewItem = !defaultData;
  const itemId = defaultData?.id;

  const newDefaultItemObject = {
    id: 0,
    name: "",
    description: "",
    serialNumber: "",
    warrantyDate: null,
    productId: defaultData?.items?.[0]?.productId ?? 1,
    purchaseOrderItemId: defaultData?.id ?? null,
    cost: 0,
    status: ItemStatus.available,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log('error', form.formState.errors);

  return (
    <ResponsiveDialog
      open={modal.isOpen}
      onOpenChange={modal.onClose}
      title={purchaseOrderRelations?.vendor?.name ?? "Purchase Order"}
      description="จัดการรายการสินค้าในใบสั่งซื้อ"
    >
      <div className="">
        <Tabs defaultValue="itemForm" className="w-auto">
          <TabsList>
            <TabsTrigger value="itemForm">
              <div className="flex items-center justify-center space-x-1">
                <InfoIcon size={16} />
                <p>รายการสินค้า</p>
              </div>
            </TabsTrigger>
            <TabsTrigger value="store" disabled={!itemId}>
              <div className="flex items-center justify-center space-x-1">
                <PackageOpenIcon size={16} />
                <p>สินค้าในระบบ ({defaultData?.items?.length ?? 0})</p>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="itemForm" className="mt-3">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Hidden type field */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input type="hidden" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Product Search */}
                  <div className="col-span-1 sm:col-span-4">
                    {isNewItem ? (
                      <FormField
                        control={form.control}
                        name="productId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              ค้นหาชื่อสินค้า/บริการ{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <FormSearchAsync
                                id="productId"
                                config={{
                                  endpoint: "products",
                                  params: {
                                    vendorId:
                                      purchaseOrderRelations?.vendor?.id,
                                  },
                                  customRender: (
                                    data: ProductWithRelations
                                  ) => {
                                    return {
                                      value: data.id,
                                      label: `[${data.type}] : ${data.name} (${data.vendor?.name})`,
                                      data: data,
                                    };
                                  },
                                }}
                                onSelected={(item: {
                                  value: number;
                                  label: string;
                                  data: ProductWithRelations;
                                }) => {
                                  field.onChange(
                                    item.value ? String(item.value) : ""
                                  );
                                  form.setValue(
                                    "unitPrice",
                                    item.data.cost?.toString() ?? ""
                                  );
                                  form.setValue("unit", item.data.unit ?? "");
                                  form.setValue("quantity", "1");
                                  form.setValue("name", item.data.name);
                                  form.setValue(
                                    "description",
                                    item.data.description ?? ""
                                  );
                                  form.setValue("type", item.data.type);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <div className="p-2 border border-gray-200 rounded-md bg-gray-100">
                        <Label>สินค้าที่สั่งซื้อ</Label>
                        <ProductBadge
                          name={defaultData.name}
                          type={defaultData.type}
                        />
                      </div>
                    )}
                  </div>

                  {/* Unit Price */}
                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>
                          ราคาต่อหน่วย <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quantity */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>
                          จำนวน <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            readOnly={!isNewItem}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Unit */}
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>
                          หน่วย <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Total Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>ราคารวม</FormLabel>
                        <FormControl>
                          <Input type="number" readOnly {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-1 sm:col-span-4">
                        <FormLabel>รายละเอียด</FormLabel>
                        <FormControl>
                          <Textarea
                            id="description"
                            rows={10}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  {isNewItem && (
                    <Button type="submit" disabled={handleCreate.isLoading}>
                      {handleCreate.isLoading
                        ? "กำลังสร้าง..."
                        : "สร้างรายการใหม่"}
                    </Button>
                  )}

                  {defaultData?.id && (
                    <div className="flex justify-between w-full">
                      {/* Custom PO can remove order item */}
                      <div className="flex space-x-3">
                        <RemoveButton
                          quotationId={purchaseOrderRelations?.quotationId}
                          onDelete={() =>
                            handleDelete.execute({ id: defaultData.id })
                          }
                        />
                      </div>
                      <Button type="submit" disabled={handleUpdate.isLoading}>
                        {handleUpdate.isLoading
                          ? "กำลังอัพเดท..."
                          : "อัพเดทรายการ"}
                      </Button>
                    </div>
                  )}
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="store" className="mt-3 space-y-4">
            {!!itemLists && (
              <div className="space-y-8">
                {itemLists.map((item: Item) => (
                  <NewItemForm
                    data={item}
                    key={item.id}
                    onDeleted={(id) => {
                      setItemLists(itemLists.filter((i) => i.id !== id));
                    }}
                  />
                ))}
              </div>
            )}

            {!showNewItemForm && (
              <Button
                onClick={() => setShowNewItemForm(true)}
                className="w-full flex items-center justify-center mt-6"
                variant={"secondary"}
              >
                <PackagePlus size={16} className="mr-2" />
                <p>เพิ่มรายการ</p>
              </Button>
            )}
            {showNewItemForm && (
              <NewItemForm
                data={newDefaultItemObject}
                onCreated={(newItem: Item) => {
                  setItemLists([...itemLists, newItem]);
                  setShowNewItemForm(false);
                }}
                onCancel={() => setShowNewItemForm(false)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveDialog>
  );
};

const RemoveButton = ({
  quotationId,
  onDelete,
}: {
  quotationId?: number | null;
  onDelete: () => void;
}) => {
  if (quotationId) return null;
  return (
    <ConfirmActionButton onConfirm={onDelete}>
      <Button variant="link" size="sm" className="text-red-500">
        ลบรายการ
      </Button>
    </ConfirmActionButton>
  );
};

const NewItemForm = ({
  data,
  onCancel,
  onCreated,
  onDeleted,
}: {
  data: Item;
  onCancel?: () => void;
  onCreated?: (newItem: Item) => void;
  onDeleted?: (id: number) => void;
}) => {
  const form = useForm<z.infer<typeof ItemFormSchema>>({
    resolver: zodResolver(ItemFormSchema),
    defaultValues: {
      name: data?.name ?? "",
      serialNumber: data?.serialNumber ?? "",
      warrantyDate: data?.warrantyDate
        ? new Date(data.warrantyDate).toISOString().slice(0, 10)
        : "",
      description: data?.description ?? "",
    },
  });

  const handleCreate = useAction(createItem, {
    onSuccess: (data) => {
      onCreated && onCreated(data);
      toast.success("สำเร็จ");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleUpdate = useAction(updateItem, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleDelete = useAction(deleteItem, {
    onSuccess: () => {
      onDeleted && onDeleted(data.id);
      toast.success("สำเร็จ");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onDelete = () => {
    if (data.id) {
      handleDelete.execute({
        id: data.id,
      });
    }
  };

  const onSubmit = (formData: z.infer<typeof ItemFormSchema>) => {
    if (data.id !== 0) {
      handleUpdate.execute({
        ...data,
        name: formData.name,
        serialNumber: formData.serialNumber ?? "",
        warrantyDate: formData.warrantyDate ?? "",
        description: formData.description ?? "",
      });
    } else {
      // create new item
      handleCreate.execute({
        name: formData.name,
        serialNumber: formData.serialNumber ?? "",
        warrantyDate: formData.warrantyDate ?? "",
        description: formData.description ?? "",
        productId: data.productId as number, // product id is 1 which is custom
        purchaseOrderItemId: data.purchaseOrderItemId as number,
        status: ItemStatus.available,
      });
    }

    // reset data
    form.reset(formData);
  };

  const isNew = data.id === 0;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 border",
          data.id === 0
            ? "border-dashed border-green-200 bg-green-50"
            : "border-gray-200"
        )}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="col-span-1 sm:col-span-2">
              <FormLabel>ชื่อรุ่น</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serialNumber"
          render={({ field }) => (
            <FormItem className="col-span-1 sm:col-span-2">
              <FormLabel>รหัส (SN)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="warrantyDate"
          render={({ field }) => (
            <FormItem className="col-span-1 sm:col-span-2">
              <FormLabel>ระยะเวลาการรับประกัน</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="col-span-1 sm:col-span-2">
              <FormLabel>หมายเหตุ</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-1 sm:col-span-4 flex justify-end space-x-2">
          {!isNew && form.formState.isDirty && (
            <Button type="submit" disabled={handleUpdate.isLoading}>
              {handleUpdate.isLoading ? "กำลังอัพเดท..." : "อัพเดท"}
            </Button>
          )}
          {isNew && form.formState.isDirty && (
            <Button type="submit" disabled={handleCreate.isLoading}>
              {handleCreate.isLoading ? "กำลังเพิ่ม..." : "เพิ่ม"}
            </Button>
          )}
          {!isNew && (
            <ConfirmActionButton onConfirm={onDelete}>
              <Button type="button" variant={"link"} size="sm">
                <TrashIcon size={16} className="text-red-300 mr-1" />
                <p className="text-red-300">ลบ</p>
              </Button>
            </ConfirmActionButton>
          )}

          {onCancel && (
            <Button onClick={onCancel} variant="link" size="sm">
              ยกเลิก
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
