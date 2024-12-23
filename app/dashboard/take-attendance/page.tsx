'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FaceRecognition from '@/components/FaceRecognition';
import { supabase } from '@/lib/supabase-client';
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

export default function TakeAttendance() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [captureStatus, setCaptureStatus] = useState<string | null>(null);

  // Fetch classes from the database
  const fetchClasses = async () => {
    const { data, error } = await supabase.from('classes').select('id, name').order('name');
    if (error) {
      console.error('Error fetching classes:', error.message);
      return;
    }
    setClasses(data || []);
  };

  // Fetch subjects based on selected class
  const fetchSubjects = async (classId: string) => {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name')
      .eq('class_id', classId)
      .order('name');

    if (error) {
      console.error('Error fetching subjects:', error.message);
      return;
    }
    setSubjects(data || []);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects(selectedClass);
    }
  }, [selectedClass]);

  const handleCapture = (embeddings: number[]) => {
    if (embeddings.length > 0) {
      setFaceEmbedding(embeddings);
      setCaptureStatus('Face captured successfully!');
    } else {
      setCaptureStatus('Face not detected. Please try again.');
    }
  };

  const handleTakeAttendance = async () => {
    if (!faceEmbedding || !selectedClass || !selectedSubject) {
      alert('Please select class, subject, and capture a face.');
      return;
    }

    setLoading(true);
    try {
      // Fetch all students from the selected class
      const { data: students, error } = await supabase
        .from('students')
        .select('id, name, roll_number, face_embedding')
        .eq('class_id', selectedClass);

      if (error) throw error;

      // Compare captured face embedding with stored embeddings
      let closestMatch: any = null;
      let minDistance = Infinity;

      students?.forEach((student) => {
        const distance = compareEmbeddings(faceEmbedding, student.face_embedding);
        if (distance < minDistance) {
          minDistance = distance;
          closestMatch = student;
        }
      });

      if (closestMatch) {
        // Mark attendance for the closest matched student
        const { error: attendanceError } = await supabase.from('attendance').insert([
          {
            student_id: closestMatch.id,
            class_id: selectedClass,
            subject_id: selectedSubject,
            date: new Date().toISOString().split('T')[0], // Use current date
            status: 'present',
          },
        ]);

        if (attendanceError) throw attendanceError;

        setAttendanceStatus(`Attendance marked for ${closestMatch.name} (Roll No: ${closestMatch.roll_number})`);
      } else {
        setAttendanceStatus('No matching student found.');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setAttendanceStatus('Failed to mark attendance.');
    } finally {
      setLoading(false);
    }
  };

  const compareEmbeddings = (embedding1: number[], embedding2: number[]): number => {
    // Calculate cosine similarity or Euclidean distance between two embeddings
    // Here, we'll use cosine similarity
    const dotProduct = embedding1.reduce((sum, val, index) => sum + val * embedding2[index], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val ** 2, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val ** 2, 0));

    return 1 - dotProduct / (magnitude1 * magnitude2); // Cosine similarity (lower is better)
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Take Attendance</h1>

        <Card>
          <CardHeader>
            <CardTitle>Select Class and Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="mb-4">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleTakeAttendance} disabled={loading} className="mb-4 bg-black">
                  {loading ? 'Marking Attendance...' : 'Mark Attendance'}
                </Button>

                {attendanceStatus && <p className="mt-2">{attendanceStatus}</p>}
                {captureStatus && <p className="mt-2">{captureStatus}</p>}
              </div>

              <FaceRecognition onCapture={handleCapture} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

