import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Transaction {
  'date/time': string;
  type: string;
  order_id: string;
  description: string;
  total: number;
  invoice_amount?: number;
  net_amount?: number;
}

interface TransactionChartProps {
  data: Transaction[];
}

const TransactionChart: React.FC<TransactionChartProps> = ({ data }) => {
  console.log('TransactionChart data:', data); // Debug log

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no transactions to display.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Process and aggregate data by date
  const aggregatedData = data.reduce((acc, curr) => {
    const date = new Date(curr['date/time']).toLocaleDateString();
    
    if (!curr.total && !curr.invoice_amount && !curr.net_amount) {
      console.log('Transaction with no amounts:', curr); // Debug log
      return acc;
    }

    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.total += Number(curr.total) || 0;
      existing.invoice_amount += Number(curr.invoice_amount) || 0;
      existing.net_amount += Number(curr.net_amount) || 0;
      existing.count += 1;
      existing[curr.type] = (existing[curr.type] || 0) + 1;
    } else {
      acc.push({
        date,
        total: Number(curr.total) || 0,
        invoice_amount: Number(curr.invoice_amount) || 0,
        net_amount: Number(curr.net_amount) || 0,
        count: 1,
        [curr.type]: 1,
      });
    }
    return acc;
  }, [] as Array<{
    date: string;
    total: number;
    invoice_amount: number;
    net_amount: number;
    count: number;
    [key: string]: number | string;
  }>).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log('Aggregated data:', aggregatedData); // Debug log

  // Calculate transaction types for pie chart
  const transactionTypes = data.reduce((acc, curr) => {
    if (curr.type) {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(transactionTypes).map(([name, value]) => ({
    name,
    value,
  }));

  console.log('Pie chart data:', pieChartData); // Debug log

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Transaction Amounts Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aggregatedData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorInvoice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                name="Total Amount"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
              <Area
                type="monotone"
                dataKey="invoice_amount"
                name="Invoice Amount"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorInvoice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Types</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value} transactions`,
                  'Count'
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Daily Transaction Volume</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregatedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number) => [`${value} transactions`, 'Count']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Bar
                dataKey="count"
                name="Number of Transactions"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionChart;
