
import React from 'react';
import { PillIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <div className="text-blue-600">
            <PillIcon className="h-8 w-8" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 ml-3">
          Pharma Intelligence & Strategy Agent
        </h1>
      </div>
    </header>
  );
};

export default Header;
