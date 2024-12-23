'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ExcelJS from 'exceljs';

interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  date: string;
  status: string;
  students: { name: string };
  classes: { name: string };
  subjects: { name: string };
}

export default function ViewAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, students(name), classes(name), subjects(name)')
        .order('date', { ascending: false });

      if (error) throw error;

      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Records');

    // Add column headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Student Name', key: 'studentName', width: 30 },
      { header: 'Class', key: 'class', width: 20 },
      { header: 'Subject', key: 'subject', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // Add rows
    attendanceRecords.forEach(record => {
      worksheet.addRow({
        date: new Date(record.date).toLocaleDateString(),
        studentName: record.students.name,
        class: record.classes.name,
        subject: record.subjects.name,
        status: record.status,
      });
    });

    // Create a buffer and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_records.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">View Attendance</h1>
        <button onClick={downloadExcel} className="mb-4 bg-blue-500 text-white px-4 py-2 rounded">
          Download as Excel
        </button>
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.students.name}</TableCell>
                      <TableCell>{record.classes.name}</TableCell>
                      <TableCell>{record.subjects.name}</TableCell>
                      <TableCell>{record.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

