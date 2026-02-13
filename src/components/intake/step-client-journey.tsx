'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizard } from './wizard-provider';
import { clientJourneySchema, type ClientJourneyData, LEAD_SOURCE_OPTIONS } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check } from 'lucide-react';

export function StepClientJourney() {
  const { data, updateData, setStep } = useWizard();

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<ClientJourneyData>({
    resolver: zodResolver(clientJourneySchema),
    defaultValues: {
      how_clients_find_you: data.how_clients_find_you || [],
      current_booking_method: data.current_booking_method || '',
      lead_to_client_steps: data.lead_to_client_steps || '',
    },
  });

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
        <Controller
          control={control}
          name="how_clients_find_you"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2">
              {LEAD_SOURCE_OPTIONS.map((opt) => {
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
        {errors.how_clients_find_you && (
          <p className="text-sm text-red-500">{errors.how_clients_find_you.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>How do clients currently book with you?</Label>
        <Controller
          control={control}
          name="current_booking_method"
          render={({ field }) => (
            <RadioGroup value={field.value ?? ''} onValueChange={field.onChange}>
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
          )}
        />
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
