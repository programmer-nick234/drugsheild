import React from 'react';
import { useRouter } from 'expo-router';
import SymptomAnalyzer from '@/components/SymptomAnalyzer';

export default function SymptomAnalyzerScreen() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return <SymptomAnalyzer onClose={handleClose} />;
}