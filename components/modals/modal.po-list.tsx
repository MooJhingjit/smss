"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePurchaseOrderListModal } from "@/hooks/use-po-list-modal";
import { FormInput } from "../form/form-input";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { FormSubmit } from "../form/form-submit";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { Item, ItemStatus, ProductType } from "@prisma/client";
import { ArrowRight, InfoIcon, PackageOpen, PackageOpenIcon, PackagePlus, TrashIcon } from "lucide-react";
import { updateItem } from "@/actions/item/update";
import { createPurchaseItem } from "@/actions/po-list/create";
import { updatePurchaseItem } from "@/actions/po-list/update";
import { deletePurchaseItem } from "@/actions/po-list/delete";
import { FormSearchAsync } from "../form/form-search-async";
import { ProductWithRelations } from "@/types";
import ConfirmActionButton from "../confirm-action";
import { Button } from "../ui/button";
import { FormTextarea } from "../form/form-textarea";
import ProductBadge from "../badges/product-badge";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createItem } from "@/actions/item/create";
import { cn } from "@/lib/utils";
import { deleteItem } from "@/actions/item/delete";

type FormInput = {
  productId: string;
  name: string;
  price: string;
  unitPrice: string;
  unit: string;
  quantity: string;
  description: string;
  type: ProductType;
};
export const PurchaseOrderListModal = () => {
  const modal = usePurchaseOrderListModal();
  const defaultData = modal.data;
  const purchaseOrderRelations = modal.refs;
  const { register, reset, setValue, getValues, watch } = useForm<FormInput>({
    mode: "onChange",
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
      name: defaultData?.name ?? "",
      unitPrice: defaultData?.unitPrice ? defaultData.unitPrice.toString() : "",
      unit: defaultData?.unit ?? "",
      price: defaultData?.price ? defaultData.price.toString() : "",
      quantity: defaultData?.quantity ? defaultData.quantity.toString() : "",
      description: defaultData?.description ?? "",
      type: defaultData?.type,
    };
    reset(formData);

  }, [purchaseOrderRelations?.timestamps]);

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

  const onSubmit = async (formData: FormData) => {
    if (!purchaseOrderRelations) return;

    const name = getValues("name");
    const productId = getValues("productId");

    const unitPrice = Number(formData.get("unitPrice"));
    const quantity = Number(formData.get("quantity"));
    const totalPrice = unitPrice * quantity;

    if (defaultData?.id) {
      handleUpdate.execute({
        id: defaultData.id,
        unitPrice: unitPrice,
        unit: formData.get("unit") as string,
        quantity,
        description: formData.get("description") as string,
        price: totalPrice,
      });
      return;
    }

    handleCreate.execute({
      name: name,
      productId: Number(productId),
      price: totalPrice,
      unitPrice: unitPrice,
      unit: formData.get("unit") as string,
      quantity,
      description: formData.get("description") as string,
      type: getValues("type"),
      purchaseOrderId: purchaseOrderRelations.id,
    });
  };

  // on unitprice and quantity change
  useEffect(() => {
    const unitPrice = Number(getValues("unitPrice"));
    const quantity = Number(getValues("quantity"));
    setValue("price", (unitPrice * quantity).toString());
  }, [watch("unitPrice"), watch("quantity")]);

  const isNewItem = !defaultData;

  const itemId = defaultData?.id;

  const newDefaultItemObject = {
    id: 0,
    name: "",
    description: "",
    serialNumber: "",
    warrantyDate: null,
    productId: defaultData?.items[0]?.productId ?? 1,
    purchaseOrderItemId: defaultData?.id ?? null,
    cost: 0,
    status: ItemStatus.available,
    createdAt: new Date(),
    updatedAt: new Date(),
  };


  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {purchaseOrderRelations?.vendor?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="">

          <Tabs defaultValue="itemForm" className="w-auto">
            <TabsList>
              <TabsTrigger value="itemForm">
                <div className="flex items-center justify-center space-x-1">
                  <InfoIcon size={16} />
                  <p>รายการสินค้า</p>
                </div>
              </TabsTrigger>
              <TabsTrigger value="store"> <div className="flex items-center justify-center space-x-1">
                <PackageOpenIcon size={16} />
                <p>สินค้าในระบบ ({defaultData?.items.length})</p>
              </div></TabsTrigger>
            </TabsList>
            <TabsContent value="itemForm" className="grid grid-cols-4 gap-3 mt-3 ">
              <form action={onSubmit} className="grid col-span-4 gap-3">
                <FormInput
                  id="type"
                  type="hidden"
                  readOnly
                  register={register}
                  defaultValue={defaultData?.type}
                />

                <div className="col-span-4">
                  {isNewItem ? (
                    <FormSearchAsync
                      id="productId"
                      label="ค้นหาชื่อสินค้า/บริการ"
                      required
                      config={{
                        endpoint: "products",
                        params: {
                          vendorId: purchaseOrderRelations?.vendor?.id,
                        },
                        customRender: (data: ProductWithRelations) => {
                          return {
                            value: data.id,
                            label: `${data.name} (${data.vendor?.name})`,
                            data: data,
                          };
                        },
                      }}
                      onSelected={(item: {
                        value: string;
                        label: string;
                        data: ProductWithRelations;
                      }) => {
                        setValue("unitPrice", item.data.cost?.toString() ?? "");
                        setValue("unit", item.data.unit ?? "");
                        setValue("quantity", "1");
                        setValue("productId", item.value);
                        setValue("name", item.data.name);
                        setValue("description", item.data.description ?? "");
                        setValue("type", item.data.type);
                      }}
                      errors={handleCreate.fieldErrors}
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

                <div className="col-span-1">
                  <FormInput
                    id="unitPrice"
                    key={`cost_${itemId}`}
                    label="ราคาต่อหน่วย"
                    type="number"
                    register={register}
                    errors={handleCreate.fieldErrors}
                  />
                </div>
                <div className="col-span-1">
                  <FormInput
                    id="quantity"
                    label="จำนวน"
                    type="number"
                    readOnly={!isNewItem}
                    register={register}
                    onChange={(e) => {
                      const unitPrice = Number(getValues("unitPrice"));
                      const quantity = Number(e.target.value);
                      setValue("price", (unitPrice * quantity).toString());
                    }}
                    defaultValue={defaultData?.quantity}
                    errors={handleCreate.fieldErrors}
                  />
                </div>
                <div className="col-span-1">
                  <FormInput
                    id="unit"
                    label="หน่วย"
                    // readOnly={!isNewItem}
                    register={register}
                    defaultValue={defaultData?.unit}
                    errors={handleCreate.fieldErrors}
                  />
                </div>
                <div className="col-span-1">
                  <FormInput
                    id="price"
                    label="ราคารวม"
                    type="number"
                    readOnly={true}
                    register={register}
                    defaultValue={defaultData?.price}
                    errors={handleCreate.fieldErrors}
                  />
                </div>
                <div className="col-span-4">
                  <FormTextarea
                    id="description"
                    label="รายละเอียด"
                    // disabled={!isNewItem}
                    errors={handleCreate.fieldErrors}
                    register={register}
                    defaultValue={defaultData?.description ?? ""}
                    rows={10}
                  />
                </div>

                {isNewItem && (
                  <div className="col-span-4 flex justify-end">
                    <FormSubmit>สร้างรายการใหม่</FormSubmit>
                  </div>
                )}

                {defaultData?.id && (
                  <div className="col-span-4  flex justify-between ">
                    <div className="">
                      {/* <Button
                    size="sm"
                    className="bg-orange-500 text-white hover:bg-orange-600"
                    onClick={() => setShowStore(true)}
                    type="button">
                    รับสินค้าเข้าระบบ

                    <ArrowRight size={16} className="ml-2" />
                  </Button> */}
                    </div>
                    {/* custom PO can remove order item */}
                    <div className="flex n space-x-3">
                      <RemoveButton
                        quotationId={purchaseOrderRelations?.quotationId}
                        onDelete={() => handleDelete.execute({ id: defaultData.id })}
                      />
                      <div className="">
                        <FormSubmit>อัพเดทรายการ</FormSubmit>
                      </div>
                    </div>
                  </div>
                )}
              </form>
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
                      }
                      }

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
                  }
                  }
                  onCancel={() => setShowNewItemForm(false)}
                />
              )}
            </TabsContent>
          </Tabs>





        </div>
      </DialogContent>
    </Dialog>
  );
};

const RemoveButton = ({
  quotationId,
  onDelete,
}: {
  quotationId?: number | null;
  onDelete: () => void;
}) => {
  if (quotationId) return
  return (
    <ConfirmActionButton
      onConfirm={onDelete}
    >
      <Button variant="link" size="sm" className="text-red-500">
        ลบรายการ
      </Button>
    </ConfirmActionButton>
  )
}

type ItemInput = {
  name: string;
  serialNumber: string;
  warrantyDate: string;
  description: string;
};

const NewItemForm = (
  { data, onCancel, onCreated, onDeleted }:
    { data: Item, onCancel?: () => void, onCreated?: (newItem: Item) => void, onDeleted?: (id: number) => void }
) => {
  const {
    register,
    watch,
    reset,
    getValues,
    formState: { errors, isValid, isDirty },
  } = useForm<ItemInput>({
    mode: "onChange",
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
        id: data.id
      });
    }
  }

  const onSubmit = (formData: FormData) => {
    const serialNumber = formData.get("serialNumber") as string;
    const name = formData.get("name") as string;
    const warrantyDate = formData.get("warrantyDate") as string;
    const description = formData.get("description") as string;

    if (data.id !== 0) {
      handleUpdate.execute({
        ...data,
        name,
        serialNumber,
        warrantyDate,
        description,
      });
    } else {
      // create new item
      handleCreate.execute({
        name,
        serialNumber,
        warrantyDate,
        description,
        productId: data.productId as number, // product id is 1 which is custom
        purchaseOrderItemId: data.purchaseOrderItemId as number,
        status: ItemStatus.available,
      });
    }


    // reset data
    reset({
      name,
      serialNumber,
      warrantyDate,
      description,
    });
  };

  const isNew = data.id === 0;

  return (
    <form action={onSubmit} className={cn(
      "grid grid-cols-4 gap-3 p-4 border",
      data.id === 0 ? "border-dashed border-green-200 bg-green-50" : "border-gray-200"
    )}>
      <div className="col-span-2">
        <FormInput
          id="name"
          label="ชื่อรุ่น"
          type="text"
          register={register}
        // defaultValue={item?.serialNumber}
        // errors={fieldErrors}
        />
      </div>
      <div className="col-span-2">
        <FormInput
          id="serialNumber"
          label="รหัส (SN)"
          type="text"
          register={register}
        // defaultValue={item?.serialNumber}
        // errors={fieldErrors}
        />
      </div>
      <div className="col-span-2">
        <FormInput
          id="warrantyDate"
          label="ระยะเวลาการรับประกัน"
          type="date"
          register={register}
        />
      </div>
      <div className="col-span-2">
        <FormInput
          id="description"
          label="หมายเหตุ"
          type="text"
          register={register}
        />
      </div>
      <div className="col-span-4 flex justify-end">
        {!isNew && isDirty && <FormSubmit>อัพเดท</FormSubmit>}
        {isNew && isDirty && <FormSubmit>เพิ่ม</FormSubmit>}
        {!isNew &&
          <ConfirmActionButton
            onConfirm={onDelete}
          >
            <Button type="button" variant={"link"} size="sm">
              <TrashIcon size={16} className="text-red-300 mr-1" />
              <p className="text-red-300">ลบ</p>
            </Button>
          </ConfirmActionButton>
        }

        {onCancel && <Button onClick={onCancel} variant="link" size="sm">ยกเลิก</Button>}
      </div>
    </form>
  );
};


