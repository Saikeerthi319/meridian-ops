import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import type { ApiSuccess, Challan } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { Badge, ErrorBanner, PageHeader, Spinner, statusTone } from '../components/ui';

export function ChallanDetailPage() {
  const { id = '' } = useParams();
  const { hasRole } = useAuth();
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const query = useQuery({
    queryKey: ['challan', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<Challan>>(`/challans/${id}`);
      return res.data.data;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/challans/${id}/confirm`);
    },
    onSuccess: async () => {
      setError('');
      await qc.invalidateQueries({ queryKey: ['challan', id] });
      await qc.invalidateQueries({ queryKey: ['challans'] });
      await qc.invalidateQueries({ queryKey: ['products'] });
      await qc.invalidateQueries({ queryKey: ['stock-movements'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/challans/${id}/cancel`);
    },
    onSuccess: async () => {
      setError('');
      await qc.invalidateQueries({ queryKey: ['challan', id] });
      await qc.invalidateQueries({ queryKey: ['challans'] });
      await qc.invalidateQueries({ queryKey: ['products'] });
      await qc.invalidateQueries({ queryKey: ['stock-movements'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (query.isLoading) return <Spinner />;
  if (query.error) return <ErrorBanner message={getErrorMessage(query.error)} />;
  if (!query.data) return null;

  const challan = query.data;
  const canConfirm = hasRole('ADMIN', 'SALES') && challan.status === 'DRAFT';
  const canCancelDraft = hasRole('ADMIN', 'SALES') && challan.status === 'DRAFT';
  const canCancelConfirmed =
    hasRole('ADMIN', 'ACCOUNTS') && challan.status === 'CONFIRMED';

  return (
    <div>
      <PageHeader
        title={challan.challanNumber}
        subtitle={`Created ${new Date(challan.createdAt).toLocaleString()} by ${challan.createdBy.name}`}
        actions={
          <Link to="/challans" className="btn-secondary">
            Back to list
          </Link>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Badge tone={statusTone(challan.status)}>{challan.status}</Badge>
        <span className="text-sm text-ink-500">Total qty {challan.totalQuantity}</span>
        {canConfirm ? (
          <button
            type="button"
            className="btn-primary"
            disabled={confirmMutation.isPending}
            onClick={() => confirmMutation.mutate()}
          >
            Confirm challan
          </button>
        ) : null}
        {canCancelDraft || canCancelConfirmed ? (
          <button
            type="button"
            className="btn-danger"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            Cancel challan
          </button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <section className="panel p-5">
          <h2 className="font-display text-lg font-semibold">Customer</h2>
          <p className="mt-3 font-semibold text-ink-900">
            {'name' in challan.customer ? challan.customer.name : '—'}
          </p>
          <p className="text-sm text-ink-500">
            {'businessName' in challan.customer ? challan.customer.businessName : ''}
          </p>
          {'mobile' in challan.customer ? (
            <p className="mt-2 text-sm text-ink-600">{challan.customer.mobile}</p>
          ) : null}
        </section>

        <section className="panel table-wrap p-2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit price</th>
                <th>Qty</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td>{item.sku}</td>
                  <td>₹{Number(item.unitPrice).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
