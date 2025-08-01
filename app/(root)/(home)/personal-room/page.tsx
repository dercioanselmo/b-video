// app/(root)/(home)/personal-room/page.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Table = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className='flex flex-col items-start gap-2 xl:flex-row'>
      <h1 className='text-base font-medium text-sky-1 lg:text-xl xl:min-w-32'>
        {title}:
      </h1>
      <h1 className='truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl'>
        {description}
      </h1>
    </div>
  );
};

const PersonalRoom = () => {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const meetingId = user?.id;
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`;

  const startRoom = () => {
    if (!user) return;
    router.push(`/meeting/${meetingId}?personal=true`);
  };

  return (
    <section className='flex size-full flex-col gap-10 text-white'>
      <h1 className='text-xl font-bold lg:text-3xl'>Personal Meeting Room</h1>
      <div className='flex w-full flex-col gap-8 xl:max-w-[900px]'>
        <Table title='Topic' description={`${user?.username}'s Meeting Room`} />
        <Table title='Meeting ID' description={meetingId!} />
        <Table title='Invite Link' description={meetingLink} />
      </div>
      <div className='flex gap-5'>
        <Button className='bg-blue-1' onClick={startRoom}>
          Start Meeting
        </Button>
        <Button
          className='bg-dark-3'
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: 'Link Copied' });
          }}
        >
          Copy Invitation
        </Button>
      </div>
    </section>
  );
};

export default PersonalRoom;