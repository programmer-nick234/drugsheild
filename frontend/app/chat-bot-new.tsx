import React from 'react';
import { useRouter } from 'expo-router';
import HealthChatBot from '@/components/HealthChatBot';

export default function ChatBotScreen() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return <HealthChatBot onClose={handleClose} />;
}