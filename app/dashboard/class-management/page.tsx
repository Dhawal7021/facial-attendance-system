"use client"

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/lib/supabase-client';
import { SiteHeader } from "@/components/site-header";

interface Class {
  id: string;
  name: string;
  class_teacher_name: string;
  created_at?: string;
}

export default function ClassManagement() {
  const [className, setClassName] = useState('');
  const [classTeacherName, setClassTeacherName] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*, class_teacher_name')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Failed to fetch classes from the database.');
      }

      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      alert('Error fetching classes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!className.trim() || !classTeacherName) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([{ name: className.trim(), class_teacher_name: classTeacherName }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      await fetchClasses();
      setClassName('');
      setClassTeacherName('');
      alert('Class added successfully!');
    } catch (error) {
      console.error('Error adding class:', error);
      alert('Error adding class. Please check the console for more details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingClass || !className.trim() || !classTeacherName) {
      alert('Please fill in both fields.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('classes')
        .update({ name: className.trim(), class_teacher_name: classTeacherName })
        .eq('id', editingClass);

      if (error) throw error;
      
      await fetchClasses();
      setEditingClass(null);
      setClassName('');
      setClassTeacherName('');
      alert('Class updated successfully!');
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Error updating class. Please check the console for more details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const cls = classes.find(c => c.id === id);
    if (cls) {
      setClassName(cls.name);
      setClassTeacherName(cls.class_teacher_name);
      setEditingClass(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('classes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        await fetchClasses();
        alert('Class deleted successfully!');
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Error deleting class. Please check the console for more details.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Class Management</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="className">Class Name</Label>
                  <Input
                    id="className"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="classTeacher">Class Teacher</Label>
                  <Input
                    id="classTeacher"
                    value={classTeacherName}
                    onChange={(e) => setClassTeacherName(e.target.value)}
                    placeholder="Enter class teacher's name"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (editingClass ? 'Updating...' : 'Adding...') : (editingClass ? 'Update Class' : 'Add Class')}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Existing Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell>{cls.name}</TableCell>
                      <TableCell>{cls.class_teacher_name}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(cls.id)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(cls.id)} disabled={loading}>
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

