// components/MeetingRoom.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAgoraClient } from '@/providers/AgoraClientProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { Users, LayoutList } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const { client } = useAgoraClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<IAgoraRTCRemoteUser[]>([]);

  useEffect(() => {
    if (!client) return;

    const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
      setParticipants((prev) => [...prev, user]);
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setParticipants((prev) => prev.filter((p) => p.uid !== user.uid));
    };

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'video' && user.videoTrack) {
        const containerId = `remote-video-${user.uid}`;
        let container = document.getElementById(containerId);
        if (!container) {
          container = document.createElement('div');
          container.id = containerId;
          container.className = 'w-[320px] h-[240px] bg-dark-3 rounded';
          document.getElementById('video-container')?.appendChild(container);
        }
        user.videoTrack.play(container);
      }
      if (mediaType === 'audio' && user.audioTrack) {
        user.audioTrack.play();
      }
    };

    client.on('user-joined', handleUserJoined);
    client.on('user-left', handleUserLeft);
    client.on('user-published', handleUserPublished);

    return () => {
      client.off('user-joined', handleUserJoined);
      client.off('user-left', handleUserLeft);
      client.off('user-published', handleUserPublished);
      client.leave();
    };
  }, [client]);

  if (!client) return <Loader />;

  const leaveCall = async () => {
    await client?.leave();
    router.push('/');
  };

  const renderParticipants = () => {
    return participants.map((user) => (
      <div key={user.uid} className='p-2 text-white'>
        <div id={`remote-video-${user.uid}`} className='w-[160px] h-[120px] bg-dark-3 rounded'></div>
        <p>User {user.uid}</p>
      </div>
    ));
  };

  const renderLayout = () => {
    const containerClass = layout === 'grid' ? 'grid grid-cols-2 gap-4' :
      layout === 'speaker-left' ? 'flex flex-row-reverse' : 'flex flex-row';
    return (
      <div className={containerClass} id='video-container'>
        {participants.map((user) => (
          <div key={user.uid} id={`remote-video-${user.uid}`} className='w-[320px] h-[240px] bg-dark-3 rounded'></div>
        ))}
      </div>
    );
  };

  return (
    <section className='relative h-screen w-full overflow-hidden pt-4 text-white'>
      <div className='relative flex size-full items-center justify-center'>
        <div className='flex size-full max-w-[1000px] items-center'>
          {renderLayout()}
        </div>
        <div className={cn('h-[calc(100vh-86px)] hidden ml-2', { 'show-block': showParticipants })}>
          <div className='bg-dark-1 p-4 rounded h-full overflow-y-auto'>{renderParticipants()}</div>
        </div>
      </div>
      <div className='fixed bottom-0 flex w-full items-center justify-center gap-5'>
        <Button onClick={leaveCall} className='bg-red-500'>Leave Call</Button>
        <DropdownMenu>
          <div className='flex items-center'>
            <DropdownMenuTrigger className='cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]'>
              <LayoutList size={20} className='text-white' />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className='border-dark-1 bg-dark-1 text-white'>
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className='border-dark-1' />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className='cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]'>
            <Users size={20} className='text-white' />
          </div>
        </button>
      </div>
    </section>
  );
};

export default MeetingRoom;