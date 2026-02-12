'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Star } from 'lucide-react';

interface FeedbackSurveyProps {
  coachId: string;
  buildId: string;
}

export function FeedbackSurvey({ coachId, buildId }: FeedbackSurveyProps) {
  const [wouldPay, setWouldPay] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [whatWouldChange, setWhatWouldChange] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wouldPay) return;
    setLoading(true);

    const supabase = createClient();
    await supabase.from('feedback').insert({
      coach_id: coachId,
      build_id: buildId,
      would_pay: wouldPay,
      price_range: priceRange || null,
      what_would_change: whatWouldChange || null,
      overall_rating: rating || null,
    });

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-1">Thank You!</h3>
          <p className="text-sm text-gray-600">Your feedback helps us build a better product.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Feedback</CardTitle>
        <CardDescription>Help us validate this product — takes 30 seconds.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>How was your experience? (1-5)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-7 w-7 ${
                      n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Would You Pay */}
          <div className="space-y-3">
            <Label>Would you pay for this if it were fully functional?</Label>
            <RadioGroup value={wouldPay} onValueChange={setWouldPay}>
              {[
                { value: 'yes', label: 'Yes, absolutely' },
                { value: 'maybe', label: 'Maybe, with some changes' },
                { value: 'no', label: 'No' },
              ].map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-gray-50">
                  <RadioGroupItem value={opt.value} id={`pay-${opt.value}`} />
                  <Label htmlFor={`pay-${opt.value}`} className="cursor-pointer flex-1">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Price Range (show if yes or maybe) */}
          {(wouldPay === 'yes' || wouldPay === 'maybe') && (
            <div className="space-y-3">
              <Label>How much would you pay per month?</Label>
              <RadioGroup value={priceRange} onValueChange={setPriceRange}>
                {[
                  { value: '$49/mo', label: '$49/month' },
                  { value: '$99/mo', label: '$99/month' },
                  { value: '$199/mo', label: '$199/month' },
                  { value: '$299/mo', label: '$299/month' },
                ].map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-gray-50">
                    <RadioGroupItem value={opt.value} id={`price-${opt.value}`} />
                    <Label htmlFor={`price-${opt.value}`} className="cursor-pointer flex-1">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* What Would You Change */}
          <div className="space-y-2">
            <Label htmlFor="change">What would you change or add?</Label>
            <Textarea
              id="change"
              value={whatWouldChange}
              onChange={(e) => setWhatWouldChange(e.target.value)}
              placeholder="Anything — be honest, it helps us build something better."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !wouldPay}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
