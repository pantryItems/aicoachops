'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizard } from './wizard-provider';
import { businessInfoSchema, type BusinessInfoData } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function StepBusinessInfo() {
  const { data, updateData, setStep } = useWizard();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BusinessInfoData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      business_name: data.business_name || '',
      years_in_business: data.years_in_business || undefined,
      current_client_count: data.current_client_count || undefined,
      monthly_revenue_range: data.monthly_revenue_range || undefined,
    },
  });

  function onSubmit(values: BusinessInfoData) {
    updateData(values);
    setStep(2);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Business Info</h2>
        <p className="text-sm text-gray-500">Help us understand where you are in your coaching journey.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business_name">Business Name</Label>
        <Input
          id="business_name"
          {...register('business_name')}
          placeholder="e.g., Elevate Coaching Co."
        />
        {errors.business_name && (
          <p className="text-sm text-red-500">{errors.business_name.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>How long have you been coaching?</Label>
        <RadioGroup
          value={watch('years_in_business')}
          onValueChange={(v) => setValue('years_in_business', v as BusinessInfoData['years_in_business'])}
        >
          {[
            { value: 'pre_launch', label: "I'm just getting started (pre-launch)" },
            { value: 'less_than_1', label: 'Less than 1 year' },
            { value: '1_to_3', label: '1–3 years' },
            { value: '3_to_5', label: '3–5 years' },
            { value: '5_plus', label: '5+ years' },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
              <RadioGroupItem value={opt.value} id={`yrs-${opt.value}`} />
              <Label htmlFor={`yrs-${opt.value}`} className="cursor-pointer flex-1">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {errors.years_in_business && (
          <p className="text-sm text-red-500">{errors.years_in_business.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>How many active clients do you have?</Label>
        <RadioGroup
          value={watch('current_client_count')}
          onValueChange={(v) => setValue('current_client_count', v as BusinessInfoData['current_client_count'])}
        >
          {[
            { value: '0', label: 'None yet' },
            { value: '1_to_5', label: '1–5 clients' },
            { value: '6_to_20', label: '6–20 clients' },
            { value: '21_to_50', label: '21–50 clients' },
            { value: '50_plus', label: '50+ clients' },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
              <RadioGroupItem value={opt.value} id={`clients-${opt.value}`} />
              <Label htmlFor={`clients-${opt.value}`} className="cursor-pointer flex-1">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {errors.current_client_count && (
          <p className="text-sm text-red-500">{errors.current_client_count.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Monthly revenue range?</Label>
        <RadioGroup
          value={watch('monthly_revenue_range')}
          onValueChange={(v) => setValue('monthly_revenue_range', v as BusinessInfoData['monthly_revenue_range'])}
        >
          {[
            { value: 'pre_revenue', label: 'Pre-revenue' },
            { value: 'under_5k', label: 'Under $5,000' },
            { value: '5k_to_15k', label: '$5,000 – $15,000' },
            { value: '15k_to_50k', label: '$15,000 – $50,000' },
            { value: '50k_plus', label: '$50,000+' },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
              <RadioGroupItem value={opt.value} id={`rev-${opt.value}`} />
              <Label htmlFor={`rev-${opt.value}`} className="cursor-pointer flex-1">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {errors.monthly_revenue_range && (
          <p className="text-sm text-red-500">{errors.monthly_revenue_range.message}</p>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(0)}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
