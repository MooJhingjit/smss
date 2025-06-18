import { db } from "@/lib/db";

export interface MonthlyStatsData {
  paid: {
    withVAT: number;
    withoutVAT: number;
  };
  unpaid: {
    withVAT: number;
    withoutVAT: number;
  };
  purchaseOrder?: number;
}

export interface StatsFilters {
  year?: number;
  sellerId?: number;
  includePurchaseOrders?: boolean;
}

export const getMonthlyStats = async (filters: StatsFilters = {}): Promise<MonthlyStatsData[]> => {
  const { 
    year = new Date().getUTCFullYear(), 
    sellerId,
    includePurchaseOrders = true 
  } = filters;

  const monthlyData = await Promise.all(
    Array.from({ length: 12 }).map(async (_, month) => {
      const startDate = new Date(Date.UTC(year, month, 1));
      const endDate = new Date(Date.UTC(year, month + 1, 1)); // First day of next month (exclusive)

      // Base where condition for quotations
      const quotationWhere = {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        ...(sellerId && { sellerId }),
      };

      // Paid transactions
      const paidWithVAT = await db.quotation.aggregate({
        _sum: {
          grandTotal: true,
        },
        where: {
          ...quotationWhere,
          status: "paid",
        },
      });

      const paidWithoutVAT = await db.quotation.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          ...quotationWhere,
          status: "paid",
        },
      });

      // Unpaid transactions
      const unpaidWithVAT = await db.quotation.aggregate({
        _sum: {
          grandTotal: true,
        },
        where: {
          ...quotationWhere,
          status: {
            not: "paid",
          },
        },
      });

      const unpaidWithoutVAT = await db.quotation.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          ...quotationWhere,
          status: {
            not: "paid",
          },
        },
      });

      // Purchase Order data (only if includePurchaseOrders is true)
      let purchaseOrder = 0;
      if (includePurchaseOrders) {
        const purchaseOrderWhere: any = {
          quotation: {
            isNot: null,
          },
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        };

        if (sellerId) {
          purchaseOrderWhere.quotation.sellerId = sellerId;
        }

        const purchaseOrderResult = await db.purchaseOrder.aggregate({
          _sum: {
            totalPrice: true,
          },
          where: purchaseOrderWhere,
        });
        purchaseOrder = Number(purchaseOrderResult._sum?.totalPrice) || 0;
      }

      const result: MonthlyStatsData = {
        paid: {
          withVAT: Number(paidWithVAT._sum.grandTotal) || 0,
          withoutVAT: Number(paidWithoutVAT._sum.totalPrice) || 0,
        },
        unpaid: {
          withVAT: Number(unpaidWithVAT._sum.grandTotal) || 0,
          withoutVAT: Number(unpaidWithoutVAT._sum.totalPrice) || 0,
        },
      };

      if (includePurchaseOrders) {
        result.purchaseOrder = purchaseOrder;
      }

      return result;
    })
  );

  return monthlyData;
};

export const getTotalCounts = async (filters: StatsFilters = {}) => {
  const { 
    year = new Date().getUTCFullYear(), 
    sellerId,
    includePurchaseOrders = true 
  } = filters;

  const startDate = new Date(Date.UTC(year, 0, 1)); // January 1st of the year
  const endDate = new Date(Date.UTC(year + 1, 0, 1)); // January 1st of next year

  const quotationWhere = {
    createdAt: {
      gte: startDate,
      lt: endDate,
    },
    ...(sellerId && { sellerId }),
  };

  const quotationCount = await db.quotation.count({
    where: quotationWhere,
  });

  let purchaseOrderCount = 0;
  if (includePurchaseOrders) {
    const purchaseOrderWhere: any = {
      quotation: {
        isNot: null,
      },
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    };

    if (sellerId) {
      purchaseOrderWhere.quotation.sellerId = sellerId;
    }

    purchaseOrderCount = await db.purchaseOrder.count({
      where: purchaseOrderWhere,
    });
  }

  return {
    quotationCount,
    purchaseOrderCount,
  };
};
