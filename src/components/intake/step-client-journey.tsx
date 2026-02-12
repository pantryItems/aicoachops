'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizard } from './wizard-provider';
import { clientJourneySchema, type ClientJourneyData, LEAD_SOURCE_OPTIONS } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function StepClientJourney() {
  const { data, updateData, setStep } = useWizard();

  const {
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<ClientJourneyData>({
    resolver: zodResolver(clientJourneySchema),
    defaultValues: {
      how_clients_find_you: data.how_clients_find_you || [],
      current_booking_method: data.current_booking_method || '',
      lead_to_client_steps: data.lead_to_client_steps || '',
    },
  });

  const selectedSources = watch('how_clients_find_you');

  function toggleSource(value: string) {
    const current = selectedSources || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue('how_clients_find_you', updated);
  }

  function onSubmit(values: ClientJourneyData) {
    updateData(values);
    setStep(3);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Client Journey</h2>
        <p className="text-sm text-gray-500">How do clients find you and become paying customers?</p>
      </div>

      <div className="space-y-3">
        <Label>How do clients find you? (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2">
          {LEAD_SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleSource(opt.value)}
              className={`flex items-center gap-2 p-3 rounded-lg border text-sm text-left transition-colors ${
                selectedSources?.includes(opt.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              <Checkbox checked={selectedSources?.includes(opt.value)} className="pointer-events-none" />
              {opt.label}
            </button>
          ))}
        </div>
        {errors.how_clients_find_you && (
          <p className="text-sm text-red-500">{errors.how_clients_find_you.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>How do clients currently book with you?</Label>
        <RadioGroup
          value={watch('current_booking_method')}
          onValueChange={(v) => setValue('current_booking_method', v)}
        >
          {[
            { value: 'manual', label: 'They message me and we figure it out' },
            { value: 'calendly', label: 'Calendly or other scheduling tool' },
            { value: 'ghl_existing', label: 'Already using GHL calendar' },
            { value: 'other', label: 'Other' },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
              <RadioGroupItem value={opt.value} id={`book-${opt.value}`} />
              <Label htmlFor={`book-${opt.value}`} className="cursor-pointer flex-1">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {errors.current_booking_method && (
          <p className="text-sm text-red-500">{errors.current_booking_method.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead_to_client_steps">
          Describe your process from first contact to paying client
        </Label>
        <Textarea
          id="lead_to_client_steps"
          {...register('lead_to_client_steps')}
          placeholder="e.g., Someone DMs me on Instagram, I send them a link to book a discovery call, we chat for 30 minutes, and if it's a fit I send them a payment link..."
          rows={4}
        />
        {errors.lead_to_client_steps && (
          <p className="text-sm text-red-500">{errors.lead_to_client_steps.message}</p>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
