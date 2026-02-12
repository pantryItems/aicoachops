'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { FullIntakeData } from '@/types/intake';

type PartialIntake = Partial<FullIntakeData>;

interface WizardContextType {
  step: number;
  setStep: (step: number) => void;
  data: PartialIntake;
  updateData: (partial: PartialIntake) => void;
  totalSteps: number;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<PartialIntake>({
    services: [],
    how_clients_find_you: [],
    preferred_channels: [],
    uses_packages: false,
  });

  function updateData(partial: PartialIntake) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  return (
    <WizardContext.Provider value={{ step, setStep, data, updateData, totalSteps: 6 }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) throw new Error('useWizard must be used within WizardProvider');
  return context;
}
