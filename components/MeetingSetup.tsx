// components/MeetingSetup.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAgoraClient } from '@/providers/AgoraClientProvider';
import { useUser } from '@clerk/nextjs';
import { generateAgoraToken } from '@/actions/agora.actions';
import AgoraRTC, { ILocalVideoTrack, ILocalAudioTrack } from 'agora-rtc-sdk-ng';
import { Button } from './ui/button';
import Alert from './Alert';
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeetingSetupProps {
  setIsSetupComplete: (value: boolean) => void;
  channelName: string;
  scheduledTime?: Date;
}

const MeetingSetup = ({ setIsSetupComplete, channelName, scheduledTime }: MeetingSetupProps) => {
  const { client, appId } = useAgoraClient();
  const { user } = useUser();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const callTimeNotArrived = scheduledTime && scheduledTime > now;

  useEffect(() => {
    if (!client || !appId || !user) {
      setIsLoading(false);
      return;
    }

    const initTracks = async () => {
      try {
        setIsLoading(true);
        // Request permissions explicitly
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => track.stop()); // Release the stream

        // Initialize Agora tracks using AgoraRTC directly
        const [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack().catch((err) => {
            console.error('Audio track creation failed:', err);
            throw new Error('Failed to create audio track');
          }),
          AgoraRTC.createCameraVideoTrack().catch((err) => {
            console.error('Video track creation failed:', err);
            throw new Error('Failed to create video track');
          }),
        ]);

        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        if (!isMicOn && audioTrack) audioTrack.setEnabled(false);
        if (!isCamOn && videoTrack) videoTrack.setEnabled(false);

        const videoContainer = document.getElementById('video-preview');
        if (videoContainer && videoTrack && isCamOn) {
          videoTrack.play(videoContainer);
        }
      } catch (err: any) {
        console.error('Track initialization error:', err.message, err.name, err);
        setError(
          `Failed to access camera or microphone: ${err.message}. Please ensure devices are available and permissions are granted.`
        );
      } finally {
        setIsLoading(false);
      }
    };

    initTracks();

    return () => {
      localVideoTrack?.close();
      localAudioTrack?.close();
    };
  }, [client, appId, user, isMicOn, isCamOn]);

  const joinMeeting = async () => {
    if (!client || !appId || !user) return;

    try {
      const { token } = await generateAgoraToken(channelName);
      await client.join(appId, channelName, token, user.id);
      if (localAudioTrack) await client.publish(localAudioTrack);
      if (localVideoTrack) await client.publish(localVideoTrack);
      setIsSetupComplete(true);
    } catch (error) {
      console.error('Failed to join meeting:', error);
      setError('Failed to join meeting. Please try again.');
    }
  };

  if (isLoading) return <div className='text-white text-center'>Loading media devices...</div>;

  if (callTimeNotArrived) {
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${scheduledTime?.toLocaleString()}`}
      />
    );
  }

  if (error) {
    return <Alert title={error} />;
  }

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-6 text-white bg-dark-2'>
      <h1 className='text-3xl font-bold'>Meeting Setup</h1>
      <div id='video-preview' className='w-[640px] h-[480px] bg-dark-3 rounded-lg shadow-lg'></div>
      <div className='flex items-center justify-center gap-6'>
        <button
          onClick={() => {
            setIsMicOn(!isMicOn);
            localAudioTrack?.setEnabled(isMicOn);
          }}
          className={cn(
            'p-3 rounded-full bg-dark-3 hover:bg-dark-1 transition-colors',
            isMicOn ? 'text-blue-1' : 'text-red-500'
          )}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button
          onClick={() => {
            setIsCamOn(!isCamOn);
            localVideoTrack?.setEnabled(isCamOn);
            if (isCamOn && localVideoTrack) {
              const videoContainer = document.getElementById('video-preview');
              if (videoContainer) localVideoTrack.play(videoContainer);
            }
          }}
          className={cn(
            'p-3 rounded-full bg-dark-3 hover:bg-dark-1 transition-colors',
            isCamOn ? 'text-blue-1' : 'text-red-500'
          )}
        >
          {isCamOn ? <Camera size={24} /> : <CameraOff size={24} />}
        </button>
      </div>
      <Button
        className='rounded-md bg-green-500 px-6 py-3 text-lg font-semibold hover:bg-green-600 transition-colors'
        onClick={joinMeeting}
      >
        Join Meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;