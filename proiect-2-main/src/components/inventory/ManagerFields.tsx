import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { useRole } from "@/contexts/RoleContext";

interface ManagerFieldsProps {
  data: {
    cost_per_unit?: number | string | null;
    supplier_id?: string | null;
    last_order_date?: string | null;
    min_stock_level?: number | string | null;
    max_stock_level?: number | string | null;
    location?: string | null;
    notes?: string | null;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  className?: string;
}

const ManagerFields: React.FC<ManagerFieldsProps> = ({
  data,
  onChange,
  className = "",
}) => {
  const { t } = useTranslation();
  const { isManager } = useRole();

  // Permitem afișarea câmpurilor de manager pentru toți utilizatorii în modul de dezvoltare
  // sau doar pentru manageri în producție
  if (!isManager && !import.meta.env.DEV) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-t border-slate-700 pt-4 mb-2">
        <h3 className="text-lg font-medium text-primary mb-2">
          {t("inventory.form.managerFields", "Manager Fields")}
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          {t(
            "inventory.form.managerFieldsDescription",
            "These fields are only visible to managers",
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost_per_unit">
            {t("inventory.form.costPerUnit", "Cost Per Unit")}
          </Label>
          <Input
            id="cost_per_unit"
            type="number"
            value={data.cost_per_unit ?? ""}
            onChange={onChange}
            placeholder="0.00"
            className="bg-slate-700 border-slate-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier_id">
            {t("inventory.form.supplierId", "Supplier ID")}
          </Label>
          <Input
            id="supplier_id"
            value={data.supplier_id ?? ""}
            onChange={onChange}
            placeholder={t(
              "inventory.form.supplierIdPlaceholder",
              "Supplier identifier",
            )}
            className="bg-slate-700 border-slate-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_order_date">
            {t("inventory.form.lastOrderDate", "Last Order Date")}
          </Label>
          <Input
            id="last_order_date"
            type="date"
            value={data.last_order_date ?? ""}
            onChange={onChange}
            className="bg-slate-700 border-slate-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            {t("inventory.form.location", "Storage Location")}
          </Label>
          <Input
            id="location"
            value={data.location ?? ""}
            onChange={onChange}
            placeholder={t(
              "inventory.form.locationPlaceholder",
              "e.g., Warehouse A, Shelf B3",
            )}
            className="bg-slate-700 border-slate-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_stock_level">
            {t("inventory.form.minStockLevel", "Min Stock Level")}
          </Label>
          <Input
            id="min_stock_level"
            type="number"
            value={data.min_stock_level ?? ""}
            onChange={onChange}
            placeholder="0"
            className="bg-slate-700 border-slate-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_stock_level">
            {t("inventory.form.maxStockLevel", "Max Stock Level")}
          </Label>
          <Input
            id="max_stock_level"
            type="number"
            value={data.max_stock_level ?? ""}
            onChange={onChange}
            placeholder="0"
            className="bg-slate-700 border-slate-600"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("inventory.form.notes", "Notes")}</Label>
        <Textarea
          id="notes"
          value={data.notes ?? ""}
          onChange={onChange}
          placeholder={t(
            "inventory.form.notesPlaceholder",
            "Additional information about this material",
          )}
          className="bg-slate-700 border-slate-600 min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default ManagerFields;
