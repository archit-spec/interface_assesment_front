"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

interface Transaction {
  'date/time': string;
  type: string;
  order_id: string;
  description: string;
  total: number;
}

interface PaginatedResponse {
  items: Transaction[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export default function TransactionsPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Define columns for the data table
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date/time",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date/time"));
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    },
    {
      accessorKey: "order_id",
      header: "Order ID",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "total",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue("total") as number;
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount);
        return <span className={amount < 0 ? 'text-red-500' : 'text-green-500'}>{formatted}</span>;
      }
    },
  ];

  // Fetch transactions for the current page
  const fetchTransactions = async (currentPage: number, size: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/transactions?page=${currentPage}&size=${size}`);
      const responseData: PaginatedResponse = await response.json();
      setData(responseData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page, pageSize);
  }, [page, pageSize]);

  return (
    <div className="space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Transaction Table */}
      {data && (
        <div className="rounded-md border">
          <DataTable
            columns={columns}
            data={data.items}
            pageCount={data.pages}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
          />
        </div>
      )}
    </div>
  )
}
