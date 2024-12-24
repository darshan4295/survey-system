import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Toaster } from "@/components/ui/toaster"  // Add this import
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster /> {/* Add this line */}
        </body>
      </html>
    </ClerkProvider>
  )
}