import React from 'react';
import { SplineSceneBasic } from '@/components/ui/spline-scene-demo';

const SplineDemo: React.FC = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Spline 3D Demo</h1>
      <div className="max-w-5xl mx-auto">
        <SplineSceneBasic />
      </div>
      <div className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">About This Component</h2>
        <p className="mb-4">
          This demo showcases the integration of Spline 3D scenes into your React application.
          Spline allows you to create and embed interactive 3D experiences directly in your web projects.
        </p>
        <h3 className="text-xl font-semibold mt-6 mb-2">Features</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Lazy-loaded 3D content for optimal performance</li>
          <li>Responsive design that works on all screen sizes</li>
          <li>Interactive spotlight effect that follows cursor movement</li>
          <li>Seamless integration with your existing UI components</li>
        </ul>
      </div>
    </div>
  );
};

export default SplineDemo;
