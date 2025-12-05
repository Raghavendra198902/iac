import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Check, Save,
  Sparkles, Target, Map, Layout, Code, Shield, Calendar
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: any;
  description: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Enterprise Understanding',
    icon: Target,
    description: 'Define business goals, success criteria, and constraints'
  },
  {
    id: 2,
    title: 'Domain & Capability Mapping',
    icon: Map,
    description: 'Map business domains and identify capabilities'
  },
  {
    id: 3,
    title: 'Solution Architecture',
    icon: Layout,
    description: 'Design system components and technology stack'
  },
  {
    id: 4,
    title: 'Technical Architecture',
    icon: Code,
    description: 'Generate IaC code and database schemas'
  },
  {
    id: 5,
    title: 'Compliance Validation',
    icon: Shield,
    description: 'Validate against compliance frameworks'
  },
  {
    id: 6,
    title: 'Project Planning',
    icon: Calendar,
    description: 'Create project plan and timeline'
  }
];

export default function AdvancedMode() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1: Enterprise Understanding
  const [businessGoals, setBusinessGoals] = useState<string[]>(['']);
  const [successCriteria, setSuccessCriteria] = useState<string[]>(['']);
  const [constraints, setConstraints] = useState<string[]>(['']);
  const [compliance, setCompliance] = useState<string[]>([]);

  const complianceOptions = [
    'HIPAA', 'SOC2', 'PCI-DSS', 'GDPR', 'ISO27001', 
    'FedRAMP', 'NIST', 'CIS'
  ];

  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const updateField = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const removeField = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    console.log('Saving progress...');
    // TODO: Implement save functionality
  };

  const handleGenerate = () => {
    console.log('Generating architecture...');
    // TODO: Implement generation
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-indigo-900">AI Assistant</h3>
        </div>
        <p className="text-sm text-indigo-700">
          I can help you define your enterprise architecture. Let's start with your business goals. 
          What are you trying to achieve?
        </p>
      </div>

      {/* Business Goals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Goals *
        </label>
        {businessGoals.map((goal, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={goal}
              onChange={(e) => updateField(setBusinessGoals, index, e.target.value)}
              placeholder="e.g., Increase customer acquisition by 30%"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {businessGoals.length > 1 && (
              <button
                onClick={() => removeField(setBusinessGoals, index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => addField(setBusinessGoals)}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          + Add another goal
        </button>
      </div>

      {/* Success Criteria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Success Criteria *
        </label>
        {successCriteria.map((criteria, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={criteria}
              onChange={(e) => updateField(setSuccessCriteria, index, e.target.value)}
              placeholder="e.g., 99.9% uptime, <2s response time"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {successCriteria.length > 1 && (
              <button
                onClick={() => removeField(setSuccessCriteria, index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => addField(setSuccessCriteria)}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          + Add another criteria
        </button>
      </div>

      {/* Constraints */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Constraints
        </label>
        {constraints.map((constraint, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={constraint}
              onChange={(e) => updateField(setConstraints, index, e.target.value)}
              placeholder="e.g., Budget limit $500K, Must use AWS"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {constraints.length > 1 && (
              <button
                onClick={() => removeField(setConstraints, index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => addField(setConstraints)}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          + Add constraint
        </button>
      </div>

      {/* Compliance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Compliance Requirements
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {complianceOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                setCompliance(prev =>
                  prev.includes(option)
                    ? prev.filter(c => c !== option)
                    : [...prev, option]
                );
              }}
              className={`px-4 py-2 rounded-lg border-2 transition ${
                compliance.includes(option)
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 hover:border-indigo-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return (
          <div className="text-center py-12">
            <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Domain & Capability Mapping
            </h3>
            <p className="text-gray-500">
              Interactive canvas for mapping domains and capabilities - Coming soon
            </p>
          </div>
        );
      case 3:
        return (
          <div className="text-center py-12">
            <Layout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Solution Architecture Design
            </h3>
            <p className="text-gray-500">
              Component designer with drag-drop functionality - Coming soon
            </p>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Technical Architecture
            </h3>
            <p className="text-gray-500">
              Code editor for IaC and schemas - Coming soon
            </p>
          </div>
        );
      case 5:
        return (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Compliance Validation
            </h3>
            <p className="text-gray-500">
              Real-time compliance checker - Coming soon
            </p>
          </div>
        );
      case 6:
        return (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Project Planning
            </h3>
            <p className="text-gray-500">
              Interactive Gantt chart and task breakdown - Coming soon
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/ai')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Advanced Mode</h1>
                <p className="text-sm text-gray-600">Step-by-step architecture design with full control</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Progress
              </button>
              <button
                onClick={handleGenerate}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = completedSteps.includes(step.id);

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition ${
                      isActive
                        ? 'bg-indigo-50'
                        : isCompleted
                        ? 'hover:bg-gray-50'
                        : 'opacity-50'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-100 text-green-600'
                          : isActive
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium text-center ${
                        isActive
                          ? 'text-indigo-600'
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        completedSteps.includes(step.id)
                          ? 'bg-green-300'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-gray-600">{STEPS[currentStep - 1].description}</p>
          </div>

          {renderStepContent()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep} of {STEPS.length}
            </div>

            <button
              onClick={handleNext}
              disabled={currentStep === STEPS.length}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
