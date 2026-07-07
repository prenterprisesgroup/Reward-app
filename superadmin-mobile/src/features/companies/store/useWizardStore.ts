import { create } from 'zustand';

export type DraftStatus = 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISCARDED';

interface WizardState {
  currentStep: number;
  draftId: string | null;
  draftStatus: DraftStatus | null;
  completedSteps: number[];
  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  markStepComplete: (step: number) => void;
  setDraftId: (id: string) => void;
  setDraftStatus: (status: DraftStatus) => void;
  resetWizard: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 1,
  draftId: null,
  draftStatus: null,
  completedSteps: [],
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  previousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  markStepComplete: (step) => set((state) => ({ 
    completedSteps: state.completedSteps.includes(step) ? state.completedSteps : [...state.completedSteps, step]
  })),
  setDraftId: (id) => set({ draftId: id, draftStatus: 'CREATED' }),
  setDraftStatus: (status) => set({ draftStatus: status }),
  resetWizard: () => set({ currentStep: 1, draftId: null, draftStatus: null, completedSteps: [] }),
}));
