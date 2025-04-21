import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { enhancedSupabaseService as supabaseService } from "@/lib/enhanced-supabase-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

// Tipul pentru detaliile unui element
interface ItemDetail {
  id: string;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  unit?: string;
  cost_per_unit?: number;
  location?: string;
  supplier_name?: string;
  created_at: string;
  updated_at?: string;
  [key: string]: any; // Pentru alte proprietăți dinamice
}

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Obținem detaliile elementului
  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const res = await supabaseService.select<ItemDetail>("resources", "*", {
        filters: { id },
        single: true,
      });
      if (res.error) throw res.error;
      if (!res.data) throw new Error("Item not found");
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minute cache
    retry: 1,
  });

  // Formatare preț
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "-";
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
    }).format(price);
  };

  // Formatare dată
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handler pentru editare
  const handleEdit = () => {
    navigate(`/edit-item/${id}`);
  };

  // Handler pentru ștergere
  const handleDelete = async () => {
    if (!id || !window.confirm("Sigur doriți să ștergeți acest element?"))
      return;

    try {
      await supabaseService.delete("resources", { id });
      navigate("/inventory-list");
    } catch (error) {
      // Removed console statement
      alert("A apărut o eroare la ștergerea elementului.");
    }
  };

  // Stare de încărcare
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48 ml-4" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Stare de eroare
  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Eroare</CardTitle>
            <CardDescription>
              A apărut o eroare la încărcarea detaliilor elementului.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Eroare necunoscută"}
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => navigate("/inventory-list")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Înapoi la listă
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Stare de element negăsit
  if (!item) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Element negăsit</CardTitle>
            <CardDescription>
              Elementul căutat nu a fost găsit în baza de date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Verificați dacă ID-ul este corect sau dacă elementul nu a fost
              șters.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => navigate("/inventory-list")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Înapoi la listă
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Randare normală cu date
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/inventory-list")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Detalii element</h1>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Editează
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Șterge
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{item.name}</CardTitle>
          {item.description && (
            <CardDescription>{item.description}</CardDescription>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {item.category && (
              <Badge variant="outline" className="capitalize">
                {item.category}
              </Badge>
            )}
            {item.location && (
              <Badge variant="secondary">Locație: {item.location}</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Cantitate
                </h3>
                <p className="text-lg font-semibold">
                  {item.quantity} {item.unit || "buc"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Preț unitar
                </h3>
                <p className="text-lg font-semibold">
                  {formatPrice(item.cost_per_unit)}
                </p>
              </div>

              {item.supplier_name && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Furnizor
                  </h3>
                  <p className="text-lg">{item.supplier_name}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  ID
                </h3>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {item.id}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Creat la
                </h3>
                <p>{formatDate(item.created_at)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Ultima actualizare
                </h3>
                <p>{formatDate(item.updated_at)}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Toate proprietățile
            </h3>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(item, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemDetailPage;
