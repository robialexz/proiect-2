import React from 'react';

interface DocumentCollaborationProps {
  projectId?: string | null;
  className?: string;
}

const DocumentCollaboration: React.FC<DocumentCollaborationProps> = ({ projectId, className }) => {
  return (
    <div className="container mx-auto py-6">
      <h1>Document Collaboration</h1>
      <p>This feature is coming soon.</p>
    </div>
  );
};

export default DocumentCollaboration;
