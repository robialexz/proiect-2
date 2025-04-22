import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, FileDown, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Definim tipul pentru materialele din inventar
type Material = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  location: string;
};

// Date de exemplu pentru inventar
const sampleMaterials: Material[] = Array.from({ length: 15 }).map((_, index) => ({
  id: `material-${index + 1}`,
  name: `Material ${index + 1}`,
  quantity: Math.floor(Math.random() * 100) + 1,
  unit: index % 2 === 0 ? 'buc' : 'kg',
  category: `Categoria ${index % 3 + 1}`,
  location: `Locația ${String.fromCharCode(65 + (index % 5))}`
}));

const InventarDepozitPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState<Material[]>(sampleMaterials);

  // Filtrăm materialele în funcție de termenul de căutare
  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6 bg-slate-900 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventar Depozit
          </h1>
          <p className="text-slate-400">
            Gestionează materialele din depozitul companiei
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <FileDown className="mr-2 h-4 w-4" />
            Exportă
          </Button>
          <Button size="sm" className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            Adaugă Material
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Caută..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-slate-800 text-white border border-slate-700">
        <CardHeader>
          <CardTitle>Lista Materialelor</CardTitle>
          <CardDescription className="text-slate-400">
            Total: {filteredMaterials.length} materiale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-700/50 font-medium">
                  <th className="py-3 px-4 text-left">Nume Material</th>
                  <th className="py-3 px-4 text-left">Cantitate</th>
                  <th className="py-3 px-4 text-left">Categorie</th>
                  <th className="py-3 px-4 text-left">Locație</th>
                  <th className="py-3 px-4 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-slate-400" />
                        <span>{material.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {material.quantity} {material.unit}
                    </td>
                    <td className="py-3 px-4">{material.category}</td>
                    <td className="py-3 px-4">{material.location}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        Vizualizează
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Nu s-au găsit materiale
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventarDepozitPage;
