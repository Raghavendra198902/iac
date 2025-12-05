# Low-Level Design: Frontend UI v3.0 (Next.js 15)

## 1. Overview

**Framework**: Next.js 15 + React 19 + TypeScript  
**UI Library**: Tailwind CSS + shadcn/ui + Radix UI  
**State Management**: Zustand + React Query  
**Real-time**: GraphQL Subscriptions + WebSocket  
**Port**: 3001

**User-Friendly Design Principles:**
- **Intuitive Navigation**: Clear, consistent menu structure
- **Accessibility First**: WCAG 2.1 AAA compliant
- **Responsive Design**: Mobile, tablet, desktop optimized
- **Dark Mode Support**: Automatic theme switching
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Friendly**: Semantic HTML + ARIA labels
- **Progressive Disclosure**: Show complexity only when needed
- **Instant Feedback**: Loading states, success/error messages
- **Undo/Redo**: Reversible actions for confidence
- **Contextual Help**: Inline tooltips and guided tours

## 2. User Experience Enhancements

### 2.1 Onboarding & First-Time User Experience

```typescript
// src/features/onboarding/OnboardingWizard.tsx

'use client';

import { useState } from 'react';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to IAC Dharma',
    description: 'Manage your entire infrastructure from one place',
    content: 'WelcomeStep',
  },
  {
    title: 'Connect Your Cloud',
    description: 'Link AWS, GCP, Azure, or on-premise infrastructure',
    content: 'CloudConnectionStep',
  },
  {
    title: 'Set Up Monitoring',
    description: 'Get alerts and insights automatically',
    content: 'MonitoringStep',
  },
  {
    title: 'You\'re All Set!',
    description: 'Start managing your infrastructure',
    content: 'CompletionStep',
  },
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  
  const handleNext = () => {
    setCompletedSteps([...completedSteps, currentStep]);
    setCurrentStep(Math.min(currentStep + 1, ONBOARDING_STEPS.length - 1));
  };
  
  const handleBack = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };
  
  const handleSkip = () => {
    // Save preference and close
    localStorage.setItem('onboarding_skipped', 'true');
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-purple-600'
                  : completedSteps.includes(index)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
              aria-label={`Step ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Current Step Content */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {ONBOARDING_STEPS[currentStep].title}
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            {ONBOARDING_STEPS[currentStep].description}
          </p>
          
          {/* Dynamic step content would go here */}
          <StepContent step={currentStep} />
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-500"
          >
            Skip for now
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### 2.2 Intuitive Dashboard with Quick Actions

```typescript
// src/features/dashboard/QuickActionsDashboard.tsx

'use client';

import { 
  Plus, 
  Upload, 
  Search, 
  Settings, 
  HelpCircle,
  Sparkles,
  BarChart3,
  Shield,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function QuickActionsDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Hero Search Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">
          What would you like to do today?
        </h1>
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Try: 'Create 3 AWS instances' or 'Show me cost breakdown'..."
            className="pl-10 pr-12 py-6 text-lg bg-white text-gray-900"
          />
          <Button
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-purple-100 mt-3">
          Use natural language to manage your infrastructure
        </p>
      </div>
      
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          icon={<Plus className="w-6 h-6" />}
          title="Create Infrastructure"
          description="Deploy new resources"
          color="blue"
          onClick={() => {}}
        />
        
        <QuickActionCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="View Analytics"
          description="Monitor performance"
          color="green"
          onClick={() => {}}
        />
        
        <QuickActionCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Cost Optimization"
          description="Reduce spending"
          color="yellow"
          onClick={() => {}}
        />
        
        <QuickActionCard
          icon={<Shield className="w-6 h-6" />}
          title="Security Scan"
          description="Check vulnerabilities"
          color="red"
          onClick={() => {}}
        />
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ActivityItem
              action="Created"
              resource="AWS EC2 Instance (i-abc123)"
              time="2 minutes ago"
              status="success"
            />
            <ActivityItem
              action="Updated"
              resource="Kubernetes Deployment (api-service)"
              time="15 minutes ago"
              status="success"
            />
            <ActivityItem
              action="Failed"
              resource="Database Backup (prod-db)"
              time="1 hour ago"
              status="error"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Help & Resources */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-purple-600 hover:bg-purple-700"
          onClick={() => {}}
        >
          <HelpCircle className="w-5 h-5 mr-2" />
          Need Help?
        </Button>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, color, onClick }: any) {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    red: 'bg-red-500 hover:bg-red-600',
  };
  
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-white mb-4`}>
          {icon}
        </div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}
```

### 2.3 Simplified Navigation with Breadcrumbs

```typescript
// src/components/navigation/SimplifiedNav.tsx

'use client';

import { Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SimplifiedNav() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  
  return (
    <div className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-6">
        {/* Main Navigation */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              IAC Dharma
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <NavLink href="/dashboard" active>Dashboard</NavLink>
              <NavLink href="/infrastructure">Infrastructure</NavLink>
              <NavLink href="/deployments">Deployments</NavLink>
              <NavLink href="/monitoring">Monitoring</NavLink>
              <NavLink href="/costs">Costs</NavLink>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <UserMenu />
          </div>
        </div>
        
        {/* Breadcrumbs */}
        {segments.length > 0 && (
          <div className="flex items-center gap-2 py-3 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <Home className="w-4 h-4" />
            </Link>
            {segments.map((segment, index) => (
              <div key={segment} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link
                  href={`/${segments.slice(0, index + 1).join('/')}`}
                  className={`${
                    index === segments.length - 1
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  } capitalize`}
                >
                  {segment.replace(/-/g, ' ')}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NavLink({ href, children, active }: any) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        active
          ? 'text-purple-600 border-b-2 border-purple-600'
          : 'text-gray-600 hover:text-gray-900'
      } pb-1`}
    >
      {children}
    </Link>
  );
}
```

### 2.4 Accessibility Features

```typescript
// src/components/accessibility/AccessibilityProvider.tsx

'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
  screenReaderMode: boolean;
}

const AccessibilityContext = createContext<any>(null);

export function AccessibilityProvider({ children }: any) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    fontSize: 'medium',
    reduceMotion: false,
    screenReaderMode: false,
  });
  
  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('accessibility_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    
    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setSettings(prev => ({ ...prev, reduceMotion: true }));
    }
  }, []);
  
  useEffect(() => {
    // Apply settings to document
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    
    // Save preferences
    localStorage.setItem('accessibility_settings', JSON.stringify(settings));
  }, [settings]);
  
  return (
    <AccessibilityContext.Provider value={{ settings, setSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// Accessibility Settings Panel
export function AccessibilitySettings() {
  const { settings, setSettings } = useContext(AccessibilityContext);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessibility Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">High Contrast</label>
          <Switch
            checked={settings.highContrast}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, highContrast: checked })
            }
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Font Size</label>
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <Button
                key={size}
                variant={settings.fontSize === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSettings({ ...settings, fontSize: size })}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Reduce Motion</label>
          <Switch
            checked={settings.reduceMotion}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, reduceMotion: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2.5 Contextual Help & Tooltips

```typescript
// src/components/help/ContextualHelp.tsx

'use client';

import { HelpCircle, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function HelpTooltip({ title, content, learnMoreUrl }: any) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-full hover:bg-gray-100"
        >
          <HelpCircle className="w-4 h-4 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-gray-600">{content}</p>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              className="text-sm text-purple-600 hover:underline inline-flex items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more →
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Guided Tour
export function GuidedTour() {
  const [step, setStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const tours = [
    {
      target: '[data-tour="search"]',
      title: 'AI-Powered Search',
      content: 'Use natural language to find and manage your infrastructure',
    },
    {
      target: '[data-tour="create"]',
      title: 'Quick Create',
      content: 'Deploy new resources with just a few clicks',
    },
    // More tour steps...
  ];
  
  if (!isActive) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">{tours[step].title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Step {step + 1} of {tours.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsActive(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-gray-700 mb-4">{tours[step].content}</p>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (step === tours.length - 1) {
                  setIsActive(false);
                } else {
                  setStep(step + 1);
                }
              }}
            >
              {step === tours.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Next.js 15 Frontend (Port 3001)            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ App Router   │  │ Server       │  │ AI Chat     │ │
│  │ (Pages)      │  │ Components   │  │ Interface   │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│         ↓                  ↓                 ↓         │
│  ┌─────────────────────────────────────────────────┐  │
│  │   State Management (Zustand + React Query)      │  │
│  └─────────────────────────────────────────────────┘  │
│         ↓                  ↓                 ↓         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ GraphQL      │  │ REST API     │  │ WebSocket   │ │
│  │ Client       │  │ Client       │  │ Client      │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 3. New Features (v3.0)

### 3.1 AI-Powered Command Interface

Natural language infrastructure commands powered by GPT-4:

```typescript
// src/features/ai-command/AICommandInterface.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AICommandResponse {
  interpretation: string;
  actions: Array<{
    type: string;
    description: string;
    parameters: Record<string, any>;
  }>;
  confirmation_required: boolean;
}

export function AICommandInterface() {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState<AICommandResponse | null>(null);
  
  const interpretMutation = useMutation({
    mutationFn: async (command: string) => {
      const res = await fetch('/api/v3/ai/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResponse(data);
    },
  });
  
  const executeMutation = useMutation({
    mutationFn: async (actions: any[]) => {
      const res = await fetch('/api/v3/ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions }),
      });
      return res.json();
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    interpretMutation.mutate(command);
  };
  
  const handleExecute = () => {
    if (response?.actions) {
      executeMutation.mutate(response.actions);
      setResponse(null);
      setCommand('');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          AI Command Interface
        </h2>
        <p className="text-gray-600 mt-2">
          Describe what you want in plain English
        </p>
      </div>
      
      {/* Command Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Example: Create 3 AWS EC2 instances in us-east-1 with 8GB RAM and deploy my API service..."
            className="min-h-[120px] pr-12 text-base"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute bottom-3 right-3"
            disabled={!command.trim() || interpretMutation.isPending}
          >
            {interpretMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
      
      {/* AI Interpretation */}
      {response && (
        <Card className="p-6 mb-6 border-2 border-purple-200">
          <h3 className="font-semibold text-lg mb-3">
            AI Interpretation
          </h3>
          <p className="text-gray-700 mb-4">{response.interpretation}</p>
          
          <div className="space-y-3">
            <h4 className="font-medium">Planned Actions:</h4>
            {response.actions.map((action, index) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded-lg border"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{action.type}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {action.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {JSON.stringify(action.parameters, null, 2)}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleExecute}
              disabled={executeMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {executeMutation.isPending ? 'Executing...' : 'Execute Actions'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setResponse(null)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}
      
      {/* Examples */}
      <div className="mt-8">
        <h3 className="font-semibold mb-3">Example Commands:</h3>
        <div className="grid gap-2">
          {EXAMPLE_COMMANDS.map((example, index) => (
            <button
              key={index}
              onClick={() => setCommand(example)}
              className="text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors text-sm"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const EXAMPLE_COMMANDS = [
  'Create a Kubernetes cluster on GCP with 5 nodes and autoscaling enabled',
  'Scale my production API deployment to 10 replicas',
  'Show me all resources consuming more than $100/month',
  'Create a staging environment identical to production but with smaller instances',
  'Set up monitoring alerts for CPU usage above 80% on all services',
];
```

### 3.2 Real-time Predictive Analytics Dashboard

```typescript
// src/features/analytics/PredictiveDashboard.tsx

'use client';

import { useSubscription } from '@apollo/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PREDICTIONS_SUBSCRIPTION = gql`
  subscription OnPredictions($serviceName: String) {
    predictions(serviceName: $serviceName) {
      id
      predictionType
      probability
      confidence
      predictedTime
      severity
      affectedComponents
      recommendedActions
    }
  }
`;

export function PredictiveDashboard() {
  const { data, loading } = useSubscription(PREDICTIONS_SUBSCRIPTION);
  
  const predictions = data?.predictions || [];
  const criticalPredictions = predictions.filter(
    p => p.severity === 'critical' || p.severity === 'high'
  );
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Predictions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{predictions.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              +12% from last hour
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {criticalPredictions.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Auto-Remediation Rate
            </CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              87%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Success rate this week
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Predictions Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Failure Prediction Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="predictedTime" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="probability"
                stroke="#8b5cf6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Critical Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalPredictions.map((prediction) => (
              <div
                key={prediction.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">
                      {prediction.predictionType}
                    </span>
                    <Badge variant={
                      prediction.severity === 'critical' ? 'destructive' : 'warning'
                    }>
                      {prediction.severity}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {prediction.probability * 100}% probability
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Affected: {prediction.affectedComponents.join(', ')}
                  </div>
                  <div className="text-xs text-gray-500">
                    Recommended: {prediction.recommendedActions.join(', ')}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3.3 Interactive Infrastructure Canvas

Drag-and-drop infrastructure designer with real-time collaboration:

```typescript
// src/features/canvas/InfrastructureCanvas.tsx

'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from './nodes/CustomNode';
import { Sidebar } from './Sidebar';
import { useInfrastructureStore } from '@/stores/infrastructureStore';

const nodeTypes = {
  custom: CustomNode,
};

export function InfrastructureCanvas() {
  const { infrastructure, updateInfrastructure } = useInfrastructureStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(infrastructure.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(infrastructure.edges);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      const type = event.dataTransfer.getData('application/reactflow');
      const position = {
        x: event.clientX,
        y: event.clientY,
      };
      
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: type,
          type,
          config: {},
        },
      };
      
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );
  
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const handleDeploy = async () => {
    const infrastructure = {
      nodes,
      edges,
    };
    
    await updateInfrastructure(infrastructure);
  };
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        
        <div className="absolute top-4 right-4 flex gap-2">
          <Button onClick={handleDeploy} size="lg">
            Deploy Infrastructure
          </Button>
          <Button variant="outline" size="lg">
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );
}

// Custom Node Component
// src/features/canvas/nodes/CustomNode.tsx

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Server, Database, Globe, Box } from 'lucide-react';

const iconMap = {
  compute: Server,
  database: Database,
  loadbalancer: Globe,
  storage: Box,
};

export const CustomNode = memo(({ data }: any) => {
  const Icon = iconMap[data.type as keyof typeof iconMap] || Server;
  
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 transition-colors">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-blue-600" />
        <div>
          <div className="font-bold text-sm">{data.label}</div>
          <div className="text-xs text-gray-500">{data.type}</div>
        </div>
      </div>
      
      {data.status && (
        <div className="mt-2 text-xs">
          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
            data.status === 'running' ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          {data.status}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
```

### 3.4 Cost Optimization Dashboard

```typescript
// src/features/cost/CostOptimizationDashboard.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { DollarSign, TrendingDown, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CostOptimizationDashboard() {
  const { data: costData } = useQuery({
    queryKey: ['cost-analysis'],
    queryFn: async () => {
      const res = await fetch('/api/v3/cost/analysis');
      return res.json();
    },
  });
  
  const { data: recommendations } = useQuery({
    queryKey: ['cost-recommendations'],
    queryFn: async () => {
      const res = await fetch('/api/v3/cost/recommendations');
      return res.json();
    },
  });
  
  return (
    <div className="space-y-6">
      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Current Spend
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${costData?.currentMonth.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Projected Spend
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              ${costData?.projected.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              End of month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Potential Savings
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${costData?.potentialSavings.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Per month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Optimization Score
            </CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {costData?.optimizationScore}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Room for improvement
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={300}>
              <Pie
                data={costData?.byService}
                cx={200}
                cy={150}
                labelLine={false}
                label
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {costData?.byService.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cost by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={400} height={300} data={costData?.byProvider}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cost" fill="#8b5cf6" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Cost Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations?.map((rec: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <Lightbulb className="w-5 h-5 text-yellow-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{rec.title}</span>
                    <Badge variant="outline">
                      Save ${rec.monthlySavings}/mo
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {rec.description}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">Apply Recommendation</Button>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
```

## 4. State Management

### 4.1 Zustand Stores

```typescript
// src/stores/infrastructureStore.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface InfrastructureState {
  infrastructures: Infrastructure[];
  selectedInfrastructure: Infrastructure | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchInfrastructures: () => Promise<void>;
  selectInfrastructure: (id: string) => void;
  createInfrastructure: (data: CreateInfrastructureInput) => Promise<void>;
  updateInfrastructure: (id: string, data: UpdateInfrastructureInput) => Promise<void>;
  deleteInfrastructure: (id: string) => Promise<void>;
}

export const useInfrastructureStore = create<InfrastructureState>()(
  devtools(
    persist(
      (set, get) => ({
        infrastructures: [],
        selectedInfrastructure: null,
        loading: false,
        error: null,
        
        fetchInfrastructures: async () => {
          set({ loading: true, error: null });
          try {
            const res = await fetch('/api/v3/infrastructures');
            const data = await res.json();
            set({ infrastructures: data, loading: false });
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },
        
        selectInfrastructure: (id: string) => {
          const infra = get().infrastructures.find(i => i.id === id);
          set({ selectedInfrastructure: infra || null });
        },
        
        createInfrastructure: async (data) => {
          set({ loading: true });
          try {
            const res = await fetch('/api/v3/infrastructures', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            const newInfra = await res.json();
            set(state => ({
              infrastructures: [...state.infrastructures, newInfra],
              loading: false,
            }));
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },
        
        // ... other actions
      }),
      {
        name: 'infrastructure-storage',
      }
    )
  )
);
```

## 5. API Integration

### 5.1 GraphQL Client Setup

```typescript
// src/lib/apollo-client.ts

import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  credentials: 'include',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

### 5.2 React Query Setup

```typescript
// src/lib/react-query.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

## 6. Performance Optimizations

### 6.1 Server Components

```typescript
// app/dashboard/page.tsx

import { Suspense } from 'react';
import { InfrastructureList } from '@/components/InfrastructureList';
import { MetricsOverview } from '@/components/MetricsOverview';
import { Skeleton } from '@/components/ui/skeleton';

// Server Component - No client-side JavaScript
export default async function DashboardPage() {
  // Fetch data on server
  const infrastructures = await fetchInfrastructures();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <MetricsOverview />
      </Suspense>
      
      <Suspense fallback={<Skeleton className="h-[600px]" />}>
        <InfrastructureList infrastructures={infrastructures} />
      </Suspense>
    </div>
  );
}
```

### 6.2 Image Optimization

```typescript
// next.config.js

module.exports = {
  images: {
    domains: ['cdn.iacdharma.io'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};
```

## 7. Testing

### 7.1 Component Tests

```typescript
// src/features/ai-command/__tests__/AICommandInterface.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AICommandInterface } from '../AICommandInterface';
import { queryClient } from '@/lib/react-query';

describe('AICommandInterface', () => {
  it('renders command input', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AICommandInterface />
      </QueryClientProvider>
    );
    
    expect(screen.getByPlaceholderText(/Example:/)).toBeInTheDocument();
  });
  
  it('submits command and shows interpretation', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AICommandInterface />
      </QueryClientProvider>
    );
    
    const input = screen.getByPlaceholderText(/Example:/);
    const button = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, {
      target: { value: 'Create 3 AWS instances' },
    });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/AI Interpretation/)).toBeInTheDocument();
    });
  });
});
```

---

## 7. User-Friendly Features Summary

### 7.1 Ease of Use
- **Onboarding Wizard**: Step-by-step setup for new users
- **Quick Actions Dashboard**: One-click access to common tasks
- **Natural Language Interface**: Speak or type commands in plain English
- **Smart Suggestions**: Context-aware autocomplete and recommendations
- **Command History**: Quick access to recent commands
- **Undo/Redo**: Reversible actions for user confidence

### 7.2 Accessibility (WCAG 2.1 AAA)
- **Keyboard Navigation**: Full keyboard support with shortcuts
- **Screen Reader Support**: Semantic HTML + ARIA labels
- **High Contrast Mode**: Better visibility for visual impairments
- **Adjustable Font Size**: Small, medium, large options
- **Reduced Motion**: Respects user preferences
- **Focus Indicators**: Clear visual focus states

### 7.3 Mobile & Responsive
- **Mobile-First Design**: Optimized for all screen sizes
- **Touch-Friendly**: 44px minimum touch targets (iOS guidelines)
- **Swipe Gestures**: Natural mobile interactions
- **Hamburger Menu**: Clean mobile navigation
- **Responsive Grid**: Adapts to screen size automatically
- **Fast Loading**: Optimized images and code splitting

### 7.4 Contextual Help
- **Inline Tooltips**: Help text next to complex features
- **Guided Tours**: Interactive walkthroughs for new features
- **Example Commands**: Pre-filled templates to get started
- **Learn More Links**: Detailed documentation when needed
- **Video Tutorials**: Visual learning resources
- **Search Help**: Searchable knowledge base

### 7.5 User Feedback
- **Toast Notifications**: Success, error, info messages
- **Loading States**: Clear progress indicators
- **Error Messages**: Human-readable error explanations
- **Confirmation Dialogs**: Prevent accidental actions
- **Success Animations**: Positive reinforcement
- **Progress Bars**: Show task completion status

### 7.6 Visual Design
- **Consistent UI**: Uniform design language throughout
- **Color Coding**: Intuitive status colors (green=success, red=error, etc.)
- **Icons**: Visual cues for faster recognition
- **White Space**: Clean, uncluttered interface
- **Dark Mode**: Automatic or manual theme switching
- **Beautiful Typography**: Readable fonts and sizes

### 7.7 Performance
- **Instant Feedback**: <100ms response for UI interactions
- **Skeleton Screens**: Show content structure while loading
- **Lazy Loading**: Load components only when needed
- **Caching**: Smart caching for faster repeated access
- **Optimistic Updates**: Show changes immediately
- **Background Sync**: Non-blocking data updates

---

**Document Version**: 1.1  
**Last Updated**: December 5, 2025  
**Status**: Enhanced for User-Friendliness
