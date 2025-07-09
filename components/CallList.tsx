// components/CallList.tsx
'use client';

const CallList = ({ type }: { type: 'ended' | 'upcoming' | 'recordings' }) => {
  const getMessage = () => {
    switch (type) {
      case 'ended':
        return 'No Previous Calls: Call history not supported by Agora.';
      case 'upcoming':
        return 'No Upcoming Calls: Schedule meetings to create new calls.';
      case 'recordings':
        return 'No Recordings: Agora recording requires cloud recording setup.';
      default:
        return '';
    }
  };

  return (
    <div className='grid grid-cols-1 gap-5 xl:grid-cols-2'>
      <h1 className='text-2xl font-bold text-white'>{getMessage()}</h1>
    </div>
  );
};

export default CallList;