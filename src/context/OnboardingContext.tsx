// src/context/OnboardingContext.tsx

import { OnboardingData } from '@/services/onboarding/types';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface OnboardingContextType {
  onboardingData: Partial<OnboardingData>;
  updatePersonal: (data: OnboardingData['personal']) => void;
  updatePhysical: (data: OnboardingData['physical']) => void;
  updateFamily: (data: OnboardingData['family']) => void;
  updateLifestyle: (data: OnboardingData['lifestyle']) => void;
  updateSymptoms: (data: OnboardingData['symptoms']) => void;
  resetOnboarding: () => void;
  setOnboardingData: (data: OnboardingData) => void;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [onboardingData, setData] = useState<Partial<OnboardingData>>({});
  const [isEditMode, setIsEditMode] = useState(false);

  const updatePersonal = (data: OnboardingData['personal']) => {
    setData(prev => ({ ...prev, personal: data }));
  };

  const updatePhysical = (data: OnboardingData['physical']) => {
    setData(prev => ({ ...prev, physical: data }));
  };

  const updateFamily = (data: OnboardingData['family']) => {
    setData(prev => ({ ...prev, family: data }));
  };

  const updateLifestyle = (data: OnboardingData['lifestyle']) => {
    setData(prev => ({ ...prev, lifestyle: data }));
  };

  const updateSymptoms = (data: OnboardingData['symptoms']) => {
    setData(prev => ({ ...prev, symptoms: data }));
  };

  const resetOnboarding = () => {
    setData({});
    setIsEditMode(false);
  };

  const setOnboardingData = (data: OnboardingData) => {
    setData(data);
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        updatePersonal,
        updatePhysical,
        updateFamily,
        updateLifestyle,
        updateSymptoms,
        resetOnboarding,
        setOnboardingData,
        isEditMode,
        setIsEditMode,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}