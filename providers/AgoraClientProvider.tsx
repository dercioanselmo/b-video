// providers/AgoraClientProvider.tsx
'use client';

import { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { useUser } from '@clerk/nextjs';
import { AgoraRTCProvider, useRTCClient } from 'agora-rtc-react';
import Loader from '@/components/Loader';

interface AgoraContextType {
  client: ReturnType<typeof useRTCClient> | null;
  appId: string | null;
}

const AgoraContext = createContext<AgoraContextType>({ client: null, appId: null });

export const useAgoraClient = () => useContext(AgoraContext);

const AgoraClientProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<ReturnType<typeof useRTCClient> | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const { user, isLoaded } = useUser();
  const agoraClient = useRTCClient({ mode: 'rtc', codec: 'vp8' });

  useEffect(() => {
    if (!isLoaded || !user) return;

    const initClient = async () => {
      setClient(agoraClient);
      setAppId(process.env.NEXT_PUBLIC_AGORA_APP_ID!);
    };

    initClient();
  }, [user, isLoaded, agoraClient]);

  if (!client || !appId) return <Loader />;

  return (
    <AgoraRTCProvider client={client}>
      <AgoraContext.Provider value={{ client, appId }}>
        {children}
      </AgoraContext.Provider>
    </AgoraRTCProvider>
  );
};

export default AgoraClientProvider;