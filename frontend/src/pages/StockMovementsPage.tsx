import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import type { ApiSuccess, StockMovement } from '../api/types';
import {
  Badge,
  EmptyState,
  ErrorBanner,
  PageHeader,
  Pagination,
  Spinner,
  statusTone,
} from '../components/ui';

export function StockMovementsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const query = useQuery({
    queryKey: ['stock-movements', page, search, type],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<StockMovement[]>>('/stock-movements', {
        params: {
          page,
          limit: 15,
          search: search || undefined,
          type: type || undefined,
        },
      });
      return res.data;
    },
  });

  return (
    <div>
      <PageHeader
        title="Stock movements"
        subtitle="Audit log of manual adjustments and challan-driven stock changes."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="input sm:max-w-xs"
          placeholder="Search product or reason…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="input sm:max-w-[160px]"
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value);
          }}
        >
          <option value="">All types</option>
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </select>
      </div>

      {query.isLoading ? <Spinner /> : null}
      {query.error ? <ErrorBanner message={getErrorMessage(query.error)} /> : null}

      {query.data ? (
        query.data.data.length === 0 ? (
          <EmptyState message="No stock movements found." />
        ) : (
          <>
            <div className="panel table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Reason</th>
                    <th>By</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((m) => (
                    <tr key={m.id}>
                      <td>{new Date(m.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="font-medium">{m.product.name}</div>
                        <div className="text-xs text-ink-400">{m.product.sku}</div>
                      </td>
                      <td>
                        <Badge tone={statusTone(m.type)}>{m.type}</Badge>
                      </td>
                      <td>{m.quantity}</td>
                      <td>{m.reason}</td>
                      <td>{m.createdBy.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={query.data.meta?.page || page}
              limit={query.data.meta?.limit || 15}
              total={query.data.meta?.total || 0}
              onPageChange={setPage}
            />
          </>
        )
      ) : null}
    </div>
  );
}
