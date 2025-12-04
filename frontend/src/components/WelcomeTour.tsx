// Enhanced Welcome Tour Component for First-Time Users
import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '.dashboard-header',
    title: 'Welcome to IAC Dharma! 🎉',
    description: 'Let\'s take a quick 2-minute tour to help you get started with your infrastructure automation journey.',
    position: 'bottom',
  },
  {
    target: '.stat-cards',
    title: 'Monitor Key Metrics',
    description: 'Track your blueprints, deployments, risk scores, and costs at a glance with real-time updates.',
    position: 'bottom',
  },
  {
    target: '.ai-designer-button',
    title: 'AI-Powered Designer ✨',
    description: 'Use our intelligent AI to generate infrastructure architectures in seconds. Just describe what you need!',
    position: 'left',
  },
  {
    target: '.sidebar-navigation',
    title: 'Easy Navigation',
    description: 'Access all platform features from the sidebar. Use the search to quickly find what you need.',
    position: 'right',
  },
  {
    target: '.activity-feed',
    title: 'Stay Updated',
    description: 'Monitor all platform activities in real-time. Never miss important events or changes.',
    position: 'top',
  },
];

interface WelcomeTourProps {
  onComplete?: () => void;
}

export default function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const tourCompleted = localStorage.getItem('tourCompleted');
    if (!tourCompleted) {
      // Show tour after 1 second delay
      setTimeout(() => setIsVisible(true), 1000);
    } else {
      setHasSeenTour(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  const completeTour = () => {
    setIsVisible(false);
    localStorage.setItem('tourCompleted', 'true');
    setHasSeenTour(true);
    if (onComplete) onComplete();
  };

  if (hasSeenTour || !isVisible) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className=\"fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]\"
            onClick={handleSkip}
          />
        )}
      </AnimatePresence>

      {/* Tour Card */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className=\"fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md\"
          >
            <div className=\"bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden\">
              {/* Header with gradient */}
              <div className=\"relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-6 pb-8\">
                <div className=\"absolute top-0 right-0 p-4\">
                  <button
                    onClick={handleSkip}
                    className=\"p-1.5 rounded-lg hover:bg-white/20 transition-colors\"
                  >
                    <X className=\"w-5 h-5 text-white\" />
                  </button>
                </div>
                
                <div className=\"flex items-center gap-3 mb-3\">
                  <div className=\"p-2 bg-white/20 rounded-lg backdrop-blur-sm\">
                    <Sparkles className=\"w-6 h-6 text-white\" />
                  </div>
                  <h3 className=\"text-2xl font-bold text-white\">{step.title}</h3>
                </div>
                
                {/* Progress bar */}
                <div className=\"w-full bg-white/20 rounded-full h-2 mt-4\">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className=\"bg-white rounded-full h-2\"
                  />
                </div>
              </div>

              {/* Content */}
              <div className=\"p-6\">
                <p className=\"text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6\">
                  {step.description}
                </p>

                {/* Step indicators */}
                <div className=\"flex items-center justify-center gap-2 mb-6\">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? 'w-8 bg-blue-600'
                          : index < currentStep
                          ? 'w-2 bg-green-600'
                          : 'w-2 bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className=\"flex items-center justify-between gap-3\">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className=\"flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed\"
                  >
                    <ChevronLeft className=\"w-4 h-4\" />
                    <span className=\"font-medium\">Previous</span>
                  </button>

                  <div className=\"flex items-center gap-2\">
                    <button
                      onClick={handleSkip}
                      className=\"px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium\"
                    >
                      Skip Tour
                    </button>
                    <button
                      onClick={handleNext}
                      className=\"flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200\"
                    >
                      <span>{currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}</span>
                      {currentStep === tourSteps.length - 1 ? (
                        <Check className=\"w-4 h-4\" />
                      ) : (
                        <ChevronRight className=\"w-4 h-4\" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Step counter */}
                <div className=\"text-center mt-4 text-sm text-gray-500 dark:text-gray-400\">
                  Step {currentStep + 1} of {tourSteps.length}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Optional: Add a help button to restart the tour
export function TourHelpButton() {
  const [showTour, setShowTour] = useState(false);

  const restartTour = () => {
    localStorage.removeItem('tourCompleted');
    setShowTour(true);
    // Reload to restart tour
    window.location.reload();
  };

  return (
    <button
      onClick={restartTour}
      className=\"flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors\"
      title=\"Restart Product Tour\"
    >
      <Sparkles className=\"w-4 h-4\" />
      <span>Take Tour</span>
    </button>
  );
}
