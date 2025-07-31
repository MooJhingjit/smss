"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { QuotationInstallment } from "@prisma/client";
import { updateInstallmentStatus } from "@/actions/quotation/update-installment-status";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckIcon, InfoIcon, PrinterIcon } from "lucide-react";
import ConfirmActionButton from "@/components/confirm-action";
import { useState } from "react";

const FormSchema = z.object({
  installments: z.array(
    z.object({
      id: z.number(),
      period: z.string(),
      amountWithVat: z.number().min(0, "จำนวนเงินต้องมากกว่า 0"),
      dueDate: z.string(),
      status: z.enum(["draft", "pending", "paid", "overdue"]),
      paidDate: z.date().nullable().optional(),
      billGroupId: z.number().nullable().optional(),
    })
  ),
});

type FormData = z.infer<typeof FormSchema>;

interface InstallmentTableProps {
  installments: (QuotationInstallment & { billGroupId?: number | null })[];
  quotationId: number;
}

export default function InstallmentTable({
  installments: initialInstallments,
  quotationId,
}: InstallmentTableProps) {
  const router = useRouter();
  const [generatingBillFor, setGeneratingBillFor] = useState<number | null>(
    null
  );

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      installments: initialInstallments.map((installment) => ({
        id: installment.id,
        period: installment.period,
        amountWithVat: installment.amountWithVat,
        dueDate: new Date(installment.dueDate).toISOString().split("T")[0],
        status: installment.status,
        paidDate: installment.paidDate,
        billGroupId: installment.billGroupId,
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "installments",
  });

  const handleUpdatePaymentStatusAction = useAction(updateInstallmentStatus, {
    onSuccess: () => {
      toast.success("อัพเดทสถานะการชำระสำเร็จ");
      form.reset(form.getValues()); // Reset dirty state
      router.refresh();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleGenerateBill = async (installmentId: number, dueDate: string) => {
    try {
      setGeneratingBillFor(installmentId);

      // Check if installment already has a bill group using existing data
      const installment = initialInstallments.find(
        (inst) => inst.id === installmentId
      );
      const hasBillGroup = installment?.billGroupId;

      let requestBody: any = {};

      if (!hasBillGroup) {
        // Send billGroupDate only for new bill groups
        requestBody.billGroupDate = dueDate;
      }
      
      // For existing bill groups, send empty body

      const response = await fetch(`/api/installments/${installmentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate bill");
      }

      // Handle PDF response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `installment-invoice-${installmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("สร้างและดาวน์โหลดใบวางบิลสำเร็จ");
      router.refresh();
    } catch (error) {
      console.error("Error generating bill:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการสร้างใบวางบิล"
      );
    } finally {
      setGeneratingBillFor(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  function onSubmit(data: FormData) {
    // Compare with initial data to find changes
    const installmentUpdates = data.installments
      .filter((current, index) => {
        const original = initialInstallments[index];
        return (
          original &&
          (original.status !== current.status ||
            original.amountWithVat !== current.amountWithVat ||
            new Date(original.dueDate).toISOString().split("T")[0] !==
              current.dueDate)
        );
      })
      .map((installment) => ({
        id: installment.id,
        status: installment.status,
        amountWithVat: installment.amountWithVat,
        dueDate: new Date(installment.dueDate),
        paidDate:
          installment.status === "paid"
            ? installment.paidDate || new Date()
            : null,
      }));

    if (installmentUpdates.length === 0) {
      toast.info("ไม่มีการเปลี่ยนแปลงสถานะการชำระ จำนวนเงิน หรือวันครบกำหนด");
      return;
    }

    handleUpdatePaymentStatusAction.execute({
      quotationId,
      installmentUpdates,
    });
  }

  // Calculate totals for warning
  const currentTotal = form
    .watch("installments")
    .reduce((sum, item) => sum + item.amountWithVat, 0);
  const originalTotal = initialInstallments.reduce(
    (sum, item) => sum + item.amountWithVat,
    0
  );
  const totalDifference = currentTotal - originalTotal;
  const hasTotalChange = Math.abs(totalDifference) > 0.01; // Allow for small rounding differences

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>แผนการผ่อนชำระ</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">
                      งวดที่
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      จำนวนเงิน (บาท)
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      วันครบกำหนด / พิมพ์ใบวางบิล
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">
                      สถานะการชำระ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow
                      key={field.id}
                      className={
                        form.watch(`installments.${index}.status`) === "paid"
                          ? "bg-green-50 "
                          : "border-b"
                      }
                    >
                      <TableCell className="font-medium text-gray-700 text-center">
                        <Badge variant="outline">{field.period}</Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <FormField
                          control={form.control}
                          name={`installments.${index}.amountWithVat`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  className="w-[150px] text-right"
                                  {...formField}
                                  onChange={(e) =>
                                    formField.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  disabled={!!field.billGroupId}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <FormField
                            control={form.control}
                            name={`installments.${index}.dueDate`}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="date"
                                    className="w-auto"
                                    {...formField}
                                    disabled={!!field.billGroupId}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <ConfirmActionButton
                            onConfirm={() => {
                              const installment = form.getValues(
                                `installments.${index}`
                              );
                              handleGenerateBill(
                                installment.id,
                                installment.dueDate
                              );
                            }}
                            warningMessage={
                              !field.billGroupId
                                ? [`สร้างใบวางบิลสำหรับงวดที่ ${field.period}`]
                                : [`พิมพ์ใบวางบิลงวดที่ ${field.period}`]
                            }
                            disabled={form.formState.isDirty}
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={
                                generatingBillFor === field.id ||
                                form.formState.isDirty
                              }
                            >
                              {generatingBillFor === field.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                              ) : (
                                <PrinterIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </ConfirmActionButton>
                        </div>
                      </TableCell>

                      <InstallmentStatusCell
                        field={field}
                        index={index}
                        form={form}
                        initialInstallment={initialInstallments[index]}
                      />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-end items-center space-x-2">
              {hasTotalChange && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="text-sm text-yellow-800">
                    <div className="font-medium">⚠️ ยอดรวมเปลี่ยนแปลง</div>
                    <div className="mt-1 flex items-center justify-between space-x-4">
                      <div>ยอดเดิม: {formatCurrency(originalTotal)}</div>
                      <div>ยอดใหม่: {formatCurrency(currentTotal)}</div>
                      <div
                        className={`font-medium ${
                          totalDifference > 0
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        ผลต่าง: {totalDifference > 0 ? "+" : ""}
                        {formatCurrency(totalDifference)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <Button
                type="submit"
                disabled={
                  !form.formState.isDirty ||
                  handleUpdatePaymentStatusAction.isLoading
                }
              >
                {handleUpdatePaymentStatusAction.isLoading
                  ? "กำลังอัพเดท..."
                  : "อัพเดท"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Reset to original values
                  form.reset({
                    installments: initialInstallments.map((installment) => ({
                      id: installment.id,
                      period: installment.period,
                      amountWithVat: installment.amountWithVat,
                      dueDate: new Date(installment.dueDate)
                        .toISOString()
                        .split("T")[0],
                      status: installment.status,
                      paidDate: installment.paidDate,
                      billGroupId: installment.billGroupId,
                    })),
                  });
                }}
                disabled={!form.formState.isDirty}
              >
                รีเซ็ต
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

const InstallmentStatusBadge = ({
  status,
  hasBillGroupId,
}: {
  status: string;
  hasBillGroupId: boolean;
}) => {
  if (status === "pending" && hasBillGroupId) {
    return (
      <Badge variant={"secondary"}>
        <InfoIcon className="h-4 w-4 text-orange-500" />
        <span className="ml-1">ออกบิลแล้ว รอการยืนยัน</span>
      </Badge>
    );
  }

  return null;
};

const InstallmentStatusCell = ({
  field,
  index,
  form,
  initialInstallment,
}: {
  field: any;
  index: number;
  form: any;
  initialInstallment: QuotationInstallment & { billGroupId?: number | null };
}) => {
  const paid = initialInstallment.status === "paid";
  const noInvoice = !field.billGroupId;
  if (paid) {
    return (
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1">
          <CheckIcon className="h-4 w-4 text-green-600" />
          <span className="text-green-600 ">ชำระแล้ว</span>
        </div>
        {/* <InstallmentStatusBadge status="paid" hasBillGroupId={!!field.billGroupId} /> */}
      </TableCell>
    );
  }

  if (noInvoice) {
    return <TableCell className="text-center"></TableCell>;
  }

  return (
    <TableCell className="text-center">
      <div className="flex items-center justify-center space-x-2">
        <FormField
          control={form.control}
          name={`installments.${index}.status`}
          render={({ field: formField }) => (
            <FormItem>
              <FormControl>
                <Checkbox
                  checked={formField.value === "paid"}
                  onCheckedChange={(checked) => {
                    formField.onChange(checked ? "paid" : "pending");
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <span
          className={`text-sm ${
            form.watch(`installments.${index}.status`) === "paid"
              ? "text-green-600 font-medium"
              : "text-gray-500"
          }`}
        >
          {form.watch(`installments.${index}.status`) === "paid"
            ? "ชำระแล้ว"
            : "ยืนยันการชำระ"}
        </span>

        <InstallmentStatusBadge
          status={form.watch(`installments.${index}.status`)}
          hasBillGroupId={!!field.billGroupId}
        />
      </div>
    </TableCell>
  );
};
