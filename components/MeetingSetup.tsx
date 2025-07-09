// components/MeetingSetup.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAgoraClient } from '@/providers/AgoraClientProvider';
import { useUser } from '@clerk/nextjs';
import { generateAgoraToken } from '@/actions/agora.actions';
import { useJoin, useLocalCameraTrack, useLocalMicrophoneTrack } from 'agora-rtc-react';
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
  const { localMicrophoneTrack, isLoading: isMicLoading } = useLocalMicrophoneTrack();
  const { localCameraTrack, isLoading: isCamLoading } = useLocalCameraTrack();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  useEffect(() => {
    if (!client || !appId || !user) return;

    if (!isMicOn && localMicrophoneTrack) localMicrophoneTrack.setEnabled(false);
    if (!isCamOn && localCameraTrack) localCameraTrack.setEnabled(false);

    const videoContainer = document.getElementById('video-preview');
    if (videoContainer && localCameraTrack && isCamOn) {
      localCameraTrack.play(videoContainer);
    }

    return () => {
      localCameraTrack?.close();
      localMicrophoneTrack?.close();
    };
  }, [client, appId, user, isMicOn, isCamOn, localCameraTrack, localMicrophoneTrack]);

  const joinMeeting = async () => {
    if (!client || !appId || !user) return;

    try {
      const { token } = await generateAgoraToken(channelName);
      await useJoin({ appid: appId, channel: channelName, token, uid: user.id });
      setIsSetupComplete(true);
    } catch (error) {
      console.error('Failed to join meeting:', error);
    }
  };

  if (callTimeNotArrived) {
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${scheduledTime?.toLocaleString()}`}
      />
    );
  }

  if (isMicLoading || isCamLoading) return <div>Loading media devices...</div>;

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
              if (localMicrophoneTrack) localMicrophoneTrack.setEnabled(isMicOn);
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
              if (localCameraTrack) localCameraTrack.setEnabled(isCamOn);
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