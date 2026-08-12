import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import type { ApiSuccess, Challan } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import {
  Badge,
  EmptyState,
  ErrorBanner,
  PageHeader,
  Pagination,
  Spinner,
  statusTone,
} from '../components/ui';

export function ChallansPage() {
  const { hasRole } = useAuth();
  const canCreate = hasRole('ADMIN', 'SALES');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const query = useQuery({
    queryKey: ['challans', page, search, status],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<Challan[]>>('/challans', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          status: status || undefined,
        },
      });
      return res.data;
    },
  });

  return (
    <div>
      <PageHeader
        title="Sales challans"
        subtitle="Draft, confirm, and cancel delivery challans with stock-safe rules."
        actions={
          canCreate ? (
            <Link to="/challans/new" className="btn-primary">
              New challan
            </Link>
          ) : null
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="input sm:max-w-xs"
          placeholder="Search challan or customer…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="input sm:max-w-[180px]"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {query.isLoading ? <Spinner /> : null}
      {query.error ? <ErrorBanner message={getErrorMessage(query.error)} /> : null}

      {query.data ? (
        query.data.data.length === 0 ? (
          <EmptyState message="No challans found." />
        ) : (
          <>
            <div className="panel table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Challan</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Qty</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link
                          to={`/challans/${c.id}`}
                          className="font-semibold text-ink-900 hover:text-accent"
                        >
                          {c.challanNumber}
                        </Link>
                      </td>
                      <td>
                        {'businessName' in c.customer ? c.customer.businessName : c.customerId}
                      </td>
                      <td>
                        <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                      </td>
                      <td>{c.totalQuantity}</td>
                      <td>{new Date(c.createdAt).toLocaleString()}</td>
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
    </div>
  );
}
