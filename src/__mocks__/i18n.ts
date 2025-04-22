// Mock for i18n
const i18n = {
  language: 'ro',
  changeLanguage: jest.fn(),
  t: (key: string) => key,
  exists: jest.fn().mockReturnValue(true),
};

export default i18n;
