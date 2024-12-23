"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase-client';
import { SiteHeader } from "@/components/site-header";

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  class_id: string;
  teacher_name: string;
}

export default function AddSubject() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('classes').select('id, name');
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      alert('Failed to fetch classes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('subjects').select('*');
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      alert('Failed to fetch subjects.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectName.trim() || !teacherName.trim() || !selectedClass) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      if (editingSubjectId) {
        // Update subject
        const { error } = await supabase
          .from('subjects')
          .update({ name: subjectName.trim(), class_id: selectedClass, teacher_name: teacherName.trim() })
          .eq('id', editingSubjectId);

        if (error) throw error;
        alert('Subject updated successfully!');
      } else {
        // Add new subject
        const { error } = await supabase
          .from('subjects')
          .insert([{ name: subjectName.trim(), class_id: selectedClass, teacher_name: teacherName.trim() }]);

        if (error) throw error;
        alert('Subject added successfully!');
      }

      setSubjectName('');
      setTeacherName('');
      setEditingSubjectId(null);
      fetchSubjects();
    } catch (error) {
      console.error('Error submitting subject:', error);
      alert('Failed to submit subject.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setSubjectName(subject.name);
    setTeacherName(subject.teacher_name);
    setSelectedClass(subject.class_id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      setLoading(true);
      try {
        const { error } = await supabase.from('subjects').delete().eq('id', id);
        if (error) throw error;
        alert('Subject deleted successfully!');
        fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Failed to delete subject.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Subject Management</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingSubjectId ? 'Edit Subject' : 'Add New Subject'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="class">Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger id="class">
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

                <div className="grid gap-2">
                  <Label htmlFor="subjectName">Subject Name</Label>
                  <Input
                    id="subjectName"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="teacherName">Teacher Name</Label>
                  <Input
                    id="teacherName"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="mt-4">
                {loading ? (editingSubjectId ? 'Updating...' : 'Adding...') : (editingSubjectId ? 'Update Subject' : 'Add Subject')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>{classes.find(cls => cls.id === subject.class_id)?.name || 'Unknown'}</TableCell>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>{subject.teacher_name}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(subject)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(subject.id)} disabled={loading}>
                          Delete
                        </Button>
                      </TableCell>
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
