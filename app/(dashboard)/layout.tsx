"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart,
  FileText,
  Home,
  Receipt,
  ScrollText,
  Settings,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Payment Reports", href: "/payment-reports", icon: FileText },
  { name: "MTR Reports", href: "/mtr-reports", icon: ScrollText },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Reconciliation", href: "/reconciliation", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="hidden w-64 bg-gray-900 md:flex md:flex-col">
        <div className="flex h-16 items-center justify-center">
          <span className="text-xl font-bold text-white">Financial Dashboard</span>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-white"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
