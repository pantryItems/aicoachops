'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizard } from './wizard-provider';
import { servicesPricingSchema, type ServicesPricingData } from '@/types/intake';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

export function StepServicesPricing() {
  const { data, updateData, setStep } = useWizard();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ServicesPricingData>({
    resolver: zodResolver(servicesPricingSchema),
    defaultValues: {
      services: data.services?.length ? data.services : [{ name: '', price: '', duration: '', type: '1on1' as const }],
      uses_packages: data.uses_packages ?? false,
      payment_structure: data.payment_structure || ('' as ServicesPricingData['payment_structure']),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'services' });

  function onSubmit(values: ServicesPricingData) {
    updateData(values);
    setStep(4);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Services & Pricing</h2>
        <p className="text-sm text-gray-500">What do you offer and how do clients pay?</p>
      </div>

      <div className="space-y-4">
        <Label>Your Coaching Services</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Service {index + 1}</span>
              {fields.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  {...register(`services.${index}.name`)}
                  placeholder="Service name"
                />
              </div>
              <div>
                <Input
                  {...register(`services.${index}.price`)}
                  placeholder="Price (e.g., $200)"
                />
              </div>
              <div>
                <Input
                  {...register(`services.${index}.duration`)}
                  placeholder="Duration (e.g., 60 min)"
                />
              </div>
              <div>
                <select
                  {...register(`services.${index}.type`)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="1on1">1-on-1</option>
                  <option value="group">Group</option>
                  <option value="course">Course</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: '', price: '', duration: '', type: '1on1' })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Service
        </Button>
        {errors.services && (
          <p className="text-sm text-red-500">
            {errors.services.message || 'Please fill in all service fields'}
          </p>
        )}
      </div>

      <Controller
        control={control}
        name="uses_packages"
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id="uses_packages"
              checked={field.value ?? false}
              onCheckedChange={(v) => field.onChange(Boolean(v))}
            />
            <Label htmlFor="uses_packages">I offer packages or bundles</Label>
          </div>
        )}
      />

      <div className="space-y-3">
        <Label>How do clients typically pay?</Label>
        <Controller
          control={control}
          name="payment_structure"
          render={({ field }) => (
            <RadioGroup value={field.value ?? ''} onValueChange={field.onChange}>
              {[
                { value: 'per_session', label: 'Per session' },
                { value: 'monthly', label: 'Monthly retainer' },
                { value: 'package', label: 'Upfront package' },
                { value: 'mix', label: 'Mix of the above' },
              ].map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                  <RadioGroupItem value={opt.value} id={`pay-${opt.value}`} />
                  <Label htmlFor={`pay-${opt.value}`} className="cursor-pointer flex-1">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
        {errors.payment_structure && (
          <p className="text-sm text-red-500">{errors.payment_structure.message}</p>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
