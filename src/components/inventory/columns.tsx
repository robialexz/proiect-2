"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react"; // Needed for React.Dispatch
 // Remove import from here
import { TFunction } from "i18next"; // Import TFunction type

// Define the shape of our data
export type Material = {
  id: string; // Assuming an ID for each material
  name: string;
  dimension: string | null;
  unit: string;
  quantity: number;
  manufacturer: string | null;
  category: string | null;
  suplimentar: number | null;
  image_url?: string | null;
  // Additional fields for managers
  cost_per_unit?: number | null;
  supplier_id?: string | null;
  last_order_date?: string | null;
  min_stock_level?: number | null;
  max_stock_level?: number | null;
  location?: string | null;
  notes?: string | null;
};

// Define props for the columns function
interface ColumnsProps {
  setMaterialToDelete: React.Dispatch<React.SetStateAction<Material | null>>;
  setMaterialToEdit: React.Dispatch<React.SetStateAction<Material | null>>;
  setMaterialToView: React.Dispatch<React.SetStateAction<Material | null>>;
  setMaterialToRequestSuplimentar: React.Dispatch<
    React.SetStateAction<Material | null>
  >;
  setMaterialToConfirmSuplimentar: React.Dispatch<
    React.SetStateAction<Material | null>
  >;
  t: TFunction; // Add t function prop
}

// Export a function that returns the columns definition
export const getColumns = ({
  setMaterialToDelete,
  setMaterialToEdit,
  setMaterialToView,
  setMaterialToRequestSuplimentar,
  setMaterialToConfirmSuplimentar,
  t, // Destructure t function prop
}: ColumnsProps): ColumnDef<Material>[] => {
   // Remove hook call from here

  // Define column headers using t()
  const columns: ColumnDef<Material>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("inventory.columns.name", "Name")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const material = row.original;
        return (
          <div
            className="cursor-pointer hover:underline"
            onClick={() => setMaterialToRequestSuplimentar(material)} // This now triggers the Adjust dialog
            title={
              t(
                "inventory.actions.adjustTooltip",
                "Click to adjust supplementary quantity",
              ) || ""
            }
          >
            {material.name}
          </div>
        );
      },
    },
    {
      accessorKey: "image_url",
      header: t("inventory.columns.image", "Image"),
      cell: ({ row }) => {
        const imageUrl = row.getValue("image_url") as string | null;
        return imageUrl ? (
          <img
            src={imageUrl}
            alt={row.getValue("name")}
            className="w-10 h-10 object-cover rounded-md"
          />
        ) : (
          <div className="w-10 h-10 bg-slate-700 rounded-md flex items-center justify-center text-slate-400">
            No img
          </div>
        );
      },
    },
    {
      accessorKey: "dimension",
      header: t("inventory.columns.dimension", "Dimension"),
    },
    {
      accessorKey: "unit",
      header: t("inventory.columns.unit", "Unit"),
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("inventory.columns.quantity", "Quantity")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const quantity = parseFloat(row.getValue("quantity"));
        return <div className="text-right font-medium">{quantity}</div>;
      },
    },
    {
      accessorKey: "suplimentar",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("inventory.columns.suplimentar", "Supplementary")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const rawValue = row.getValue("suplimentar");
        const numericValue = parseFloat(String(rawValue ?? "0"));
        const suplimentar = isNaN(numericValue) ? 0 : numericValue;
        return (
          <div
            className={`text-right font-medium ${suplimentar > 0 ? "text-yellow-400" : ""}`}
          >
            {suplimentar}
          </div>
        );
      },
    },
    {
      accessorKey: "manufacturer",
      header: t("inventory.columns.manufacturer", "Manufacturer"),
    },
    {
      accessorKey: "category",
      header: t("inventory.columns.category", "Category"),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right">{t("common.actions", "Actions")}</div>
      ), // Translate header
      cell: ({ row }) => {
        const material = row.original;
        return (
          <div className="text-right" data-col-id="actions">
            {" "}
            {/* Ensure data-col-id is here */}
            <DropdownMenu>
              {/* Added asChild to DropdownMenuTrigger */}
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">
                    {t("inventory.actions.openMenu", "Open menu")}
                  </span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-800 border-slate-700 text-white"
              >
                <DropdownMenuLabel>
                  {t("common.actions", "Actions")}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent row click
                    navigator.clipboard.writeText(material.id);
                    alert(`Copied Material ID: ${material.id}`); // Alert might not be ideal for i18n
                  }}
                  className="focus:bg-slate-700 cursor-pointer"
                >
                  {t("inventory.actions.copyId", "Copy Material ID")}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                  className="focus:bg-slate-700 cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent row click
                    setMaterialToView(material);
                  }}
                >
                  {t("common.view", "View Details")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="focus:bg-slate-700 cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent row click
                    setMaterialToEdit(material);
                  }}
                >
                  {t("common.edit", "Edit Material")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="focus:bg-red-700 text-red-400 cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent row click
                    setMaterialToDelete(material);
                  }}
                >
                  {t("common.delete", "Delete Material")}
                </DropdownMenuItem>
                {/* Confirm Suplimentar action */}
                {(material.suplimentar ?? 0) > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      className="focus:bg-green-700 text-green-400 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation(); // Prevent row click
                        setMaterialToConfirmSuplimentar(material);
                      }}
                    >
                      {t(
                        "inventory.actions.confirmSuplimentar",
                        "Confirm Suplimentar",
                      )}{" "}
                      ({material.suplimentar})
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return columns;
};
