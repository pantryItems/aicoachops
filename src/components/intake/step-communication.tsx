'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizard } from './wizard-provider';
import { communicationSchema, type CommunicationData, CHANNEL_OPTIONS } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function StepCommunication() {
  const { data, updateData, setStep } = useWizard();

  const {
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<CommunicationData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      preferred_channels: data.preferred_channels || [],
      follow_up_frequency: data.follow_up_frequency || ('' as CommunicationData['follow_up_frequency']),
      uses_email_sequences: data.uses_email_sequences || ('' as CommunicationData['uses_email_sequences']),
      biggest_tech_pain: data.biggest_tech_pain || '',
    },
  });

  const selectedChannels = watch('preferred_channels');

  function toggleChannel(value: string) {
    const current = selectedChannels || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue('preferred_channels', updated);
  }

  function onSubmit(values: CommunicationData) {
    updateData(values);
    setStep(5); // Go to review
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Communication</h2>
        <p className="text-sm text-gray-500">How do you stay in touch with clients and leads?</p>
      </div>

      <div className="space-y-3">
        <Label>How do you prefer to communicate? (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2">
          {CHANNEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleChannel(opt.value)}
              className={`flex items-center gap-2 p-3 rounded-lg border text-sm text-left transition-colors ${
                selectedChannels?.includes(opt.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              <Checkbox checked={selectedChannels?.includes(opt.value) ?? false} className="pointer-events-none" />
              {opt.label}
            </button>
          ))}
        </div>
        {errors.preferred_channels && (
          <p className="text-sm text-red-500">{errors.preferred_channels.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>How quickly do you follow up with new leads?</Label>
        <RadioGroup
          value={watch('follow_up_frequency') ?? ''}
          onValueChange={(v) => setValue('follow_up_frequency', v as CommunicationData['follow_up_frequency'])}
        >
          {[
            { value: 'same_day', label: 'Same day' },
            { value: 'few_days', label: 'Within a few days' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'when_i_remember', label: 'When I remember...' },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
              <RadioGroupItem value={opt.value} id={`freq-${opt.value}`} />
              <Label htmlFor={`freq-${opt.value}`} className="cursor-pointer flex-1">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {errors.follow_up_frequency && (
          <p className="text-sm text-red-500">{errors.follow_up_frequency.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Do you currently use email sequences or drip campaigns?</Label>
        <RadioGroup
          value={watch('uses_email_sequences') ?? ''}
          onValueChange={(v) => setValue('uses_email_sequences', v as CommunicationData['uses_email_sequences'])}
        >
          {[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'whats_that', label: "What's that?" },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
              <RadioGroupItem value={opt.value} id={`seq-${opt.value}`} />
              <Label htmlFor={`seq-${opt.value}`} className="cursor-pointer flex-1">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {errors.uses_email_sequences && (
          <p className="text-sm text-red-500">{errors.uses_email_sequences.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="biggest_tech_pain">
          What&apos;s your biggest tech headache right now?
        </Label>
        <Textarea
          id="biggest_tech_pain"
          {...register('biggest_tech_pain')}
          placeholder="e.g., I bought GHL but never set it up because I couldn't figure out the automations..."
          rows={3}
        />
        {errors.biggest_tech_pain && (
          <p className="text-sm text-red-500">{errors.biggest_tech_pain.message}</p>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(3)}>
          Back
        </Button>
        <Button type="submit">Review My Answers</Button>
      </div>
    </form>
  );
}
