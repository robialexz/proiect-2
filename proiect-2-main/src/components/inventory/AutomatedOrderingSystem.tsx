import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  ShoppingCart,
  TrendingUp,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface AutomatedOrderingSystemProps {
  projectId: string | null;
  className?: string;
}

interface OrderSettings {
  enabled: boolean;
  threshold_percentage: number;
  auto_approve_below_amount: number;
  preferred_supplier_id: string | null;
  notification_email: string | null;
  order_frequency: "daily" | "weekly" | "monthly" | "as_needed";
}

interface LowStockItem {
  id: string;
  name: string;
  quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  unit: string;
  order_quantity?: number;
}

interface PendingOrder {
  id: string;
  material_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  estimated_cost: number;
}

const AutomatedOrderingSystem: React.FC<AutomatedOrderingSystemProps> = ({
  projectId,
  className,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [settings, setSettings] = useState<OrderSettings>({
    enabled: false,
    threshold_percentage: 20,
    auto_approve_below_amount: 500,
    preferred_supplier_id: null,
    notification_email: null,
    order_frequency: "as_needed",
  });
  const [loading, setLoading] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    [],
  );

  // Load settings when project changes
  useEffect(() => {
    if (projectId) {
      loadSettings();
      checkLowStockItems();
      loadPendingOrders();
      loadSuppliers();
    }
  }, [projectId]);

  const loadSettings = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("project_order_settings")
        .select("*")
        .eq("project_id", projectId)
        .single();

      if (error && error.code !== "PGRST116") {
        // Removed console statement
        return;
      }

      if (data) {
        setSettings({
          enabled: data.enabled,
          threshold_percentage: data.threshold_percentage,
          auto_approve_below_amount: data.auto_approve_below_amount,
          preferred_supplier_id: data.preferred_supplier_id,
          notification_email: data.notification_email,
          order_frequency: data.order_frequency,
        });
      }
    } catch (error) {
      // Removed console statement
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, name")
        .order("name");

      if (error) {
        // Removed console statement
        return;
      }

      if (data) {
        setSuppliers(data);
      }
    } catch (error) {
      // Removed console statement
    }
  };

  const saveSettings = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("project_order_settings")
        .upsert({
          project_id: projectId,
          enabled: settings.enabled,
          threshold_percentage: settings.threshold_percentage,
          auto_approve_below_amount: settings.auto_approve_below_amount,
          preferred_supplier_id: settings.preferred_supplier_id,
          notification_email: settings.notification_email,
          order_frequency: settings.order_frequency,
        })
        .select();

      if (error) {
        // Removed console statement
        toast({
          variant: "destructive",
          title: t("inventory.autoOrder.saveError", "Error Saving Settings"),
          description: error.message,
        });
        return;
      }

      toast({
        title: t("inventory.autoOrder.saveSuccess", "Settings Saved"),
        description: t(
          "inventory.autoOrder.saveSuccessDesc",
          "Automated ordering settings have been updated.",
        ),
      });
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("inventory.autoOrder.saveError", "Error Saving Settings"),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkLowStockItems = async () => {
    if (!projectId) return;

    try {
      // Get materials that are below their minimum stock level
      const { data, error } = await supabase
        .from("materials")
        .select(
          "id, name, quantity, min_stock_level, max_stock_level, unit, cost_per_unit",
        )
        .eq("project_id", projectId)
        .not("min_stock_level", "is", null)
        .order("name");

      if (error) {
        // Removed console statement
        return;
      }

      // Filter items that are below threshold
      const lowStock = data
        .filter((item) => {
          if (!item.min_stock_level) return false;
          return item.quantity <= item.min_stock_level;
        })
        .map((item) => {
          // Calculate recommended order quantity
          const orderQuantity = item.max_stock_level
            ? Math.ceil(item.max_stock_level - item.quantity)
            : Math.ceil(item.min_stock_level * 2 - item.quantity);

          return {
            ...item,
            order_quantity: orderQuantity > 0 ? orderQuantity : 1,
          };
        });

      setLowStockItems(lowStock);
    } catch (error) {
      // Removed console statement
    }
  };

  const loadPendingOrders = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from("material_orders")
        .select("*, materials(name, unit)")
        .eq("project_id", projectId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        // Removed console statement
        return;
      }

      if (data) {
        const formattedOrders = data.map((order) => ({
          id: order.id,
          material_id: order.material_id,
          material_name: order.materials.name,
          quantity: order.quantity,
          unit: order.materials.unit,
          status: order.status,
          created_at: order.created_at,
          estimated_cost: order.estimated_cost || 0,
        }));

        setPendingOrders(formattedOrders);
      }
    } catch (error) {
      // Removed console statement
    }
  };

  const createOrder = async (item: LowStockItem, quantity: number) => {
    if (!projectId) return;

    try {
      // Calculate estimated cost if cost_per_unit is available
      const estimatedCost = item.cost_per_unit
        ? item.cost_per_unit * quantity
        : null;

      const { data, error } = await supabase
        .from("material_orders")
        .insert({
          project_id: projectId,
          material_id: item.id,
          quantity: quantity,
          status:
            estimatedCost && estimatedCost <= settings.auto_approve_below_amount
              ? "approved"
              : "pending",
          supplier_id: settings.preferred_supplier_id,
          estimated_cost: estimatedCost,
          created_by: "system",
          notes: "Automatically generated order due to low stock level",
        })
        .select();

      if (error) {
        // Removed console statement
        toast({
          variant: "destructive",
          title: t("inventory.autoOrder.orderError", "Error Creating Order"),
          description: error.message,
        });
        return;
      }

      toast({
        title: t("inventory.autoOrder.orderCreated", "Order Created"),
        description: t(
          "inventory.autoOrder.orderCreatedDesc",
          "Order for {{quantity}} {{unit}} of {{name}} has been created.",
          { quantity, unit: item.unit, name: item.name },
        ),
      });

      // Refresh pending orders
      loadPendingOrders();
      // Remove item from low stock list
      setLowStockItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("inventory.autoOrder.orderError", "Error Creating Order"),
        description: error.message,
      });
    }
  };

  const approveOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("material_orders")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) {
        // Removed console statement
        toast({
          variant: "destructive",
          title: t("inventory.autoOrder.approveError", "Error Approving Order"),
          description: error.message,
        });
        return;
      }

      toast({
        title: t("inventory.autoOrder.orderApproved", "Order Approved"),
        description: t(
          "inventory.autoOrder.orderApprovedDesc",
          "The order has been approved and will be processed.",
        ),
      });

      // Refresh pending orders
      loadPendingOrders();
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("inventory.autoOrder.approveError", "Error Approving Order"),
        description: error.message,
      });
    }
  };

  const rejectOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("material_orders")
        .update({ status: "rejected", rejected_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) {
        // Removed console statement
        toast({
          variant: "destructive",
          title: t("inventory.autoOrder.rejectError", "Error Rejecting Order"),
          description: error.message,
        });
        return;
      }

      toast({
        title: t("inventory.autoOrder.orderRejected", "Order Rejected"),
        description: t(
          "inventory.autoOrder.orderRejectedDesc",
          "The order has been rejected.",
        ),
      });

      // Refresh pending orders
      loadPendingOrders();
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("inventory.autoOrder.rejectError", "Error Rejecting Order"),
        description: error.message,
      });
    }
  };

  const runAutomatedOrdering = async () => {
    if (!settings.enabled || !projectId) return;

    setLoading(true);
    try {
      // Create orders for all low stock items
      for (const item of lowStockItems) {
        if (item.order_quantity) {
          await createOrder(item, item.order_quantity);
        }
      }

      toast({
        title: t(
          "inventory.autoOrder.batchOrdersCreated",
          "Batch Orders Created",
        ),
        description: t(
          "inventory.autoOrder.batchOrdersCreatedDesc",
          "Created {{count}} orders for low stock items.",
          { count: lowStockItems.length },
        ),
      });

      // Refresh low stock items
      checkLowStockItems();
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t(
          "inventory.autoOrder.batchOrderError",
          "Error Creating Batch Orders",
        ),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof OrderSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Card */}
        <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-400" />
              {t("inventory.autoOrder.settings", "Automated Ordering Settings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="auto-ordering-enabled"
                className="flex items-center cursor-pointer"
              >
                <span className="mr-2">
                  {t(
                    "inventory.autoOrder.enabled",
                    "Enable Automated Ordering",
                  )}
                </span>
              </Label>
              <Switch
                id="auto-ordering-enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("enabled", checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold-percentage">
                {t(
                  "inventory.autoOrder.thresholdPercentage",
                  "Low Stock Threshold (%)",
                )}
              </Label>
              <Input
                id="threshold-percentage"
                type="number"
                value={settings.threshold_percentage}
                onChange={(e) =>
                  handleSettingChange(
                    "threshold_percentage",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="bg-slate-700 border-slate-600"
                min="0"
                max="100"
              />
              <p className="text-xs text-slate-400">
                {t(
                  "inventory.autoOrder.thresholdDesc",
                  "Percentage above minimum stock level to trigger alerts",
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto-approve-amount">
                {t(
                  "inventory.autoOrder.autoApproveAmount",
                  "Auto-Approve Below Amount",
                )}
              </Label>
              <Input
                id="auto-approve-amount"
                type="number"
                value={settings.auto_approve_below_amount}
                onChange={(e) =>
                  handleSettingChange(
                    "auto_approve_below_amount",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="bg-slate-700 border-slate-600"
                min="0"
              />
              <p className="text-xs text-slate-400">
                {t(
                  "inventory.autoOrder.autoApproveDesc",
                  "Orders below this amount will be automatically approved",
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred-supplier">
                {t(
                  "inventory.autoOrder.preferredSupplier",
                  "Preferred Supplier",
                )}
              </Label>
              <select
                id="preferred-supplier"
                value={settings.preferred_supplier_id || ""}
                onChange={(e) =>
                  handleSettingChange(
                    "preferred_supplier_id",
                    e.target.value || null,
                  )
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
              >
                <option value="">
                  {t(
                    "inventory.autoOrder.noPreferredSupplier",
                    "No preferred supplier",
                  )}
                </option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-email">
                {t(
                  "inventory.autoOrder.notificationEmail",
                  "Notification Email",
                )}
              </Label>
              <Input
                id="notification-email"
                type="email"
                value={settings.notification_email || ""}
                onChange={(e) =>
                  handleSettingChange(
                    "notification_email",
                    e.target.value || null,
                  )
                }
                className="bg-slate-700 border-slate-600"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-frequency">
                {t("inventory.autoOrder.orderFrequency", "Order Frequency")}
              </Label>
              <select
                id="order-frequency"
                value={settings.order_frequency}
                onChange={(e) =>
                  handleSettingChange("order_frequency", e.target.value as any)
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
              >
                <option value="as_needed">
                  {t("inventory.autoOrder.asNeeded", "As Needed")}
                </option>
                <option value="daily">
                  {t("inventory.autoOrder.daily", "Daily")}
                </option>
                <option value="weekly">
                  {t("inventory.autoOrder.weekly", "Weekly")}
                </option>
                <option value="monthly">
                  {t("inventory.autoOrder.monthly", "Monthly")}
                </option>
              </select>
            </div>

            <Button
              onClick={saveSettings}
              disabled={loading}
              className="w-full mt-4"
            >
              {loading
                ? t("common.saving", "Saving...")
                : t("common.saveSettings", "Save Settings")}
            </Button>
          </CardContent>
        </Card>

        {/* Low Stock Items Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
              {t("inventory.autoOrder.lowStockItems", "Low Stock Items")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <p>
                  {t(
                    "inventory.autoOrder.noLowStockItems",
                    "No low stock items detected",
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-750 border border-slate-700 rounded-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-slate-400">
                          {t(
                            "inventory.autoOrder.currentStock",
                            "Current: {{quantity}} {{unit}}",
                            {
                              quantity: item.quantity,
                              unit: item.unit,
                            },
                          )}
                        </p>
                        <p className="text-sm text-slate-400">
                          {t(
                            "inventory.autoOrder.minLevel",
                            "Min: {{level}} {{unit}}",
                            {
                              level: item.min_stock_level,
                              unit: item.unit,
                            },
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-2">
                          <Label
                            htmlFor={`order-qty-${item.id}`}
                            className="mr-2 text-sm"
                          >
                            {t("inventory.autoOrder.orderQty", "Order:")}
                          </Label>
                          <Input
                            id={`order-qty-${item.id}`}
                            type="number"
                            value={item.order_quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setLowStockItems((prev) =>
                                prev.map((i) =>
                                  i.id === item.id
                                    ? { ...i, order_quantity: value }
                                    : i,
                                ),
                              );
                            }}
                            className="w-20 h-8 text-sm bg-slate-700 border-slate-600"
                            min="1"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            item.order_quantity &&
                            createOrder(item, item.order_quantity)
                          }
                          className="w-full"
                        >
                          {t("inventory.autoOrder.createOrder", "Create Order")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={runAutomatedOrdering}
                  disabled={
                    !settings.enabled || loading || lowStockItems.length === 0
                  }
                  className="w-full mt-2"
                >
                  {t(
                    "inventory.autoOrder.createAllOrders",
                    "Create Orders for All Items",
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Orders Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-green-400" />
              {t("inventory.autoOrder.pendingOrders", "Pending Orders")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <p>
                  {t(
                    "inventory.autoOrder.noPendingOrders",
                    "No pending orders",
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 bg-slate-750 border border-slate-700 rounded-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{order.material_name}</h4>
                        <p className="text-sm text-slate-400">
                          {t(
                            "inventory.autoOrder.orderQuantity",
                            "Quantity: {{quantity}} {{unit}}",
                            {
                              quantity: order.quantity,
                              unit: order.unit,
                            },
                          )}
                        </p>
                        {order.estimated_cost > 0 && (
                          <p className="text-sm text-slate-400">
                            {t(
                              "inventory.autoOrder.estimatedCost",
                              "Est. Cost: ${{cost}}",
                              {
                                cost: order.estimated_cost.toFixed(2),
                              },
                            )}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectOrder(order.id)}
                          className="h-8 border-red-800 hover:bg-red-900/20 text-red-400"
                        >
                          {t("inventory.autoOrder.reject", "Reject")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approveOrder(order.id)}
                          className="h-8"
                        >
                          {t("inventory.autoOrder.approve", "Approve")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutomatedOrderingSystem;
