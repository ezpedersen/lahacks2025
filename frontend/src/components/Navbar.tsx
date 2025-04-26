import React from 'react';
import { Ghost } from 'lucide-react';

interface NavbarProps {
  onToggleTransparency?: () => Promise<void>;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleTransparency }) => {
  return (
    <nav className="w-full py-3 px-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-purple-500 to-blue-400 p-1 rounded">
            <Ghost className="h-5 w-5 text-white" />
          </div>
          <span className="text-white text-xl font-bold">Ghost Guide</span>
        </div>

        <div className="flex space-x-3 items-center">
          <button className="px-4 py-1.5 text-sm text-white rounded-md border border-gray-700 hover:bg-gray-800 transition-colors">
            Sign in
          </button>
          <button className="px-4 py-1.5 text-sm text-gray-900 bg-white rounded-md hover:bg-gray-100 transition-colors">
            Sign up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;