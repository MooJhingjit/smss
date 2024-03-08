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
import { Item } from "@prisma/client";
import { PackagePlus } from "lucide-react";
import { updateItem } from "@/actions/item/update";
import { createPurchaseItem } from "@/actions/po-list/create";
import { FormSearchAsync } from "../form/form-search-async";
import { ProductWithRelations } from "@/types";

type FormInput = {
  productId: string;
  name: string;
  price: string;
  quantity: string;
};
export const PurchaseOrderListModal = () => {
  const modal = usePurchaseOrderListModal();
  const defaultData = modal.data;
  const purchaseOrderRelations = modal.refs;

  const { register, reset, setValue, getValues } = useForm<FormInput>({
    mode: "onChange",
  });

  useEffect(() => {
    const formData = {
      name: defaultData?.name ?? "",
      price: defaultData?.price ? defaultData.price.toString() : "",
      quantity: defaultData?.quantity ? defaultData.quantity.toString() : "",
    };
    reset(formData);
  }, [defaultData, reset]);

  const handleCreate = useAction(createPurchaseItem, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = async (formData: FormData) => {

    if (!purchaseOrderRelations) return;

    const name = getValues("name");
    const productId = getValues("productId");

    handleCreate.execute({
      name: name,
      productId: Number(productId),
      price: Number(formData.get("price")),
      quantity: Number(formData.get("quantity")),
      purchaseOrderId: purchaseOrderRelations.id
    });
  };

  const isNewItem = !defaultData
  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>รายการสินค้า ({purchaseOrderRelations?.vendor?.name})</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3 mt-3">
          <form action={onSubmit} className="grid col-span-4 gap-3">
            <div className="col-span-4">
              {
                isNewItem ? (
                  <FormSearchAsync
                    id="productId"
                    label="ค้นหาชื่อสินค้า/บริการ"
                    required
                    config={{
                      endpoint: "products",
                      params: {
                        vendorId : purchaseOrderRelations?.vendor?.id
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
                      setValue("price", item.data.cost?.toString() ?? "");
                      setValue("productId", item.value);
                      setValue("name", item.data.name);
                    }}
                    errors={handleCreate.fieldErrors}
                  />
                ) : (
                  <FormInput
                    id="name"
                    label="ชื่อสินค้า"
                    register={register}
                    readOnly={!isNewItem}
                  />
                )
              }

            </div>

            <div className="col-span-2">
              <FormInput
                id="price"
                label="ราคาต่อหน่วย"
                type="number"
                readOnly={!isNewItem}
                register={register}
                errors={handleCreate.fieldErrors}
              />
            </div>
            <div className="col-span-2">
              <FormInput
                id="quantity"
                label="จำนวน"
                type="number"
                readOnly={!isNewItem}
                register={register}
                defaultValue={defaultData?.quantity}
                errors={handleCreate.fieldErrors}
              />
            </div>
            <div className="col-span-4 flex justify-end">
              <FormSubmit>สร้างรายการใหม่</FormSubmit>
            </div>
          </form>
          {
            !!defaultData?.items && (
              <>
                <div className="col-span-2 flex items-center space-x-2">
                  <PackagePlus size={16} className="" />
                  <p className="font-medium cursor-default text-xs capitalize">
                    รับสินค้าเข้าระบบ
                  </p>
                </div>
                <div className="col-span-4">
                  <div className="w-full rounded-md p-4 border border-gray-200">
                    <div className="space-y-8">
                      {defaultData?.items.map((item: Item) => (
                        <NewItemForm
                          key={item.id}
                          data={item}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )
          }
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

const NewItemForm = ({ data }: {
  data: Item
}) => {

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
      warrantyDate: data?.warrantyDate ? new Date(data.warrantyDate).toISOString().slice(0, 10) : "",
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
      description
    });
  }

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
        // defaultValue={
        //   item?.warrantyDate
        //     ? new Date(item.warrantyDate).toISOString().slice(0, 10)
        //     : undefined
        // }
        // errors={fieldErrors}
        />
      </div>
      <div className="col-span-2">

        <FormInput
          id="description"
          label="หมายเหตุ"
          type="text"
          register={register}
        // defaultValue={item?.name}
        // errors={fieldErrors}
        />
      </div>
      <div className="col-span-4 flex justify-end">
        {
          isDirty && (
            <FormSubmit>อัพเดท</FormSubmit>
          )
        }
      </div>
    </form>

  );
};
