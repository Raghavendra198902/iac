import { Zap, Target } from 'lucide-react';

interface ModeSwitchProps {
  currentMode: 'oneclick' | 'advanced';
  onSwitch: (mode: 'oneclick' | 'advanced') => void;
}

export function ModeSwitch({ currentMode, onSwitch }: ModeSwitchProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Switch Mode</h3>
      <p className="text-sm text-gray-600 mb-4">
        {currentMode === 'oneclick'
          ? 'Want more control over your architecture? Switch to Advanced Mode.'
          : 'Prefer a faster approach? Switch to One-Click Mode for instant generation.'}
      </p>

      <button
        onClick={() => onSwitch(currentMode === 'oneclick' ? 'advanced' : 'oneclick')}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"
      >
        {currentMode === 'oneclick' ? (
          <>
            <Target className="w-5 h-5" />
            Switch to Advanced Mode
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Switch to One-Click Mode
          </>
        )}
      </button>

      <div className="mt-4 text-xs text-gray-500">
        <p className="font-medium mb-2">
          {currentMode === 'oneclick' ? 'Advanced Mode includes:' : 'One-Click Mode includes:'}
        </p>
        <ul className="space-y-1 pl-4">
          {currentMode === 'oneclick' ? (
            <>
              <li>• Step-by-step workflow control</li>
              <li>• Interactive drag-drop design</li>
              <li>• Custom code editing</li>
              <li>• Manual compliance validation</li>
            </>
          ) : (
            <>
              <li>• 30-second setup</li>
              <li>• 6-minute generation</li>
              <li>• Complete automation</li>
              <li>• AI-powered recommendations</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
