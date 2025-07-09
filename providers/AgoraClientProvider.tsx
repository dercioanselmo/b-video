// providers/AgoraClientProvider.tsx
'use client';

import { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { useUser } from '@clerk/nextjs';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import Loader from '@/components/Loader';

interface AgoraContextType {
  client: IAgoraRTCClient | null;
  appId: string | null;
}

const AgoraContext = createContext<AgoraContextType>({ client: null, appId: null });

export const useAgoraClient = () => useContext(AgoraContext);

const AgoraClientProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const initClient = async () => {
      const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setClient(agoraClient);
      setAppId(process.env.NEXT_PUBLIC_AGORA_APP_ID!);
    };

    initClient();
  }, [user, isLoaded]);

  if (!client || !appId) return <Loader />;

  return (
    <AgoraContext.Provider value={{ client, appId }}>
      {children}
    </AgoraContext.Provider>
  );
};

export default AgoraClientProvider;