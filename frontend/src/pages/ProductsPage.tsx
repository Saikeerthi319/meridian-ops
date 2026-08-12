import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import type { ApiSuccess, Product } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import {
  Badge,
  EmptyState,
  ErrorBanner,
  PageHeader,
  Pagination,
  Spinner,
} from '../components/ui';

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  unitPrice: '',
  currentStock: '0',
  minStockAlert: '0',
  location: '',
};

export function ProductsPage() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN', 'WAREHOUSE');
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const lowStock = params.get('lowStock') === 'true';
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjust, setAdjust] = useState({ type: 'IN', quantity: '1', reason: '' });
  const [error, setError] = useState('');

  const query = useQuery({
    queryKey: ['products', page, search, lowStock],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<Product[]>>('/products', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          lowStock: lowStock || undefined,
        },
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/products', {
        ...form,
        unitPrice: Number(form.unitPrice),
        currentStock: Number(form.currentStock),
        minStockAlert: Number(form.minStockAlert),
      });
    },
    onSuccess: async () => {
      setShowForm(false);
      setForm(emptyForm);
      setError('');
      await qc.invalidateQueries({ queryKey: ['products'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const adjustMutation = useMutation({
    mutationFn: async () => {
      await api.post('/stock-movements', {
        productId: adjustProduct!.id,
        type: adjust.type,
        quantity: Number(adjust.quantity),
        reason: adjust.reason,
      });
    },
    onSuccess: async () => {
      setAdjustProduct(null);
      setAdjust({ type: 'IN', quantity: '1', reason: '' });
      setError('');
      await qc.invalidateQueries({ queryKey: ['products'] });
      await qc.invalidateQueries({ queryKey: ['stock-movements'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: async (product: Product) => {
      await api.patch(`/products/${product.id}`, { isActive: !product.isActive });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const subtitle = useMemo(
    () => (lowStock ? 'Showing products at or below alert quantity.' : 'Catalog and on-hand stock.'),
    [lowStock],
  );

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={subtitle}
        actions={
          canWrite ? (
            <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Close' : 'Add product'}
            </button>
          ) : null
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      {showForm && canWrite ? (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="panel mb-6 grid gap-4 p-5 md:grid-cols-2"
        >
          {Object.entries({
            name: 'Product name',
            sku: 'SKU',
            category: 'Category',
            unitPrice: 'Unit price',
            currentStock: 'Opening stock',
            minStockAlert: 'Min stock alert',
            location: 'Location / warehouse',
          }).map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                className="input"
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              Save product
            </button>
          </div>
        </form>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="input sm:max-w-xs"
          placeholder="Search name, SKU, category…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <label className="inline-flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(e) => {
              setPage(1);
              const next = new URLSearchParams(params);
              if (e.target.checked) next.set('lowStock', 'true');
              else next.delete('lowStock');
              setParams(next);
            }}
          />
          Low stock only
        </label>
      </div>

      {query.isLoading ? <Spinner /> : null}
      {query.error ? <ErrorBanner message={getErrorMessage(query.error)} /> : null}

      {query.data ? (
        query.data.data.length === 0 ? (
          <EmptyState message="No products found." />
        ) : (
          <>
            <div className="panel table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Location</th>
                    <th>Status</th>
                    {canWrite ? <th>Actions</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-ink-400">
                          {p.sku} · {p.category}
                        </div>
                      </td>
                      <td>₹{Number(p.unitPrice).toFixed(2)}</td>
                      <td>
                        <span
                          className={
                            p.currentStock <= p.minStockAlert ? 'font-semibold text-accent-dark' : ''
                          }
                        >
                          {p.currentStock}
                        </span>
                        <span className="text-xs text-ink-400"> / min {p.minStockAlert}</span>
                      </td>
                      <td>{p.location}</td>
                      <td>
                        <Badge tone={p.isActive ? 'success' : 'danger'}>
                          {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </td>
                      {canWrite ? (
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => setAdjustProduct(p)}
                            >
                              Adjust
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => toggleMutation.mutate(p)}
                            >
                              {p.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={query.data.meta?.page || page}
              limit={query.data.meta?.limit || 10}
              total={query.data.meta?.total || 0}
              onPageChange={setPage}
            />
          </>
        )
      ) : null}

      {adjustProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
          <form
            className="panel w-full max-w-md space-y-4 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              adjustMutation.mutate();
            }}
          >
            <h3 className="font-display text-xl font-semibold">
              Adjust stock · {adjustProduct.sku}
            </h3>
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={adjust.type}
                onChange={(e) => setAdjust({ ...adjust, type: e.target.value })}
              >
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </select>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input
                className="input"
                type="number"
                min={1}
                value={adjust.quantity}
                onChange={(e) => setAdjust({ ...adjust, quantity: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Reason</label>
              <input
                className="input"
                value={adjust.reason}
                onChange={(e) => setAdjust({ ...adjust, reason: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setAdjustProduct(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={adjustMutation.isPending}>
                Save movement
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
