'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizard } from './wizard-provider';
import { coachingModelSchema, type CoachingModelData, NICHE_OPTIONS } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function StepCoachingModel() {
  const { data, updateData, setStep } = useWizard();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CoachingModelData>({
    resolver: zodResolver(coachingModelSchema),
    defaultValues: {
      coaching_type: data.coaching_type || undefined,
      niche: data.niche || '',
      niche_detail: data.niche_detail || '',
    },
  });

  const selectedNiche = watch('niche');

  function onSubmit(values: CoachingModelData) {
    updateData(values);
    setStep(1);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Your Coaching Model</h2>
        <p className="text-sm text-gray-500">Tell us how you coach your clients.</p>
      </div>

      <div className="space-y-3">
        <Label>What type of coaching do you offer?</Label>
        <RadioGroup
          value={watch('coaching_type')}
          onValueChange={(v) => setValue('coaching_type', v as CoachingModelData['coaching_type'])}
        >
          {[
            { value: '1on1', label: '1-on-1 Coaching' },
            { value: 'group', label: 'Group Coaching' },
            { value: 'course', label: 'Online Course / Program' },
            { value: 'hybrid', label: 'Hybrid (mix of the above)' },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value={opt.value} id={opt.value} />
              <Label htmlFor={opt.value} className="cursor-pointer flex-1">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {errors.coaching_type && (
          <p className="text-sm text-red-500">{errors.coaching_type.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>What&apos;s your coaching niche?</Label>
        <div className="grid grid-cols-2 gap-2">
          {NICHE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue('niche', opt.value)}
              className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                selectedNiche === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.niche && (
          <p className="text-sm text-red-500">{errors.niche.message}</p>
        )}
      </div>

      {selectedNiche === 'other' && (
        <div className="space-y-2">
          <Label htmlFor="niche_detail">Describe your niche</Label>
          <Input
            id="niche_detail"
            {...register('niche_detail')}
            placeholder="e.g., ADHD coaching for college students"
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
