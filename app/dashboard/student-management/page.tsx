"use client"

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Class {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  class_id: string;
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');

  const fetchClasses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Student Management</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Class</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Students</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {students.map((student) => (
                <li key={student.id}>{student.name}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

