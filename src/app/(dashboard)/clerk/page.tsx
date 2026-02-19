"use client";

import { motion } from "framer-motion";
import { 
  DollarSign, 
  Receipt, 
  Users, 
  FileText,
  Search,
  Plus
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// Mock Data
const RECENT_TRANSACTIONS = [
  { id: "TRX-001", student: "Ali Khan", amount: 5000, type: "Tuition Fee", date: "Today, 10:30 AM", status: "Paid" },
  { id: "TRX-002", student: "Sara Ahmed", amount: 500, type: "Exam Fund", date: "Today, 11:15 AM", status: "Paid" },
  { id: "TRX-003", student: "Bilal Raza", amount: 5000, type: "Tuition Fee", date: "Yesterday", status: "Paid" },
];

const CLERK_STATS = [
  { title: "Daily Collection", value: "Rs. 45,500", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { title: "Pending Fees", value: "24", icon: Receipt, color: "text-amber-400", bg: "bg-amber-500/10" },
  { title: "New Admissions", value: "5", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
];

export default function ClerkDashboard() {
  const breadcrumbs = [{ href: "/clerk", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 space-y-6"
        >
           <WelcomeSection />
           
           {/* Quick Action: Fee Collection */}
           <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
             <CardContent className="p-6 flex items-center justify-between gap-4">
               <div className="space-y-1">
                 <h3 className="text-lg font-semibold text-emerald-100">Quick Fee Collection</h3>
                 <p className="text-sm text-emerald-400/70">Enter admission number to process fee payment</p>
               </div>
               <div className="flex gap-2">
                 <div className="relative">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-emerald-400/50" />
                   <Input 
                      placeholder="Admission #" 
                      className="pl-9 w-[200px] border-emerald-500/20 bg-black/20 text-emerald-100 placeholder:text-emerald-500/30 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                   />
                 </div>
                 <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                   Process
                 </Button>
               </div>
             </CardContent>
           </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4"
        >
          <div className="h-full w-full">
            <ProfileSection /> 
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {CLERK_STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-900/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="transactions" className="w-full">
           <TabsList className="bg-slate-950/50 border border-white/5 p-1 mb-6">
              <TabsTrigger value="transactions" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                  <Receipt className="h-4 w-4" /> Transactions
              </TabsTrigger>
              <TabsTrigger value="expenses" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                  <DollarSign className="h-4 w-4" /> Expenses
              </TabsTrigger>
           </TabsList>

           <TabsContent value="transactions">
             <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-900/40">
               <CardHeader>
                 <CardTitle>Recent Transactions</CardTitle>
                 <CardDescription>Latest fee collections and payments</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="rounded-md border border-white/5">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-white/5 text-slate-400">
                       <tr>
                         <th className="p-3 font-medium">Transaction ID</th>
                         <th className="p-3 font-medium">Student</th>
                         <th className="p-3 font-medium">Type</th>
                         <th className="p-3 font-medium">Amount</th>
                         <th className="p-3 font-medium">Date</th>
                         <th className="p-3 font-medium">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                       {RECENT_TRANSACTIONS.map((trx, i) => (
                         <tr key={i} className="hover:bg-white/5 transition-colors">
                           <td className="p-3 font-mono text-xs">{trx.id}</td>
                           <td className="p-3 font-medium text-white">{trx.student}</td>
                           <td className="p-3 text-slate-300">{trx.type}</td>
                           <td className="p-3 font-medium text-emerald-400">Rs. {trx.amount.toLocaleString()}</td>
                           <td className="p-3 text-slate-400">{trx.date}</td>
                           <td className="p-3">
                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                               {trx.status}
                             </span>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="expenses">
              <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-900/40">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Expense Management</CardTitle>
                    <CardDescription>Record and view school expenses</CardDescription>
                  </div>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <Plus className="h-4 w-4" /> Add Expense
                  </Button>
                </CardHeader>
                <CardContent>
                   <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                      <div className="p-4 rounded-full bg-slate-800 text-slate-400">
                        <FileText className="h-8 w-8" />
                      </div>
                      <p className="text-slate-300 font-medium">No expenses recorded today</p>
                      <p className="text-sm text-slate-500 max-w-sm">
                        Use the &quot;Add Expense&quot; button to record new expenditures for the school account.
                      </p>
                   </div>
                </CardContent>
              </Card>
           </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}