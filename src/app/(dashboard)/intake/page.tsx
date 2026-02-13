'use client';

import { Component, type ReactNode } from 'react';
import { WizardProvider, useWizard } from '@/components/intake/wizard-provider';
import { StepCoachingModel } from '@/components/intake/step-coaching-model';
import { StepBusinessInfo } from '@/components/intake/step-business-info';
import { StepClientJourney } from '@/components/intake/step-client-journey';
import { StepServicesPricing } from '@/components/intake/step-services-pricing';
import { StepCommunication } from '@/components/intake/step-communication';
import { StepReview } from '@/components/intake/step-review';
import { Progress } from '@/components/ui/progress';

const STEP_LABELS = [
  'Coaching Model',
  'Business Info',
  'Client Journey',
  'Services & Pricing',
  'Communication',
  'Review',
];

class IntakeErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-lg bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
            <p className="text-sm text-gray-600">
              Error: {this.state.error.message}
            </p>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => this.setState({ error: null })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function WizardContent() {
  const { step, totalSteps } = useWizard();
  const progressPercent = ((step + 1) / totalSteps) * 100;

  const steps = [
    <StepCoachingModel key="0" />,
    <StepBusinessInfo key="1" />,
    <StepClientJourney key="2" />,
    <StepServicesPricing key="3" />,
    <StepCommunication key="4" />,
    <StepReview key="5" />,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Tell Us About Your Business</h1>
          <div className="flex items-center gap-3 mb-2">
            <Progress value={progressPercent} className="flex-1" />
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Step {step + 1} of {totalSteps}
            </span>
          </div>
          <p className="text-sm text-gray-500">{STEP_LABELS[step]}</p>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {steps[step]}
        </div>
      </div>
    </div>
  );
}

export default function IntakePage() {
  return (
    <IntakeErrorBoundary>
      <WizardProvider>
        <WizardContent />
      </WizardProvider>
    </IntakeErrorBoundary>
  );
}
