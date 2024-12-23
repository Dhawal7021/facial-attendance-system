'use client'

import React, { useRef, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FaceRecognitionProps {
  onCapture: (embeddings: number[]) => void;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
      } catch (error) {
        console.error('Error loading models:', error);
        setError('Failed to load face recognition models. Please try refreshing the page.');
      }
    };

    const startCamera = async () => {
      try {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStreamRef.current;
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setError('Unable to access the camera. Please check your permissions.');
      }
    };

    loadModels().then(startCamera);

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current) return;

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection?.descriptor) {
        onCapture(Array.from(detection.descriptor));
      } else {
        setError('No face detected. Please try again.');
      }
    } catch (error) {
      console.error('Error capturing face:', error);
      setError('Failed to capture face. Ensure proper lighting and clear visibility.');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <video
            ref={videoRef}
            width="400"
            height="300"
            className="border-2 border-gray-200 rounded-lg"
          />
          <Button onClick={handleCapture}>
            Capture Face
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FaceRecognition;

