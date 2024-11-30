import "./globals.css"
import { Toaster } from "sonner"

export const metadata = {
  title: 'Reimbursement Dashboard',
  description: 'Manage and track reimbursements',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
