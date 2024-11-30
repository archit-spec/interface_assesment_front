"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Cell, Pie, PieChart } from "recharts"

const barData = [
  {
    name: "Cost of Advertising",
    value: 3200,
  },
  {
    name: "FBA Inbound Pickup Service",
    value: 4100,
  },
  {
    name: "FBA Inventory Storage Fee",
    value: 5800,
  },
]

const pieData = [
  { name: "Customer Return", value: 23188.40, color: "#2D2D2D" },
  { name: "Customer Service Issue", value: 14888.69, color: "#7C3AED" },
  { name: "Damaged:Warehouse", value: 2191.21, color: "#9061F9" },
  { name: "Lost:Inbound", value: 28013.20, color: "#A78BFA" },
  { name: "Fee Correction", value: 1351.91, color: "#C4B5FD" },
]

export function ReimbursementCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border bg-background p-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Reimbursements by Dispute Type - last 30 days</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-background p-6">
        <div className="space-y-2">
          <h3 className="font-semibold">% Reimbursements by Dispute Type - this year</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="flex w-full justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

