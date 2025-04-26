import React from 'react';
import { Upload, Monitor, Activity, Sparkles } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    { icon: <Upload className="h-4 w-4" />, text: 'File uploader' },
    { icon: <Monitor className="h-4 w-4" />, text: 'SaaS landing page' },
    { icon: <Activity className="h-4 w-4" />, text: 'Habit tracker' },
    { icon: <Sparkles className="h-4 w-4" />, text: 'Confetti animation' },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4 mb-8">
      {actions.map((action, index) => (
        <button
          key={index}
          className="flex items-center space-x-2 bg-gray-900/60 hover:bg-gray-800/80 transition-all px-4 py-2 rounded-full text-gray-200 text-sm"
        >
          {action.icon}
          <span>{action.text}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;