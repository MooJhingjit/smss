# Stats Components

This directory contains reusable statistics components for the SMSS application.

## Components

### SellerStats
Main stats component for sellers that shows their quotation statistics including:
- Annual quotation count
- Monthly breakdown of paid and unpaid quotations (with and without VAT)
- Interactive chart visualization
- Year selector for filtering data

### SellerMonthlyStatistics
Displays monthly statistics in both table and chart format. Shows:
- Monthly breakdown of paid/unpaid quotations
- With VAT and without VAT totals
- Interactive bar chart comparing paid vs unpaid amounts

### SellerTotalNumber
Shows total counts with year selector:
- Total quotations for the selected year
- Year selector dropdown for filtering

### YearSelector
Reusable year selector component that:
- Shows a dropdown with available years (current year - 5 to current year)
- Updates the URL with the selected year parameter
- Shows loading state during navigation

## Usage

### In Seller Page
```tsx
import { SellerStats } from "@/components/stats";

// In your component
<SellerStats sellerId={sellerId} year={year} />
```

### Data Filtering
The stats are automatically filtered by:
- `sellerId` - Shows only data for the specific seller
- `year` - Shows data for the selected year
- Excludes purchase orders (only shows quotation data)

## API Integration

Uses the shared `@/lib/stats.service.ts` which provides:
- `getMonthlyStats()` - Get monthly statistics with flexible filtering
- `getTotalCounts()` - Get total counts for quotations and purchase orders

## Features

- **Seller-specific filtering**: Only shows data for the authenticated seller
- **Year selection**: Interactive year selector with URL state
- **Quotations only**: Excludes purchase order data for seller view
- **Responsive design**: Works on all screen sizes
- **Reusable components**: Can be used in different parts of the application
- **Shared logic**: Uses the same service as the admin stats page

## Implementation Notes

- The original stats logic has been moved to `@/lib/stats.service.ts` for reusability
- Admin stats page now also uses the shared service
- Components are designed to be composable and reusable
- Year selection is handled via URL parameters for deep linking support
