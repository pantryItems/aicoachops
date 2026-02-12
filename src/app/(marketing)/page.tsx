import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Clock, DollarSign, CheckCircle2, ArrowRight, ClipboardList, Bot, Rocket } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-bold">AI CoachOps</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Sign In
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Your Coaching Business.
          <br />
          <span className="text-blue-600">Fully Automated. In Minutes.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          AI CoachOps builds your entire CRM, pipelines, and automations in Go High Level
          — so you can focus on coaching, not tech.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-3">Beta — free during early access</p>
      </section>

      {/* Pain Points */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">Sound Familiar?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                text: 'Bought GHL but never set it up?',
                detail: "You know it's powerful, but the setup is overwhelming.",
              },
              {
                icon: DollarSign,
                text: 'Agencies want $2,000+ to configure it?',
                detail: "Done-for-you setup is expensive — especially when you're just starting.",
              },
              {
                icon: Zap,
                text: 'Spending hours watching tutorials?',
                detail: "YouTube can only take you so far when you don't know what you need.",
              },
            ].map((pain, i) => (
              <Card key={i}>
                <CardContent className="pt-6 text-center">
                  <pain.icon className="h-8 w-8 text-red-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{pain.text}</h3>
                  <p className="text-sm text-gray-500">{pain.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ClipboardList,
                step: '1',
                title: 'Tell Us About Your Business',
                detail: '5-minute guided questionnaire about your coaching model, services, and client journey.',
              },
              {
                icon: Bot,
                step: '2',
                title: 'AI Builds Your CRM',
                detail: 'Our AI analyzes your answers and configures custom pipelines, tags, automations, and templates.',
              },
              {
                icon: Rocket,
                step: '3',
                title: 'Start Coaching',
                detail: 'Your GHL is ready to go. Leads flow in, follow-ups happen automatically, clients onboard smoothly.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">What You Get</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              'Custom lead pipeline built for coaching',
              'Automated follow-up sequences',
              'Booking calendars configured',
              'Niche-specific tags and custom fields',
              'Email templates in your voice',
              'Client onboarding workflow',
              'No-show recovery automation',
              'Nurture campaigns for cold leads',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stop Wrestling with Tech.
            <br />
            Start Coaching.
          </h2>
          <p className="text-gray-600 mb-8">
            Join our beta and get your CRM configured for free.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <span>AI CoachOps</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
