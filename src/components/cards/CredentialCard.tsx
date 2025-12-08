"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { api } from "~/trpc/react"
import { Loader2, MapPin, GraduationCap, Briefcase, Phone, Mail, Calendar, RefreshCcw } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { CSVUploadDialog } from "../forms/student/FileInput"
import Link from "next/link"
import Image from "next/image"

type Employee = {
  employeeId: string
  registrationNumber: string
  admissionNumber: string
  employeeName: string
  fatherName: string
  gender: "MALE" | "FEMALE" | "CUSTOM"
  dob: string
  doj: string
  designation: string
  education: string
  mobileNo: string
  profilePic?: string | null
  residentialAddress: string
}

export default function EmployeeCredDetails() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { data, isLoading, isError, refetch } = api.employee.getEmployees.useQuery()

  useEffect(() => {
    if (data) {
      setEmployees(data)
    }
  }, [data])

  const filteredEmployees = employees.filter((employee) =>
    employee.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // const cardVariants = {
  //   hidden: { y: 20, opacity: 0 },
  //   visible: {
  //     y: 0,
  //     opacity: 1,
  //     transition: {
  //       type: "spring",
  //       stiffness: 100,
  //     },
  //   },
  // }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isError) {
    return <div className="text-center p-4 text-red-500">Error loading employees. Please try again later.</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow-md p-4 mb-6">
          <Input
            placeholder="Search employees by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md w-full mb-4 sm:mb-0"
          />
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="shrink-0 flex items-center gap-1"
            >
              <RefreshCcw className="h-4 w-4" /> Refresh
            </Button>
            <CSVUploadDialog />
            <Button asChild>
              <Link href="/admin/users/faculty/create">Create</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/users/faculty/view">View Table</Link>
            </Button>
          </div>
        </div>

        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
          >
            {filteredEmployees.map((employee) => (
              <motion.div key={employee.employeeId} className="w-full">
                <Card className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        {employee.profilePic ? (
                          <Image
                            src={employee.profilePic}
                            alt={`${employee.employeeName}'s profile`}
                            width={60}
                            height={60}
                            className="rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-[60px] h-[60px] rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xl font-semibold text-blue-600">
                              {employee.employeeName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">{employee.employeeName}</h2>
                          <p className="text-sm text-gray-600">{employee.designation}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              ID: {employee.admissionNumber}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{employee.education}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate" title={employee.residentialAddress}>
                            {employee.residentialAddress.split(",")[0]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{employee.designation}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{new Date(employee.dob).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2 mb-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{employee.mobileNo}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {employee.admissionNumber.toLowerCase().replace(" ", ".")}@msns.edu.pk
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4">
                        {[employee.registrationNumber, employee.gender, employee.doj].map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
