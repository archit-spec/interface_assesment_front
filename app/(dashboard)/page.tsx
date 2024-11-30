"use client"

import { useState, useEffect } from "react"
import { FileUpload } from "@/components/file-upload"
import SummaryCards from "@/components/summary-cards"
import TransactionChart from '@/components/TransactionChart'
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

interface Transaction {
  'date/time': string;
  type: string;
  order_id: string;
  description: string;
  total: number;
  invoice_amount?: number;
  net_amount?: number;
}

interface PaginatedResponse {
  items: Transaction[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface SummaryData {
  total_records: number;
  total_amount: number;
  transaction_types: {
    [key: string]: {
      count: number;
      total_amount: number;
    };
  };
  start_date?: string;
  end_date?: string;
}

interface JobResponse {
  job_id: string;
  status: string;
  message: string;
}

export default function DashboardPage() {
  const [processedData, setProcessedData] = useState<PaginatedResponse | null>(null);
  const [unprocessedData, setUnprocessedData] = useState<PaginatedResponse | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: boolean}>({
    payment: false,
    mtr: false
  });
  const [jobStatus, setJobStatus] = useState<{[key: string]: string}>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch processed data
      const processedResponse = await fetch('http://localhost:8000/processed?page=1&size=300');
      const processedResult = await processedResponse.json();
      
      // Get transaction details for each processed item
      const allTransactions = [];
      for (const item of processedResult.items) {
        if (item.summary?.transaction_types) {
          const { Order = { count: 0 }, Return = { count: 0 } } = item.summary.transaction_types;
          allTransactions.push({
            'date/time': item.processing_timestamp,
            type: 'Order',
            total: Order.total_amount || 0,
            count: Order.count || 0,
          });
          if (Return.count > 0) {
            allTransactions.push({
              'date/time': item.processing_timestamp,
              type: 'Return',
              total: Return.total_amount || 0,
              count: Return.count || 0,
            });
          }
        }
      }
      setProcessedData({ 
        items: allTransactions,
        total: processedResult.total,
        page: processedResult.page,
        size: processedResult.size,
        pages: processedResult.pages
      });

      // Fetch unprocessed data
      const unprocessedResponse = await fetch('http://localhost:8000/unprocessed?page=1&size=100');
      const unprocessedResult = await unprocessedResponse.json();
      setUnprocessedData(unprocessedResult);

      // Fetch summary data with date range
      const summaryUrl = new URL('http://localhost:8000/api/summary');
      if (dateRange?.from) {
        summaryUrl.searchParams.append('start_date', format(dateRange.from, 'yyyy-MM-dd'));
      }
      if (dateRange?.to) {
        summaryUrl.searchParams.append('end_date', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const summaryResponse = await fetch(summaryUrl.toString());
      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch summary data');
      }
      const summaryResult = await summaryResponse.json();
      setSummaryData(summaryResult);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [dateRange]); // Refetch when date range changes

  const checkJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/status/${jobId}`);
      const result = await response.json();
      return result.status;
    } catch (error) {
      console.error('Error checking job status:', error);
      return 'failed';
    }
  };

  const handleProcessFile = async (file: File, type: 'payment' | 'mtr') => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const endpoint = type === 'mtr' 
        ? 'http://localhost:8000/api/upload/mtr'
        : 'http://localhost:8000/upload/payment';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      const result: JobResponse = await response.json();
      
      if (response.ok) {
        setJobStatus(prev => ({ ...prev, [type]: 'waiting' }));
        toast.success(result.message || `${type} report uploaded successfully`);

        // Start polling for job status
        const pollStatus = async () => {
          const status = await checkJobStatus(result.job_id);
          if (status === 'completed') {
            setJobStatus(prev => ({ ...prev, [type]: 'completed' }));
            setUploadedFiles(prev => ({ ...prev, [type]: true }));
            toast.success(`${type} report processing completed`);
            fetchAllData();
          } else if (status === 'failed') {
            setJobStatus(prev => ({ ...prev, [type]: 'failed' }));
            setError(`Failed to process ${type} report`);
            setUploadedFiles(prev => ({ ...prev, [type]: false }));
          } else if (status === 'waiting') {
            setTimeout(pollStatus, 2000); // Poll every 2 seconds
          }
        };

        pollStatus();
      } else {
        throw new Error(result.message || 'Failed to process file');
      }
    } catch (error) {
      console.error('Processing failed:', error);
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(`Failed to process ${type} report: ${errorMessage}`);
      toast.error(`Failed to process ${type} report`);
      setUploadedFiles(prev => ({ ...prev, [type]: false }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Payment Reports Dashboard</h2>
        <Link href="/transactions">
          <Button>View All Transactions</Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Date Range Picker */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Date Range</h2>
        <div className="flex items-center gap-4">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          <Button 
            variant="outline" 
            onClick={() => {
              setDateRange({
                from: addDays(new Date(), -30),
                to: new Date(),
              });
            }}
          >
            Reset to Last 30 Days
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && !error && summaryData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.total_records.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(summaryData.total_amount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.transaction_types?.Order?.count.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(summaryData.transaction_types?.Order?.total_amount || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.transaction_types?.Return?.count.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(summaryData.transaction_types?.Return?.total_amount || 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      {processedData?.items && processedData.items.length > 0 ? (
        <div className="mb-8">
          <TransactionChart data={processedData.items} />
        </div>
      ) : loading ? (
        <div className="mb-8 h-[400px] bg-gray-100 animate-pulse rounded-lg"></div>
      ) : (
        <div className="mb-8 text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No transaction data available</p>
        </div>
      )}

      {/* File Upload Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-4">Payment Report</h2>
          <FileUpload
            onFileSelect={async () => {
              // Handle initial file selection
            }}
            onProcess={async (file) => {
              await handleProcessFile(file, 'payment');
            }}
            label="Upload payment report (CSV)"
            disabled={uploadedFiles.payment || jobStatus.payment === 'waiting'}
            accept=".csv"
          />
          {jobStatus.payment === 'waiting' && (
            <p className="mt-2 text-sm text-yellow-600">Processing payment report...</p>
          )}
          {uploadedFiles.payment && (
            <p className="mt-2 text-sm text-green-600">✓ Payment report processed</p>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4">Merchant Tax Report</h2>
          <FileUpload
            onFileSelect={async () => {
              // Handle initial file selection
            }}
            onProcess={async (file) => {
              await handleProcessFile(file, 'mtr');
            }}
            label="Upload merchant tax report (CSV)"
            disabled={uploadedFiles.mtr || jobStatus.mtr === 'waiting'}
            accept=".csv,.xlsx"
          />
          {jobStatus.mtr === 'waiting' && (
            <p className="mt-2 text-sm text-yellow-600">Processing MTR report...</p>
          )}
          {uploadedFiles.mtr && (
            <p className="mt-2 text-sm text-green-600">✓ MTR report processed</p>
          )}
        </div>
      </div>
    </div>
  )
}
