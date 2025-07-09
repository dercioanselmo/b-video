// actions/agora.actions.ts
'use server';

import { currentUser } from '@clerk/nextjs/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

export const generateAgoraToken = async (channelName: string) => {
  const user = await currentUser();

  if (!user) throw new Error('User is not authenticated');
  if (!AGORA_APP_ID) throw new Error('Agora App ID is missing');
  if (!AGORA_APP_CERTIFICATE) throw new Error('Agora App Certificate is missing');

  const uid = 0; // Use 0 for dynamic UID assignment
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // Token valid for 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  return { token, appId: AGORA_APP_ID };
};