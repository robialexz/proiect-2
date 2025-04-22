import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Search, FileText, Package, Users, Calendar, Settings, BarChart, Database, Folder } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  url: string;
  category: 'projects' | 'inventory' | 'reports' | 'settings' | 'users';
}

export function GlobalSearch() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulăm rezultate de căutare
  const mockResults: SearchResult[] = [
    {
      id: 'project-1',
      title: 'Proiect Renovare Apartament',
      description: 'Renovare completă apartament 3 camere',
      icon: <FileText className="h-4 w-4" />,
      url: '/projects/1',
      category: 'projects',
    },
    {
      id: 'project-2',
      title: 'Construcție Casă',
      description: 'Construcție casă P+1 cu garaj',
      icon: <FileText className="h-4 w-4" />,
      url: '/projects/2',
      category: 'projects',
    },
    {
      id: 'inventory-1',
      title: 'Ciment',
      description: '50 saci, depozit central',
      icon: <Package className="h-4 w-4" />,
      url: '/inventory?item=1',
      category: 'inventory',
    },
    {
      id: 'inventory-2',
      title: 'Cărămidă',
      description: '1000 bucăți, depozit central',
      icon: <Package className="h-4 w-4" />,
      url: '/inventory?item=2',
      category: 'inventory',
    },
    {
      id: 'report-1',
      title: 'Raport Lunar Martie 2023',
      description: 'Raport financiar lunar',
      icon: <BarChart className="h-4 w-4" />,
      url: '/reports/1',
      category: 'reports',
    },
    {
      id: 'user-1',
      title: 'Ion Popescu',
      description: 'Manager proiect',
      icon: <Users className="h-4 w-4" />,
      url: '/users/1',
      category: 'users',
    },
    {
      id: 'settings-1',
      title: 'Setări Notificări',
      description: 'Configurare notificări sistem',
      icon: <Settings className="h-4 w-4" />,
      url: '/settings/notifications',
      category: 'settings',
    },
  ];

  // Deschide dialogul de căutare cu shortcut (Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Efectuăm căutarea când se schimbă query-ul
  useEffect(() => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Simulăm o întârziere de rețea
    const timer = setTimeout(() => {
      const filtered = mockResults.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setResults(filtered);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Gestionăm selecția unui rezultat
  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    navigate(result.url);
  };

  // Grupăm rezultatele pe categorii
  const projectResults = results.filter((r) => r.category === 'projects');
  const inventoryResults = results.filter((r) => r.category === 'inventory');
  const reportResults = results.filter((r) => r.category === 'reports');
  const userResults = results.filter((r) => r.category === 'users');
  const settingsResults = results.filter((r) => r.category === 'settings');

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Caută în aplicație...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Caută proiecte, materiale, rapoarte..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          ref={inputRef}
        />
        <CommandList>
          <AnimatePresence>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6 text-center text-sm"
              >
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <p className="mt-2 text-muted-foreground">Se caută...</p>
              </motion.div>
            ) : (
              <>
                <CommandEmpty>Nu s-au găsit rezultate.</CommandEmpty>

                {projectResults.length > 0 && (
                  <CommandGroup heading="Proiecte">
                    {projectResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Folder className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.description && (
                            <span className="text-xs text-muted-foreground">{result.description}</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {inventoryResults.length > 0 && (
                  <CommandGroup heading="Inventar">
                    {inventoryResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary/10 text-secondary">
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.description && (
                            <span className="text-xs text-muted-foreground">{result.description}</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {reportResults.length > 0 && (
                  <CommandGroup heading="Rapoarte">
                    {reportResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
                          <BarChart className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.description && (
                            <span className="text-xs text-muted-foreground">{result.description}</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {userResults.length > 0 && (
                  <CommandGroup heading="Utilizatori">
                    {userResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-success/10 text-success">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.description && (
                            <span className="text-xs text-muted-foreground">{result.description}</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {settingsResults.length > 0 && (
                  <CommandGroup heading="Setări">
                    {settingsResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Settings className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.description && (
                            <span className="text-xs text-muted-foreground">{result.description}</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {searchQuery && results.length > 0 && (
                  <div className="py-2 px-2 text-xs text-muted-foreground border-t">
                    <p>
                      Apasă <kbd className="px-1 rounded bg-muted">↑</kbd>{' '}
                      <kbd className="px-1 rounded bg-muted">↓</kbd> pentru a naviga și{' '}
                      <kbd className="px-1 rounded bg-muted">Enter</kbd> pentru a selecta
                    </p>
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        </CommandList>
      </CommandDialog>
    </>
  );
}
