import React, { useState } from 'react';

interface CloudProvider {
  id: 'aws' | 'azure' | 'gcp';
  name: string;
  icon: string;
  color: string;
}

const providers: CloudProvider[] = [
  { id: 'aws', name: 'Amazon Web Services', icon: '☁️', color: 'bg-orange-500' },
  { id: 'azure', name: 'Microsoft Azure', icon: '🔷', color: 'bg-blue-500' },
  { id: 'gcp', name: 'Google Cloud Platform', icon: '🌐', color: 'bg-green-500' }
];

interface CloudProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  multiSelect?: boolean;
}

export const CloudProviderSelector: React.FC<CloudProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  multiSelect = false
}) => {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([selectedProvider]);

  const handleProviderClick = (providerId: string) => {
    if (multiSelect) {
      const newSelection = selectedProviders.includes(providerId)
        ? selectedProviders.filter(p => p !== providerId)
        : [...selectedProviders, providerId];
      setSelectedProviders(newSelection);
    } else {
      onProviderChange(providerId);
    }
  };

  const isSelected = (providerId: string) => {
    return multiSelect ? selectedProviders.includes(providerId) : selectedProvider === providerId;
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Cloud Provider{multiSelect ? 's' : ''}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleProviderClick(provider.id)}
            className={`
              relative p-6 rounded-lg border-2 transition-all duration-200
              ${isSelected(provider.id)
                ? `${provider.color} border-transparent text-white shadow-lg scale-105`
                : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
              }
            `}
          >
            <div className="flex flex-col items-center space-y-2">
              <span className="text-4xl">{provider.icon}</span>
              <span className="text-sm font-semibold text-center">
                {provider.name}
              </span>
              {isSelected(provider.id) && (
                <span className="absolute top-2 right-2 text-white">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
      {multiSelect && selectedProviders.length > 0 && (
        <div className="text-sm text-gray-600">
          Selected: {selectedProviders.map(p => 
            providers.find(pr => pr.id === p)?.name
          ).join(', ')}
        </div>
      )}
    </div>
  );
};
