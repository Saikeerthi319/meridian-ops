import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import type { ApiSuccess, Challan, Customer, Product } from '../api/types';
import { ErrorBanner, PageHeader, Spinner } from '../components/ui';

type Line = { productId: string; quantity: string };

export function ChallanFormPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState<Line[]>([{ productId: '', quantity: '1' }]);
  const [error, setError] = useState('');

  const customers = useQuery({
    queryKey: ['customers-options'],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<Customer[]>>('/customers', {
        params: { page: 1, limit: 100 },
      });
      return res.data.data;
    },
  });

  const products = useQuery({
    queryKey: ['products-options'],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<Product[]>>('/products', {
        params: { page: 1, limit: 100, isActive: true },
      });
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiSuccess<Challan>>('/challans', {
        customerId,
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: Number(l.quantity),
        })),
      });
      return res.data.data;
    },
    onSuccess: async (challan) => {
      await qc.invalidateQueries({ queryKey: ['challans'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(`/challans/${challan.id}`);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (customers.isLoading || products.isLoading) return <Spinner />;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <div>
      <PageHeader
        title="New sales challan"
        subtitle="Saved as Draft. Stock changes only on confirm."
        actions={
          <Link to="/challans" className="btn-secondary">
            Back
          </Link>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      <form onSubmit={onSubmit} className="panel space-y-5 p-5">
        <div>
          <label className="label">Customer</label>
          <select
            className="input"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            <option value="">Select customer</option>
            {(customers.data || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.businessName} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Line items</h2>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setLines([...lines, { productId: '', quantity: '1' }])}
            >
              Add line
            </button>
          </div>
          {lines.map((line, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
              <select
                className="input"
                value={line.productId}
                onChange={(e) => {
                  const next = [...lines];
                  next[index] = { ...next[index], productId: e.target.value };
                  setLines(next);
                }}
                required
              >
                <option value="">Select product</option>
                {(products.data || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) · stock {p.currentStock}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) => {
                  const next = [...lines];
                  next[index] = { ...next[index], quantity: e.target.value };
                  setLines(next);
                }}
                required
              />
              <button
                type="button"
                className="btn-secondary"
                disabled={lines.length === 1}
                onClick={() => setLines(lines.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
          Save draft challan
        </button>
      </form>
    </div>
  );
}
