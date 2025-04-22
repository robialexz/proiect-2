import React, { useEffect, useState } from "react";
import { supabaseService } from "../services";

const InventoryListPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
    const res = await supabaseService.select<any[]>("resources", "*");
    } catch (error) {
      // Handle error appropriately
    }
    if (res.error) {
      // Removed console statement
    } else {
      setItems(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Inventory List</h1>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2 text-left">ID</th>
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Details</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any) => (
            <tr key={item.id}>
              <td className="border px-4 py-2">{item.id}</td>
              <td className="border px-4 py-2">{item.name || "-"}</td>
              <td className="border px-4 py-2">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryListPage;
