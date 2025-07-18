// components/MeetingTypeList.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import { generateAgoraToken } from '@/actions/agora.actions';
import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import Loader from './Loader';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { useToast } from './ui/use-toast';
import { Input } from './ui/input';

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [channelName, setChannelName] = useState<string | undefined>();
  const { user } = useUser();
  const { toast } = useToast();

  const createMeeting = async () => {
    if (!user) return;
    try {
      const id = uuidv4();
      await generateAgoraToken(id); // Generate token for the meeting
      toast({ title: 'Meeting Created' });
      if (meetingState === 'isInstantMeeting') {
        router.push(`/meeting/${id}`); // Navigate immediately for instant meetings
      } else if (meetingState === 'isScheduleMeeting') {
        if (!values.dateTime) {
          toast({ title: 'Please select a date and time' });
          return;
        }
        setChannelName(id); // Set channelName for scheduled meetings
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    } finally {
      if (meetingState === 'isInstantMeeting') {
        setMeetingState(undefined); // Close the modal after navigation
      }
    }
  };

  if (!user) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${channelName}`;

  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
      <HomeCard
        img='/icons/add-meeting.svg'
        title='New Meeting'
        description='Start an instant meeting'
        handleClick={() => setMeetingState('isInstantMeeting')}
      />
      <HomeCard
        img='/icons/join-meeting.svg'
        title='Join Meeting'
        description='via invitation link'
        className='bg-blue-1'
        handleClick={() => setMeetingState('isJoiningMeeting')}
      />
      <HomeCard
        img='/icons/schedule.svg'
        title='Schedule Meeting'
        description='Plan your meeting'
        className='bg-purple-1'
        handleClick={() => setMeetingState('isScheduleMeeting')}
      />
      <HomeCard
        img='/icons/recordings.svg'
        title='View Recordings'
        description='Meeting Recordings'
        className='bg-yellow-1'
        handleClick={() => router.push('/recordings')}
      />
      {!channelName ? (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title='Create Meeting'
          handleClick={createMeeting}
        >
          <div className='flex flex-col gap-2.5'>
            <label className='text-base font-normal leading-[22.4px] text-sky-2'>
              Add a description
            </label>
            <Textarea
              className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0'
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>
          <div className='flex w-full flex-col gap-2.5'>
            <label className='text-base font-normal leading-[22.4px] text-sky-2'>
              Select Date and Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat='HH:mm'
              timeIntervals={15}
              timeCaption='time'
              dateFormat='MMMM d, yyyy h:mm aa'
              className='w-full rounded bg-dark-3 p-2 focus:outline-none'
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => {
            setMeetingState(undefined);
            setChannelName(undefined); // Reset channelName
          }}
          title='Meeting Created'
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: 'Link Copied' });
          }}
          image='/icons/checked.svg'
          buttonIcon='/icons/copy.svg'
          className='text-center'
          buttonText='Copy Meeting Link'
        />
      )}
      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title='Type the link here'
        className='text-center'
        buttonText='Join Meeting'
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder='Meeting link'
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0'
        />
      </MeetingModal>
      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title='Start an Instant Meeting'
        className='text-center'
        buttonText='Start Meeting'
        handleClick={createMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;