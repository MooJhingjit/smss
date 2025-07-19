"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { QuotationInstallment } from "@prisma/client";
import { updateInstallmentStatus } from "@/actions/quotation/update-installment-status";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PrinterIcon } from "lucide-react";

const FormSchema = z.object({
  installments: z.array(z.object({
    id: z.number(),
    period: z.string(),
    amountWithVat: z.number().min(0, "จำนวนเงินต้องมากกว่า 0"),
    dueDate: z.string(),
    status: z.enum(["pending", "paid", "overdue"]),
    paidDate: z.date().nullable().optional(),
  })),
});

type FormData = z.infer<typeof FormSchema>;

interface InstallmentTableProps {
  installments: QuotationInstallment[];
  quotationId: number;
}

export default function InstallmentTable({ installments: initialInstallments, quotationId }: InstallmentTableProps) {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      installments: initialInstallments.map(installment => ({
        id: installment.id,
        period: installment.period,
        amountWithVat: installment.amountWithVat,
        dueDate: new Date(installment.dueDate).toISOString().split('T')[0],
        status: installment.status,
        paidDate: installment.paidDate,
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
        return original && (
          original.status !== current.status || 
          original.amountWithVat !== current.amountWithVat ||
          new Date(original.dueDate).toISOString().split('T')[0] !== current.dueDate
        );
      })
      .map((installment) => ({
        id: installment.id,
        status: installment.status,
        amountWithVat: installment.amountWithVat,
        dueDate: new Date(installment.dueDate),
        paidDate: installment.status === "paid" ? (installment.paidDate || new Date()) : null,
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
                      className={form.watch(`installments.${index}.status`) === "paid" ? "bg-green-50" : "border-b"}
                    >
                      <TableCell className="font-medium text-gray-700 text-center">
                        <Badge variant="outline" >{field.period}</Badge>
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
                                  onChange={(e) => formField.onChange(parseFloat(e.target.value) || 0)}
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
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              console.log('Print installment:', field.id);
                            }}
                          >
                            <PrinterIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      
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
                            {form.watch(`installments.${index}.status`) === "paid" ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button 
                type="submit" 
                disabled={!form.formState.isDirty || handleUpdatePaymentStatusAction.isLoading}
              >
                {handleUpdatePaymentStatusAction.isLoading ? "กำลังอัพเดท..." : "อัพเดทการชำระ"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
