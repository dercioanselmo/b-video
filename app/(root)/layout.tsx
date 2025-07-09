// app/(root)/layout.tsx
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const AgoraClientProvider = dynamic(() => import('@/providers/AgoraClientProvider'), { ssr: false });

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main>
      <AgoraClientProvider>{children}</AgoraClientProvider>
    </main>
  );
};

export default RootLayout;