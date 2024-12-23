export interface DashboardStats {
  totalStudents: number
  totalClasses: number
  todayAttendance: number
  totalSubjects: number
}

export interface Student {
  id: string
  name: string
  class: string
  rollNumber: string
  photoUrl: string
}

export interface Class {
  id: string
  name: string
}

export interface Subject {
  id: string
  name: string
}

