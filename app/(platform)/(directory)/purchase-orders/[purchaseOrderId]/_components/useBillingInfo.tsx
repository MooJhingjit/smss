import { PurchaseOrderWithRelations } from "@/types";
import React, { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAction } from "@/hooks/use-action";
import { updatePurchaseOrder } from "@/actions/po/update";
import { toast } from "sonner";

type FormInput = {
    discount: number;
    extraCost: number;
    price: number;
    tax: number;
    vat: number;
    grandTotal: number;
    totalPrice: number;
};

type UseBillingInfoProps = {
    data: PurchaseOrderWithRelations;
};

export default function useBillingInfo({ data }: UseBillingInfoProps) {
    const isManual = data.quotationId
    const {
        register,
        reset,
        getValues,
        setValue,
        handleSubmit,
        control,
        formState: { isDirty, errors },
    } = useForm<FormInput>({
        mode: 'onChange',
        defaultValues: {
            discount: data.discount ?? 0,
            extraCost: data.extraCost ?? 0,
            price: data.price ?? 0,
            totalPrice: data.totalPrice ?? 0,
            tax: data.tax ?? 0,
            vat: data.vat ?? 0,
            grandTotal: data.grandTotal ?? 0,
        },
    });

    useEffect(() => {
        reset({
            discount: data.discount ?? 0,
            extraCost: data.extraCost ?? 0,
            price: data.price ?? 0,
            totalPrice: data.totalPrice ?? 0,
            tax: data.tax ?? 0,
            vat: data.vat ?? 0,
            grandTotal: data.grandTotal ?? 0,
        });
    }, [data, reset]);

    const onChange = useCallback(() => {
        const { discount, extraCost } = getValues();

        const discountNum = Number(discount);
        const extraCostNum = Number(extraCost);

        let tPrice = data.price ?? 0;

        if (isManual) {
            tPrice = Number(getValues('price'));
        }

        const totalPrice = tPrice - discountNum + extraCostNum;
        const vat = totalPrice * 0.07;
        const tax = totalPrice * 0.03;

        setValue('totalPrice', totalPrice);
        setValue('vat', vat);
        setValue('tax', tax);
    }, [getValues, setValue, data.price, isManual]);

    const discount = useWatch({ name: 'discount', control });
    const extraCost = useWatch({ name: 'extraCost', control });
    const price = useWatch({ name: 'price', control });
    const tax = useWatch({ name: 'tax', control });
    const vat = useWatch({ name: 'vat', control });
    const grandTotal = useWatch({ name: 'grandTotal', control });

    const handleUpdate = useAction(updatePurchaseOrder, {
        onSuccess: () => {
            toast.success('สำเร็จ');
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const onSubmit = (formData: FormInput) => {
        handleUpdate.execute({
            ...formData,
            totalPrice: Number(formData.totalPrice),
            price: Number(formData.price),
            discount: Number(formData.discount),
            extraCost: Number(formData.extraCost),
            tax: Number(formData.tax),
            id: data.id,
            formType: 'billing',
        });
    };

    const onReset = () => {
        reset();
    };

    useEffect(() => {
        if (isDirty) {
            onChange();
        }
    }, [price, discount, extraCost, isDirty, onChange]);

    useEffect(() => {
        if (!isDirty) return;

        const { tax, totalPrice } = getValues();
        const vat = Number(totalPrice) * 0.07;
        const grandTotal = Number(totalPrice) + vat - Number(tax);

        setValue('grandTotal', grandTotal);
        setValue('tax', tax);
    }, [isDirty, tax, getValues, setValue]);

    const priceBeforeTax = getValues('totalPrice');

    return {
        register,
        reset,
        handleSubmit,
        control,
        isDirty,
        discount,
        extraCost,
        price,
        tax,
        vat,
        grandTotal,
        onReset,
        onSubmit,
        priceBeforeTax,
        isManual
    };
}
