'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizard } from './wizard-provider';
import { communicationSchema, type CommunicationData, CHANNEL_OPTIONS } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';

export function StepCommunication() {
  const { data, updateData, setStep } = useWizard();

  const {
    handleSubmit,
    register,
    control,
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
        <Controller
          control={control}
          name="preferred_channels"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2">
              {CHANNEL_OPTIONS.map((opt) => {
                const isSelected = (field.value || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      const current = field.value || [];
                      const updated = isSelected
                        ? current.filter((v) => v !== opt.value)
                        : [...current, opt.value];
                      field.onChange(updated);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm text-left transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`flex items-center justify-center size-4 rounded border ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                      {isSelected && <Check className="size-3" />}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.preferred_channels && (
          <p className="text-sm text-red-500">{errors.preferred_channels.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>How quickly do you follow up with new leads?</Label>
        <Controller
          control={control}
          name="follow_up_frequency"
          render={({ field }) => (
            <div className="grid gap-2">
              {[
                { value: 'same_day', label: 'Same day' },
                { value: 'few_days', label: 'Within a few days' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'when_i_remember', label: 'When I remember...' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    field.value === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="follow_up_frequency"
                    value={opt.value}
                    checked={field.value === opt.value}
                    onChange={() => field.onChange(opt.value)}
                    className="size-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="flex-1">{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.follow_up_frequency && (
          <p className="text-sm text-red-500">{errors.follow_up_frequency.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Do you currently use email sequences or drip campaigns?</Label>
        <Controller
          control={control}
          name="uses_email_sequences"
          render={({ field }) => (
            <div className="grid gap-2">
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'whats_that', label: "What's that?" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    field.value === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="uses_email_sequences"
                    value={opt.value}
                    checked={field.value === opt.value}
                    onChange={() => field.onChange(opt.value)}
                    className="size-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="flex-1">{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        />
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
