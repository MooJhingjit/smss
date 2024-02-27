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
import { Product, QuotationType } from "@prisma/client";
import { useForm } from "react-hook-form";
import { FormTextarea } from "../form/form-textarea";
import { Input } from "@/components/ui/input";
import { MinusCircle, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { quotationTypeMapping } from "@/app/config";
import { classNames } from "@/lib/utils";

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
  subItems: string;
};

export const QuotationListModal = () => {
  // const [productSelected, setProduct] = useState<Product | null>(null);
  const modal = useQuotationListModal();
  const defaultData = modal.data;
  const p = defaultData?.percentage?.toString() ?? "";
  const refs = modal.refs;
  const isProduct = refs?.quotationRef?.type === QuotationType.product;
  const isService = refs?.quotationRef?.type === QuotationType.service;
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
      unitPrice: defaultData?.unitPrice ? defaultData.unitPrice.toString() : "",
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
      subItems: defaultData?.subItems
        ? defaultData.subItems
        : "[]",
    };
    reset(formData);
  }, [defaultData, reset]);

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
      toast.success("สำเร็จ");
      modal.onClose();
    },
    onError: (error) => {
      toast.error(error);
      console.log("error", error);
    },
  });

  const onProductSubmit = async (formData: FormData) => {
    const productId = formData.get("productId") as string;
    const price = formData.get("price") as string;
    const cost = formData.get("cost") as string;
    const percentage = formData.get("percentage") as string;
    const quantity = formData.get("quantity") as string;
    const withholdingTax = formData.get("withholdingTax") as string;
    const withholdingTaxPercent = formData.get(
      "withholdingTaxPercent"
    ) as string;

    const product = productId
      ? parseInt(productId)
      : refs?.productRef?.id ?? null;

    const total = formData.get("totalPrice") as string;
    const discount = formData.get("discount") as string;
    const description = formData.get("description") as string;


    if (!refs?.quotationRef?.id || !product) {
      toast.error("จำเป็นต้องกรอกข้อมูลให้ครบ");
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
      discount: discount ? parseFloat(discount) : 0,
      description,
      subItems: getValues("subItems"),
      quotationType: refs.quotationRef.type,
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

  const onServiceSubmit = async (formData: FormData) => {

    const unitPrice = formData.get("unitPrice") as string;
    const quantity = formData.get("quantity") as string;
    const total = formData.get("totalPrice") as string;
    const name = formData.get("name") as string;
    const discount = formData.get("discount") as string;

    if (!refs?.quotationRef?.id) {
      toast.error("จำเป็นต้องกรอกข้อมูลให้ครบ");
      return;
    }

    const payload = {
      quotationId: refs.quotationRef.id,
      name,
      unitPrice: parseFloat(unitPrice),
      quantity: parseFloat(quantity),
      totalPrice: parseFloat(total),
      price: parseFloat(unitPrice),
      cost: parseFloat(unitPrice),
      discount: discount ? parseFloat(discount) : 0,
      subItems: getValues("subItems"),
      quotationType: refs.quotationRef.type,
      productId: 0 // service doesn't have product id
    };

    if (defaultData?.id) {
      handleUpdate.execute({
        id: defaultData.id,
        ...payload,
      });
      return;
    }

    handleCreate.execute({ ...payload, quotationType: refs.quotationRef.type, });
  }

  const fieldErrors = (defaultData?.id ? handleUpdate : handleCreate)
    .fieldErrors;

  // summary of product

  useEffect(() => {
    if (isService) return

    const cost = watch("cost");
    const percentage = watch("percentage");
    if (cost && percentage) {
      const unitPrice =
        parseFloat(cost) + (parseFloat(cost) * parseFloat(percentage)) / 100;
      // multiply by quantity
      const quantity = watch("quantity");
      // console.log("quantity", quantity)
      let totalPrice = unitPrice;
      if (quantity) {
        totalPrice = unitPrice * parseFloat(quantity);
      }
      setValue("price", unitPrice.toString());

      // calculate tax 7%
      const tax = (totalPrice * 7) / 100;
      setValue("withholdingTax", tax.toString());

      // set total price + tax - discount
      const discount = watch("discount");
      let total = totalPrice + tax;
      if (discount) {
        total = total - parseFloat(discount);
      }
      setValue("totalPrice", total.toString());
    }
  }, [
    watch("cost"),
    watch("percentage"),
    watch("quantity"),
    watch("discount"),
  ]);

  // summary of service
  useEffect(() => {
    if (isProduct) return

    // summary for service

    const unitPrice = watch('unitPrice');
    const quantity = watch('quantity');
    const discount = watch('discount');
    let totalPrice = parseFloat(unitPrice);
    if (quantity) {
      totalPrice = parseFloat(unitPrice) * parseFloat(quantity);
    }
    if (discount) {
      totalPrice = totalPrice - parseFloat(discount);
    }
    setValue("totalPrice", totalPrice.toString());
  }, [
    watch('unitPrice'),
    watch('quantity'),
    watch('discount')
  ])

  const subItems = getValues("subItems");

  if (!modal.isOpen) return

  const renderProductForm = () => {
    return (
      <form
        key={refs?.timestamps}
        action={onProductSubmit} className="grid grid-cols-4 gap-3 mt-3">
        <div className="col-span-4">
          <FormSearchAsync
            id="productId"
            label="ค้าหาชื่อสินค้า/บริการ"
            required
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
            label="ชื่อสินค้า/บริการ"
            type="text"
            defaultValue={defaultData?.name}
            errors={fieldErrors}
          />
        </div>

        <div className="">
          <FormInput
            key={refs?.timestamps}
            id="cost"
            label="ต้นทุน"
            required
            register={register}
            type="number"
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            id="percentage"
            label="กำไร (%)"
            required
            type="number"
            register={register}
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            id="price"
            label="ราคาขายต่อหน่วย"
            required
            type="number"
            readOnly
            register={register}
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            id="quantity"
            label="จำนวน"
            required
            type="number"
            register={register}
            defaultValue={defaultData?.quantity}
            errors={fieldErrors}
          />
        </div>

        <div className="">
          <FormInput
            id="withholdingTaxPercent"
            label="ภาษี (%)"
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
            label="ภาษีทั้งหมด"
            type="number"
            readOnly
            register={register}
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            id="discount"
            label="ส่วนลด"
            type="number"
            register={register}
            // defaultValue={defaultData?.withholdingTax}
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            id="totalPrice"
            label="ยอดรวม"
            required
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
            label="รายละเอียด"
            errors={fieldErrors}
            defaultValue={defaultData?.description ?? ""}
            rows={6}
          />
        </div>

        <SubItems setValue={setValue} defaultSubItems={subItems} />

        <div className="col-start-4 col-span-1 flex justify-end space-x-2">
          {/* <Button variant="destructive" size="sm">
              ลบ
            </Button> */}
          <FormSubmit>{defaultData?.id ? "อัพเดท" : "สร้างใหม่"}</FormSubmit>
        </div>
      </form>
    )
  }

  const renderServiceForm = () => {
    return (
      <form
        key={refs?.timestamps}
        action={onServiceSubmit} className="grid grid-cols-4 gap-3 mt-3">


        <div className="col-span-4">
          <FormTextarea
            id="name"
            label="ชื่อสินค้า/บริการ"
            defaultValue={defaultData?.name}
            errors={fieldErrors}
            rows={12}

          />
        </div>

        <div className="">
          <FormInput
            id="unitPrice"
            label="ราคาขายต่อหน่วย"
            required
            type="number"
            register={register}
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            id="quantity"
            label="จำนวน"
            required
            type="number"
            register={register}
            defaultValue={defaultData?.quantity}
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            id="discount"
            label="ส่วนลด"
            type="number"
            register={register}
            // defaultValue={defaultData?.withholdingTax}
            errors={fieldErrors}
          />
        </div>
        <div className="">
          <FormInput
            id="totalPrice"
            label="ยอดรวม"
            required
            type="number"
            register={register}
            readOnly
            // defaultValue={defaultData?.withholdingTax}
            errors={fieldErrors}
          />
        </div>

        {/* <div className="col-span-4">
          <FormTextarea
            id="description"
            label="รายละเอียด"
            errors={fieldErrors}
            defaultValue={defaultData?.description ?? ""}
            rows={6}
          />
        </div> */}

        {/* <SubItems setValue={setValue} defaultSubItems={subItems} /> */}

        <div className="col-span-4 flex justify-end space-x-2 items-center">
          {/* <Button variant="destructive" size="sm">
              ลบ
            </Button> */}
          <FormSubmit>{defaultData?.id ? "อัพเดท" : "สร้างใหม่"}</FormSubmit>
        </div>
      </form>
    )
  }


  return (
    <Dialog open={modal.isOpen} onOpenChange={modal.onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <span>รายละเอียดสินค้าในใบ QT</span>
            {
              refs?.quotationRef.type && (
                <span className={
                  classNames(
                    "ml-2 inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ",
                    isProduct ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"
                  )
                }>
                  {
                    quotationTypeMapping[refs?.quotationRef.type]
                  }
                </span>
              )
            }
          </DialogTitle>
        </DialogHeader>
        {
          isProduct ?
            renderProductForm()
            :
            renderServiceForm()
        }
      </DialogContent>
    </Dialog>
  );
};

const SubItems = ({ setValue, defaultSubItems }: { setValue: any, defaultSubItems: string }) => {
  const [subItems, setSubItems] = useState<
    {
      label: string;
      quantity: string;
    }[] | null
  >(null);

  useEffect(() => {
    if (!defaultSubItems) return;
    setSubItems(JSON.parse(defaultSubItems));
  }, [defaultSubItems]);

  console.log('subItems2', subItems)

  const handleAdd = () => {
    setSubItems([...subItems || [], { label: "", quantity: "" }]);
  };

  const handleRemove = (index: number) => {
    const items = subItems?.filter((_, i) => i !== index);
    setSubItems(items ?? []);
    setValue("subItems", JSON.stringify(items));

  };

  const handleSubItemChange = (index: number, key: string, value: string) => {
    const items = subItems?.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [key]: value,
        };
      }
      return item;
    });
    setSubItems(items ?? []);
    setValue("subItems", JSON.stringify(items));
  };


  return (
    <div className="col-span-4">
      <div className="flex space-x-2 items-center">
        <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs capitalize">
          รายละเอียดย่อย
        </h3>
        <PlusCircle onClick={handleAdd} className=" w-4  cursor-pointer">
          Add
        </PlusCircle>
      </div>
      <div className="mt-2">
        {subItems?.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Input
              id="label"
              placeholder="รายการ"
              value={item.label}
              onChange={(e) =>
                handleSubItemChange(index, "label", e.target.value)
              }
            />
            <Input
              id="quantity"
              placeholder="จำนวน"
              value={item.quantity}
              onChange={(e) =>
                handleSubItemChange(index, "quantity", e.target.value)
              }
              className="w-20"
            />

            {/* <input type="text" value={item.label} placeholder="Sub Item" className="input input-bordered" /> */}
            <MinusCircle
              onClick={() => handleRemove(index)}
              className="text-red-300 w-5  hover:text-red-400 cursor-pointer"
            >
              ลบ
            </MinusCircle>
          </div>
        ))}
      </div>
    </div>
  );
};




