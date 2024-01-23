"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormSearchAsync } from "../form/form-search-async";
import { FormSubmit } from "../form/form-submit";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { createQuotationList } from "@/actions/quotation-list/create";
import { updateQuotationList } from "@/actions/quotation-list/update";
import { FormInput } from "../form/form-input";
import { useQuotationListModal } from "@/hooks/use-quotation-list";
import { useEffect, useState } from "react";
import { Product } from "@prisma/client";
import { useForm } from "react-hook-form";
import { FormTextarea } from "../form/form-textarea";

type FormInput = {
  productId: string;
  name: string;
  price: string;
  unitPrice: string;
  cost: string;
  percentage: string;
  quantity: string;
  withholdingTax: string;
  withholdingTaxPercent: string;
  totalPrice: string;
  discount: string;
  description: string;
};

export const QuotationListModal = () => {
  // const [productSelected, setProduct] = useState<Product | null>(null);
  const modal = useQuotationListModal();
  const defaultData = modal.data;
  const p = defaultData?.percentage?.toString() ?? ""
  const refs = modal.refs;
  const {
    register,
    watch,
    reset,
    getValues,
    setValue,
    // formState: { dirtyFields }
  } = useForm<FormInput>({
    mode: "onChange",
  });

  useEffect(() => {
    const formData = {
      name: defaultData?.name ?? "",
      price: defaultData?.price ? defaultData.price.toString() : "",
      unitPrice: defaultData?.unitPrice
        ? defaultData.unitPrice.toString()
        : "",
      cost: defaultData?.cost ? defaultData.cost.toString() : "",
      percentage: p,
      quantity: defaultData?.quantity ? defaultData.quantity.toString() : "1",
      withholdingTax: defaultData?.withholdingTax
        ? defaultData.withholdingTax.toString()
        : "",
      withholdingTaxPercent: defaultData?.withholdingTaxPercent
        ? defaultData.withholdingTaxPercent.toString()
        : "7",
      totalPrice: defaultData?.totalPrice
        ? defaultData.totalPrice.toString()
        : "",
      discount: defaultData?.discount ? defaultData.discount.toString() : "",
      description: defaultData?.description ?? "",
    }
    reset(
      formData,
    )
  }, [defaultData, reset])

  const handleCreate = useAction(createQuotationList, {
    onSuccess: (data) => {
      toast.success("New list created");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const handleUpdate = useAction(updateQuotationList, {
    onSuccess: (data) => {
      toast.success("List updated");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const onSubmit = async (formData: FormData) => {
    const productId = formData.get("productId") as string;
    const price = formData.get("price") as string;
    const cost = formData.get("cost") as string;
    const percentage = formData.get("percentage") as string;
    const quantity = formData.get("quantity") as string;
    const withholdingTax = formData.get("withholdingTax") as string;
    const withholdingTaxPercent = formData.get(
      "withholdingTaxPercent",
    ) as string;

    const product = productId
      ? parseInt(productId)
      : refs?.productRef?.id ?? null;

    const total = formData.get("totalPrice") as string;
    const discount = formData.get("discount") as string;
    const description = formData.get("description") as string;

    if (!refs?.quotationRef?.id || !product) {
      toast.error("Quotation not found");
      return;
    }

    const payload = {
      quotationId: refs.quotationRef.id,
      productId: product,
      name: "",
      price: parseFloat(price),
      unitPrice: parseFloat(price),
      cost: parseFloat(cost),
      percentage: parseFloat(percentage),
      quantity: parseFloat(quantity),
      withholdingTax: parseFloat(withholdingTax),
      withholdingTaxPercent: parseFloat(withholdingTaxPercent),
      totalPrice: parseFloat(total),
      discount: parseFloat(discount),
      description,
    };


    if (defaultData?.id) {
      handleUpdate.execute({
        id: defaultData.id,
        ...payload,
      });
      return;
    }

    handleCreate.execute({ ...payload });
  };

  const fieldErrors = (defaultData?.id ? handleUpdate : handleCreate).fieldErrors;

  useEffect(() => {

    const cost = watch('cost');
    const percentage = watch('percentage');
    if (cost && percentage) {
      const unitPrice = parseFloat(cost) + (parseFloat(cost) * parseFloat(percentage)) / 100
      // multiply by quantity
      const quantity = watch('quantity')
      // console.log("quantity", quantity)
      let totalPrice = unitPrice
      if (quantity) {
        totalPrice = unitPrice * parseFloat(quantity)
      }
      setValue('price', unitPrice.toString())

      // calculate tax 7%
      const tax = (totalPrice * 7) / 100
      setValue('withholdingTax', tax.toString())

      // set total price + tax - discount
      const discount = watch('discount')
      let total = totalPrice + tax
      if (discount) {
        total = total - parseFloat(discount)
      }
      setValue('totalPrice', total.toString())
    }
  }, [watch('cost'), watch('percentage'), watch('quantity'), watch('discount')]);

  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Quotation List</DialogTitle>
          {/* <DialogDescription>Please select the customer.</DialogDescription> */}
        </DialogHeader>
        <form action={onSubmit} className="grid grid-cols-4 gap-3 mt-3">
          <div className="col-span-4">
            <FormSearchAsync
              id="productId"
              label="Product"
              config={{
                endpoint: "products",
                params: {},
              }}
              defaultValue={{
                id: defaultData?.product.id,
                label: defaultData?.product.name,
              }}
              onSelected={(item) => {
                // setProduct(item.data);
                setValue("percentage", item.data.percentage);
                setValue("cost", item.data.cost);

              }}
              errors={fieldErrors}
            />
          </div>

          <div className="hidden">
            <FormInput
              id="name"
              label="Name"
              type="text"
              defaultValue={defaultData?.name}
              errors={fieldErrors}
            />
          </div>

          <div className="">
            <FormInput
              id="cost"
              label="Cost"
              register={register}
              type="number"
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="percentage"
              label="Percentage"
              type="number"
              register={register}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="price"
              label="Unit Price"
              type="number"
              readOnly
              register={register}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="quantity"
              label="Quantity"
              type="number"
              register={register}
              defaultValue={defaultData?.quantity}
              errors={fieldErrors}
            />
          </div>

          <div className="">
            <FormInput
              id="withholdingTaxPercent"
              label="Tax Percent"
              type="number"
              readOnly
              register={register}
              defaultValue="7"
              errors={fieldErrors}
            />
          </div>

          <div className="">
            <FormInput
              id="withholdingTax"
              label="Tax Total"
              type="number"
              readOnly
              register={register}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="discount"
              label="Discount"
              type="number"
              register={register}
              // defaultValue={defaultData?.withholdingTax}
              errors={fieldErrors}
            />
          </div>
          <div className="">
            <FormInput
              id="totalPrice"
              label="Total Price"
              type="number"
              register={register}
              readOnly
              className="bg-green-50"
              // defaultValue={defaultData?.withholdingTax}
              errors={fieldErrors}
            />
          </div>

          <div className="col-span-4">
            <FormTextarea
              id="description"
              label="Description"
              errors={fieldErrors}
              defaultValue={defaultData?.description ?? ""}
              rows={6}
            />
          </div>

          <div className="col-start-4 col-span-1 flex justify-end">
            <FormSubmit>
              {defaultData?.id ? "Update" : "Create"}
            </FormSubmit>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
