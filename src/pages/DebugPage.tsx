import React from 'react';
import { DatabaseChecker } from '@/components/debug/DatabaseChecker';

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Tools</h1>
      <div className="grid gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          <DatabaseChecker />
        </div>
      </div>
    </div>
  );
}

