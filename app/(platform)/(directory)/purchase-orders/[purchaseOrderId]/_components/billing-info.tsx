import { Button } from "@/components/ui/button";
import { PurchaseOrderWithRelations } from "@/types";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAction } from "@/hooks/use-action";
import { updatePurchaseOrder } from "@/actions/po/update";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type FormInput = {
  discount: number;
  extraCost: number;
  totalPrice: number;
  tax: number;
  vat: number;
  grandTotal: number;
};
export default function BillingInfo({
  isManual,
  data,
}: {
  isManual: boolean;
  data: PurchaseOrderWithRelations;
}) {
  const {
    register,
    reset,
    getValues,
    setValue,
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<FormInput>({
    mode: "onChange",
    defaultValues: {
      discount: data.discount ?? 0,
      extraCost: data.extraCost ?? 0,
      totalPrice: data.totalPrice ?? 0,
      tax: data.tax ?? 0, // -3%
      vat: data.vat ?? 0, // +7%
      grandTotal: data.grandTotal ?? 0,
    },
  });

  // when discount or extraCost change
  const onChange = () => {
    const { discount, extraCost } = getValues();

    // convert to number
    const discountNum = Number(discount);
    const extraCostNum = Number(extraCost);

    let tPrice = data.totalPrice ?? 0;

    // if manual input
    if (isManual) {
      tPrice = Number(getValues("totalPrice"));
    }
    const totalPrice = tPrice - discountNum + extraCostNum;
    const vat = totalPrice * 0.07;
    const tax = totalPrice * 0.03;
    const grandTotal = totalPrice + vat - tax;

    // setValue("totalPrice", totalPrice);
    setValue("vat", vat);
    setValue("tax", tax);
    setValue("grandTotal", grandTotal);
  };

  const discount = useWatch({ name: "discount", control });
  const extraCost = useWatch({ name: "extraCost", control });
  const totalPrice = useWatch({ name: "totalPrice", control });
  const tax = useWatch({ name: "tax", control });
  const vat = useWatch({ name: "vat", control });
  const grandTotal = useWatch({ name: "grandTotal", control });

  const handleUpdate = useAction(updatePurchaseOrder, {
    onSuccess: (data) => {
      toast.success("สำเร็จ");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (formData: FormInput) => {
    handleUpdate.execute({
      ...formData,
      totalPrice: Number(formData.totalPrice),
      discount: Number(formData.discount),
      extraCost: Number(formData.extraCost),
      id: data.id,
      formType: "billing",
    });
  };

  const onReset = () => {
    reset();
  };

  React.useEffect(() => {
    if (isDirty) {
      onChange();
    }
  }, [isDirty, discount, extraCost, onChange]);

  const priceBeforeTax =
    Number(totalPrice) - Number(discount) + Number(extraCost);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-gray-100 px-4 py-2 w-full sm:rounded-lg sm:px-6"
    >
      <dl className="divide-y divide-gray-200 text-sm">
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">ราคา</dt>
          <dd className="font-medium text-gray-900">
            {isManual ? (
              <Input
                id="totalPrice"
                {...register("totalPrice")}
                step={0.01}
                type="number"
                className="h-[30px] border border-gray-300 text-right px-2 text-xs focus:ring-0"
                defaultValue={0}
              />
            ) : (
              totalPrice?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              }) ?? 0
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">ส่วนลด</dt>
          <dd className="font-medium text-gray-900">
            <Input
              id="discount"
              {...register("discount")}
              step={0.01}
              type="number"
              className="h-[30px] border border-gray-300 text-right px-2 text-xs focus:ring-0"
              defaultValue={0}
            />
          </dd>
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">ต้นทุนเพิ่ม</dt>
          <dd className="font-medium text-gray-900">
            <Input
              id="extraCost"
              {...register("extraCost")}
              type="number"
              step={0.01}
              className="h-[30px] border border-gray-300 text-right px-2 text-xs focus:ring-0  "
              defaultValue={0}
            />
          </dd>
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">ราคาก่อนหักภาษี</dt>
          <dd className="font-medium text-gray-900">
            {priceBeforeTax?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }) ?? 0}
          </dd>
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">7% Vat</dt>
          <dd className="font-medium text-yellow-600">
            {vat?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }) ?? 0}
          </dd>
        </div>
        <div className="flex items-center justify-between py-1">
          <dt className="text-gray-600">หัก ณ ที่จ่าย 3%</dt>
          <dd className="font-medium text-yellow-600">
            {tax?.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            }) ?? 0}
          </dd>
        </div>
        <div className="flex items-center justify-between pt-4">
          <dt className="font-medium text-gray-900">ราคาทั้งหมด</dt>

          <dd className="font-medium text-primary-600 flex items-center space-x-2">
            {isDirty && (
              <div className="flex items-center space-x-3 px-2">
                <Button
                  onClick={onReset}
                  size={"sm"}
                  type="button"
                  variant="link"
                  className="text-xs text-orange-400 underline"
                >
                  ยกเลิก
                </Button>
                <Button size={"sm"} type="submit" className="text-xs">
                  บันทึก
                </Button>
              </div>
            )}
            <span>
              {" "}
              {grandTotal?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              }) ?? 0}
            </span>
          </dd>
        </div>
      </dl>
    </form>
  );
}
