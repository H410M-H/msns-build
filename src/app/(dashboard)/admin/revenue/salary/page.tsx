"use client"

import { Separator } from "~/components/ui/separator"
import { Input } from "~/components/ui/input"
import { useState } from 'react'
import { SalaryAssignmentForm } from "~/components/forms/employee/SalaryAllotment"
import { SalaryTable } from "~/components/tables/SalaryTable"
import { ExpenseCreationDialog } from "~/components/blocks/expense/ExpenseCreation"
import { Button } from "~/components/ui/button"
import { Search, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "~/lib/utils"

export default function SalaryPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)


  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Add actual refresh logic here
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50/50 to-teal-50/50 sm:px-6 sm:py-0">
      {/* Animated background elements */}
      <motion.div 
        className="fixed -top-40 -right-32 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="fixed -bottom-40 -left-32 h-96 w-96 rounded-full bg-green-200/30 blur-3xl"
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      
      
      <div className="container mx-auto pt-[5rem]">
        <div className="w-full mx-auto space-y-6">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-800 to-teal-600 tracking-tight drop-shadow-sm">
              Employee Compensation Management
            </h1>
            <p className="text-md text-green-700/90 font-medium max-w-2xl mx-auto">
              Streamline salary allocations with precision and clarity through our comprehensive compensation management system
            </p>
          </motion.div>

          <Separator className="bg-gradient-to-r from-green-200/80 to-teal-200/80 h-[2px] shadow-sm" />

          {/* Main Content Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-50/20 p-6 space-y-6"
          >
            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-3 top-3 h-5 w-5 text-green-600/80 transition-colors group-focus-within:text-green-700" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-green-900 placeholder-green-600/60 focus-visible:ring-2 focus-visible:ring-green-300/50 border-green-200/50 bg-green-50/50 hover:bg-green-50/70 transition-colors"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <SalaryAssignmentForm />
<ExpenseCreationDialog />
                
                <Button
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50/50 hover:text-green-800 group"
                  onClick={handleRefresh}
                >
                  <RefreshCw className={cn(
                    "h-4 w-4 mr-2 transition-transform",
                    isRefreshing && "animate-spin"
                  )} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <SalaryTable 
              page={page}
              pageSize={pageSize}
              setPage={setPage}
              setPageSize={setPageSize}
              searchTerm={searchTerm}
            />
          </motion.div>

          {/* Footer Badges */}
          <motion.div 
            className="pb-6 text-center text-sm text-green-700/80 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex gap-3 flex-wrap justify-center">
              {[
                { icon: "🔒", text: "Secured Transactions" },
                { icon: "📊", text: "Real-time Analytics" },
                { icon: "📑", text: "Audit Compliance" }
              ].map((badge, index) => (
                <motion.span
                  key={index}
                  className="bg-green-100/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-green-200/30 hover:bg-green-100/70 transition-colors cursor-default"
                  whileHover={{ scale: 1.05 }}
                >
                  {badge.icon} {badge.text}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}