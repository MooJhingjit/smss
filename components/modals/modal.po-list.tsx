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
import { useEffect } from "react";
import { FormSubmit } from "../form/form-submit";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { Item, ProductType } from "@prisma/client";
import { PackagePlus } from "lucide-react";
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

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            รายการสินค้า ({purchaseOrderRelations?.vendor?.name})
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3 mt-3">
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
                  <Label className="text-xs">ชื่อสินค้า</Label>
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
              <div className="col-span-4  flex justify-end space-x-3">
                {!purchaseOrderRelations?.quotationId && (
                  <ConfirmActionButton
                    onConfirm={() => {
                      handleDelete.execute({ id: defaultData.id });
                    }}
                  >
                    <Button variant="link" size="sm" className="text-red-500">
                      ลบรายการ
                    </Button>
                  </ConfirmActionButton>
                )}

                <div className="">
                  <FormSubmit>อัพเดท</FormSubmit>
                </div>
              </div>
            )}
          </form>

          {!!defaultData?.items.length && (
            <div className="bg-green-50 w-full col-span-4 gird grid-cols-4 p-4 gap-4">
              <div className="col-span-2 flex items-center space-x-2 mb-2">
                <PackagePlus size={16} className="" />
                <p className="font-medium cursor-default text-xs capitalize">
                  รับสินค้าเข้าระบบ
                </p>
              </div>
              <div className="col-span-4">
                <div className="w-full rounded-md p-4 border border-gray-200">
                  <div className="space-y-8">
                    {defaultData?.items.map((item: Item) => (
                      <NewItemForm key={item.id} data={item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

type ItemInput = {
  name: string;
  serialNumber: string;
  warrantyDate: string;
  description: string;
};

const NewItemForm = ({ data }: { data: Item }) => {
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

  const handleUpdate = useAction(updateItem, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (formData: FormData) => {
    const serialNumber = formData.get("serialNumber") as string;
    const name = formData.get("name") as string;
    const warrantyDate = formData.get("warrantyDate") as string;
    const description = formData.get("description") as string;

    handleUpdate.execute({
      ...data,
      name,
      serialNumber,
      warrantyDate,
      description,
    });

    // reset data
    reset({
      name,
      serialNumber,
      warrantyDate,
      description,
    });
  };

  return (
    <form action={onSubmit} className="grid grid-cols-4 gap-3">
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
        {isDirty && <FormSubmit>อัพเดท</FormSubmit>}
      </div>
    </form>
  );
};

