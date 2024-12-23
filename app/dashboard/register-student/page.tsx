'use client';

import { useState, useEffect } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FaceRecognition from '@/components/FaceRecognition';
import { supabase } from '@/lib/supabase-client';
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Class {
  id: string;
  name: string;
}

export default function RegisterStudent() {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase.from('classes').select('id, name').order('name');
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setMessage({ type: 'error', text: 'Failed to load classes' });
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleCapture = (embeddings: number[]) => {
    setFaceEmbedding(embeddings);
    setMessage({ type: 'success', text: 'Face captured successfully!' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !rollNumber || !selectedClass || !faceEmbedding) {
      setMessage({ type: 'error', text: 'Please fill all fields and capture face' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('students').insert([
        {
          name,
          roll_number: rollNumber,
          class_id: selectedClass,
          face_embedding: faceEmbedding,
        },
      ]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Student registered successfully!' });
      setName('');
      setRollNumber('');
      setSelectedClass('');
      setFaceEmbedding(null);
    } catch (error) {
      console.error('Error registering student:', error);
      setMessage({ type: 'error', text: 'Failed to register student' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Register New Student</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full">
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

                <Button type="submit" disabled={loading || !faceEmbedding} className="w-full">
                  {loading ? 'Registering...' : 'Register Student'}
                </Button>

                {message && (
                  <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capture Face</CardTitle>
            </CardHeader>
            <CardContent>
              <FaceRecognition onCapture={handleCapture} />
              {faceEmbedding && (
                <Alert className="mt-4">
                  <AlertDescription>
                    Face captured successfully! You can now complete the registration.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

