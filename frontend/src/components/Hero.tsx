import React from 'react';
import { Ghost } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="text-center py-16 max-w-3xl mx-auto">
      <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center">
        Learn anything <Ghost className="h-8 w-8 mx-2 text-purple-500" /> Ghost Guide
      </h1>
      <p className="text-gray-300 text-lg md:text-xl">
        Skip the tutorials, automate the learning process directly on top of your desktop
      </p>
    </div>
  );
};

export default Hero;