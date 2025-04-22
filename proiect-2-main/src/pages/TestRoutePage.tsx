import React from 'react';

const TestRoutePage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Test Route Page</h1>
        <p className="text-xl">This is a test page to verify routing is working correctly.</p>
      </div>
    </div>
  );
};

export default TestRoutePage;
