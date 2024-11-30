import { Search } from 'lucide-react'

import { Input } from "@/components/ui/input"
import { MetricCard } from "./components/metric-card"
import { ReimbursementCharts } from "./components/reimbursement-charts"
import { SidebarNav } from "./components/sidebar-nav"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex-1 space-y-4 p-8">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-8" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Previous Month Order"
            value="3,458"
            href="/orders"
          />
          <MetricCard
            title="Order & Payment Received"
            value="153"
            href="/orders/received"
          />
          <MetricCard
            title="Payment Pending"
            value="229"
            href="/payments/pending"
          />
          <MetricCard
            title="Tolerance rate breached"
            value="3"
            href="/metrics/tolerance"
          />
          <MetricCard
            title="Return"
            value="277"
            href="/returns"
          />
          <MetricCard
            title="Negative Payout"
            value="666"
            href="/payouts/negative"
          />
        </div>
        <ReimbursementCharts />
      </div>
    </div>
  )
}

