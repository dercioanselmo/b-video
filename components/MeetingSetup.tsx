// components/MeetingSetup.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAgoraClient } from '@/providers/AgoraClientProvider';
import { useUser } from '@clerk/nextjs';
import { generateAgoraToken } from '@/actions/agora.actions';
import { ILocalVideoTrack, ILocalAudioTrack } from 'agora-rtc-sdk-ng';
import { Button } from './ui/button';
import Alert from './Alert';

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
        const [audioTrack, videoTrack] = await Promise.all([
          client.createMicrophoneAudioTrack(),
          client.createCameraVideoTrack(),
        ]);
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        if (!isMicOn) audioTrack.setEnabled(false);
        if (!isCamOn) videoTrack.setEnabled(false);

        const videoContainer = document.getElementById('video-preview');
        if (videoContainer && videoTrack) {
          videoTrack.play(videoContainer);
        }
      } catch (error) {
        console.error('Failed to initialize tracks:', error);
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
    }
  };

  if (isLoading) return <div>Loading media devices...</div>;

  if (callTimeNotArrived) {
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${scheduledTime?.toLocaleString()}`}
      />
    );
  }

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-3 text-white'>
      <h1 className='text-center text-2xl font-bold'>Setup</h1>
      <div id='video-preview' className='w-[640px] h-[480px] bg-dark-3 rounded'></div>
      <div className='flex h-16 items-center justify-center gap-3'>
        <label className='flex items-center justify-center gap-2 font-medium'>
          <input
            type='checkbox'
            checked={!isMicOn}
            onChange={() => {
              setIsMicOn(!isMicOn);
              localAudioTrack?.setEnabled(isMicOn);
            }}
          />
          Microphone Off
        </label>
        <label className='flex items-center justify-center gap-2 font-medium'>
          <input
            type='checkbox'
            checked={!isCamOn}
            onChange={() => {
              setIsCamOn(!isCamOn);
              localVideoTrack?.setEnabled(isCamOn);
            }}
          />
          Camera Off
        </label>
      </div>
      <Button className='rounded-md bg-green-500 px-4 py-2.5' onClick={joinMeeting}>
        Join Meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;