import React from 'react';
import { useRouter } from 'expo-router';
import DrugRiskAnalysis from '@/components/DrugRiskAnalysis';

export default function RiskCheckScreen() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return <DrugRiskAnalysis onClose={handleClose} />;
}