import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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

export default function TransactionDashboard() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const size = 50; // Backend default is 50, max is 1000

  // Fetch transactions for the current page
  const fetchTransactions = async (currentPage: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/transactions?page=${currentPage}&size=${size}`);
      const responseData: PaginatedResponse = await response.json();
      setData(responseData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data || data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(transaction['date/time'])}</TableCell>
                  <TableCell>{transaction.order_id}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right">
                    <span className={transaction.total < 0 ? 'text-red-500' : 'text-green-500'}>
                      {formatCurrency(transaction.total)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {data && (
            `Showing ${(data.page - 1) * data.size + 1} to ${Math.min(data.page * data.size, data.total)} of ${data.total} transactions`
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={!data || page === 1 || loading}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {data && Array.from({ length: Math.min(data.pages, 5) }, (_, i) => {
              let pageNum;
              if (data.pages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= data.pages - 2) {
                pageNum = data.pages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </Button>
              );
            })}
            {data && data.pages > 5 && page < data.pages - 2 && (
              <>
                <span>...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(data.pages)}
                  disabled={loading}
                >
                  {data.pages}
                </Button>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!data || page === data.pages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
