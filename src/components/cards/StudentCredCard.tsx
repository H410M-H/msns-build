"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { api } from "~/trpc/react"
import { Loader2, MapPin, BookUser, Phone, Mail, Calendar, RefreshCcw, Fingerprint } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { CSVUploadDialog } from "../forms/student/FileInput"
import Link from "next/link"
import Image from "next/image"

type StudentProps = {
  createdAt: Date
  studentId: string
  registrationNumber: string
  studentMobile: string
  fatherMobile: string
  admissionNumber: string
  studentName: string
  gender: "MALE" | "FEMALE" | "CUSTOM"
  dateOfBirth: string
  fatherName: string
  studentCNIC: string
  fatherCNIC: string
  currentAddress: string
  profilePic?: string | null
  isAssign: boolean
}

export default function StudentCredDetails() {
  const [students, setStudents] = useState<StudentProps[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { data, isLoading, isError, refetch } = api.student.getStudents.useQuery()
  

  useEffect(() => {
    if (data) {
      setStudents(data)
    }
  }, [data])

  const filteredStudents = students.filter((student) =>
    student.studentName.toLowerCase().includes(searchQuery.toLowerCase())
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

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isError) {
    return <div className="text-center p-4 text-red-500">Error loading students. Please try again later.</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow-md p-4 mb-6">
          <Input
            placeholder="Search students by name"
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
              <Link href="/admin/users/student/create">Create</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/users/student/view">View Table</Link>
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
            {filteredStudents.map((student) => (
              <motion.div key={student.studentId} variants={cardVariants} className="w-full">
                <Card className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        {student.profilePic ? (
                          <Image
                            src={student.profilePic}
                            alt={`${student.studentName}'s profile`}
                            width={60}
                            height={60}
                            className="rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-[60px] h-[60px] rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xl font-semibold text-blue-600">
                              {student.studentName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">{student.studentName}</h2>
                          <p className="text-sm text-gray-600">Admission #{student.admissionNumber}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              Reg: {student.registrationNumber}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {student.isAssign ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <BookUser className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{student.gender.toLowerCase()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(student.dateOfBirth).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Fingerprint className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{student.studentCNIC}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">
                            {student.currentAddress.split(",")[0]}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2 mb-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{student.fatherMobile}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {student.admissionNumber.toLowerCase().replace(" ", ".")}@msns.edu.pk
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4">
                        {[student.registrationNumber, student.gender, student.dateOfBirth].map((tag, index) => (
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