/**
 * Componente de loading pentru diferite secțiuni ale aplicației
 * Aceste componente sunt utilizate ca fallback în timpul încărcării lazy a paginilor
 */

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

/**
 * Componenta de loading implicită
 */
export const DefaultLoadingFallback = () => (
  <div className="w-full h-full flex flex-col gap-4 p-6 animate-pulse">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Componenta de loading pentru autentificare
 */
export const AuthLoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center p-6 animate-pulse">
    <Card className="w-full max-w-md p-6">
      <Skeleton className="h-8 w-1/2 mx-auto mb-6" />
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-10 w-full mb-6" />
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </Card>
  </div>
);

/**
 * Componenta de loading pentru dashboard
 */
export const DashboardLoadingFallback = () => (
  <div className="w-full h-full p-6 animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-8 w-1/4" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="p-4">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-10 w-1/2 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      ))}
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-4">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="h-60">
          <Skeleton className="h-full w-full" />
        </div>
      </Card>
      <Card className="p-4">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

/**
 * Componenta de loading pentru inventar
 */
export const InventoryLoadingFallback = () => (
  <div className="w-full h-full p-6 animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-8 w-1/4" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
    
    <Card className="p-4 mb-6">
      <div className="flex flex-wrap gap-4 mb-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      
      <div className="overflow-hidden">
        <div className="flex border-b pb-2 mb-2">
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
        </div>
        
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex py-2 border-b">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
          </div>
        ))}
      </div>
    </Card>
    
    <div className="flex justify-between">
      <Skeleton className="h-10 w-24" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  </div>
);

/**
 * Componenta de loading pentru proiecte
 */
export const ProjectsLoadingFallback = () => (
  <div className="w-full h-full p-6 animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-10 w-32" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-2 w-full mb-1" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);

/**
 * Componenta de loading pentru rapoarte
 */
export const ReportsLoadingFallback = () => (
  <div className="w-full h-full p-6 animate-pulse">
    <Skeleton className="h-8 w-1/4 mb-6" />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card className="p-4">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="h-60">
          <Skeleton className="h-full w-full" />
        </div>
      </Card>
      <Card className="p-4">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="h-60">
          <Skeleton className="h-full w-full" />
        </div>
      </Card>
    </div>
    
    <Card className="p-4">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="overflow-hidden">
        <div className="flex border-b pb-2 mb-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex py-2 border-b">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    </Card>
  </div>
);

/**
 * Componenta de loading pentru setări
 */
export const SettingsLoadingFallback = () => (
  <div className="w-full h-full p-6 animate-pulse">
    <Skeleton className="h-8 w-1/4 mb-6" />
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <Card className="p-4">
          <Skeleton className="h-6 w-2/3 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </Card>
      </div>
      
      <div className="md:col-span-3">
        <Card className="p-4">
          <Skeleton className="h-6 w-1/3 mb-6" />
          
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div>
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div>
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div>
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
            
            <div className="pt-4">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
);

// Export all loading components
export default {
  DefaultLoadingFallback,
  AuthLoadingFallback,
  DashboardLoadingFallback,
  InventoryLoadingFallback,
  ProjectsLoadingFallback,
  ReportsLoadingFallback,
  SettingsLoadingFallback,
};
