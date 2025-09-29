import { TimetableView } from "~/components/test/time-table"


const mockTimetable = {
    Monday: [
        {
            timetableId: "1",
            dayOfWeek: "Monday",
            lectureNumber: 1,
            startTime: "08:00",
            endTime: "08:35",
            Subject: { subjectId: "1", subjectName: "Mathematics" },
            Employees: { employeeId: "1", employeeName: "John Smith", designation: "TEACHER" },
            Grades: { classId: "1", grade: "10", section: "A" },
            Sessions: { sessionId: "1", sessionName: "2024-25" },
        },
        {
            timetableId: "2",
            dayOfWeek: "Monday",
            lectureNumber: 3,
            startTime: "09:20",
            endTime: "09:55",
            Subject: { subjectId: "2", subjectName: "Physics" },
            Employees: { employeeId: "2", employeeName: "Sarah Johnson", designation: "TEACHER" },
            Grades: { classId: "1", grade: "10", section: "A" },
            Sessions: { sessionId: "1", sessionName: "2024-25" },
        },
    ],
    Tuesday: [
        {
            timetableId: "3",
            dayOfWeek: "Tuesday",
            lectureNumber: 2,
            startTime: "08:40",
            endTime: "09:15",
            Subject: { subjectId: "3", subjectName: "Chemistry" },
            Employees: { employeeId: "3", employeeName: "Mike Wilson", designation: "TEACHER" },
            Grades: { classId: "1", grade: "10", section: "A" },
            Sessions: { sessionId: "1", sessionName: "2024-25" },
        },
    ],
}

const mockDefaultTimeSlots = [
    { lectureNumber: 1, startTime: "08:00", endTime: "08:35" },
    { lectureNumber: 2, startTime: "08:40", endTime: "09:15" },
    { lectureNumber: 3, startTime: "09:20", endTime: "09:55" },
    { lectureNumber: 4, startTime: "10:00", endTime: "10:35" },
    { lectureNumber: 5, startTime: "10:40", endTime: "11:15" },
    { lectureNumber: 6, startTime: "11:20", endTime: "11:55" },
    { lectureNumber: 7, startTime: "12:00", endTime: "12:35" },
    { lectureNumber: 8, startTime: "13:00", endTime: "13:35" },
    { lectureNumber: 9, startTime: "13:40", endTime: "14:15" },
]

const mockClasses = [
    { classId: "1", grade: "10", section: "A" },
    { classId: "2", grade: "10", section: "B" },
    { classId: "3", grade: "11", section: "A" },
]

const mockSubjects = [
    { subjectId: "1", subjectName: "Mathematics" },
    { subjectId: "2", subjectName: "Physics" },
    { subjectId: "3", subjectName: "Chemistry" },
]

const mockTeachers = [
    { employeeId: "1", employeeName: "John Smith" },
    { employeeId: "2", employeeName: "Sarah Johnson" },
    { employeeId: "3", employeeName: "Mike Wilson" },
]

const mockSessions = [
    { sessionId: "1", sessionName: "2024-25" },
    { sessionId: "2", sessionName: "2023-24" },
]

export default async function TimeTablePage(props: PageProps<'/admin/sessions/timetable'>) {

    const paramProps = await props.params


    return <TimetableView/>
}