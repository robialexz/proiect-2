import fs from 'fs';
import path from 'path';

// Lista de pagini de generat
const pages = [
  'EditProfilePage',
  'ChangePasswordPage',
  'VerifyEmailPage',
  'PreferencesPage',
  'InventoryListPage',
  'ItemDetailPage',
  'CreateItemPage',
  'CategoryManagementPage',
  'ImportExportPage',
  'NotificationsPage',
  'UsersManagementPage',
  'AuditLogsPage',
  'AIInventoryAssistantPage',
  'ForecastPage',
  'ScanPage'
];

// Template pentru fiecare pagină stub
const stubComponent = name => `import React from 'react';

const ${name}: React.FC = () => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold">
      ${name.replace(/Page$/, '').replace(/([A-Z])/g, ' $1').trim()}
    </h1>
    <p>Under construction...</p>
  </div>
);

export default ${name};
`;

// Generare fișiere în src/pages
const pagesDir = path.resolve(process.cwd(), 'src/pages');
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

pages.forEach(name => {
  const filePath = path.join(pagesDir, `${name}.tsx`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, stubComponent(name), 'utf8');
    console.log('Created', filePath);
  }
});
