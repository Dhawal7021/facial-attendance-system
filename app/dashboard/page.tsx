"use client"

import { useEffect, useState } from 'react';
import Link from "next/link"
import { ClipboardList, UserPlus, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header";
import { supabase } from '@/lib/supabase-client';

type Stats = {
  totalStudents: number;
  totalClasses: number;
  todayAttendance: number;
  totalSubjects: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalClasses: 0,
    todayAttendance: 0,
    totalSubjects: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total students
        const { count: totalStudents } = await supabase
          .from('students')
          .select('*', { count: 'exact' });

        // Fetch total classes
        const { count: totalClasses } = await supabase
          .from('classes')
          .select('*', { count: 'exact' });

        // Fetch today's attendance
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        const { count: todayAttendance } = await supabase
          .from('attendance')
          .select('*', { count: 'exact' })
          .eq('date', today);

        // Fetch total subjects
        const { count: totalSubjects } = await supabase
          .from('subjects')
          .select('*', { count: 'exact' });

        // Update state with fetched data
        setStats({
          totalStudents: totalStudents || 0,
          totalClasses: totalClasses || 0,
          todayAttendance: todayAttendance || 0,
          totalSubjects: totalSubjects || 0,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Registered students
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
              <p className="text-xs text-muted-foreground">
                Active classes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAttendance}</div>
              <p className="text-xs text-muted-foreground">
                Students present today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubjects}</div>
              <p className="text-xs text-muted-foreground">
                Active subjects
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/take-attendance">
              <Card className="hover:bg-blue-500 hover:text-white transition-colors cursor-pointer bg-blue-500 text-white">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <ClipboardList className="h-12 w-12 mb-2" />
                  <span className="text-lg font-medium">Take Attendance</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/register-student">
              <Card className="hover:bg-green-500 hover:text-white transition-colors cursor-pointer bg-green-500 text-white">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <UserPlus className="h-12 w-12 mb-2" />
                  <span className="text-lg font-medium">Register New Student</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/view-attendance">
              <Card className="hover:bg-yellow-500 hover:text-white transition-colors cursor-pointer bg-yellow-500 text-white">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Users className="h-12 w-12 mb-2" />
                  <span className="text-lg font-medium">View Attendance</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

