// app/(root)/meeting/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';
import Loader from '@/components/Loader';

const MeetingPage = () => {
  const { id } = useParams();
  const { isLoaded, user } = useUser();
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (!isLoaded || !user) return <Loader />;

  return (
    <main className='h-screen w-full'>
      {!isSetupComplete ? (
        <MeetingSetup setIsSetupComplete={setIsSetupComplete} channelName={id as string} />
      ) : (
        <MeetingRoom />
      )}
    </main>
  );
};

export default MeetingPage;