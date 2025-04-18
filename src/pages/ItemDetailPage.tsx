import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabaseService from '../lib/supabase-service';

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (id) {
        const res = await supabaseService.select<any>('resources', '*', { filters: { id } , single: true });
        if (res.error) console.error(res.error);
        else setItem(res.data);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!item) return <div className="p-8">Item not found</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Item Detail</h1>
      <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
        {JSON.stringify(item, null, 2)}
      </pre>
    </div>
  );
};

export default ItemDetailPage;
