import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import type { ApiSuccess, Customer } from '../api/types';
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

const emptyForm = {
  name: '',
  mobile: '',
  email: '',
  businessName: '',
  gstNumber: '',
  type: 'RETAIL' as Customer['type'],
  address: '',
  status: 'LEAD' as Customer['status'],
  followUpDate: '',
  notes: '',
};

export function CustomersPage() {
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN', 'SALES');
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const query = useQuery({
    queryKey: ['customers', page, search, status],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<Customer[]>>('/customers', {
        params: { page, limit: 10, search: search || undefined, status: status || undefined },
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/customers', {
        ...form,
        gstNumber: form.gstNumber || null,
        followUpDate: form.followUpDate || null,
        notes: form.notes || null,
      });
      return res.data;
    },
    onSuccess: async () => {
      setShowForm(false);
      setForm(emptyForm);
      setError('');
      await qc.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="CRM directory with status, type, and follow-up tracking."
        actions={
          canWrite ? (
            <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Close' : 'Add customer'}
            </button>
          ) : null
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      {showForm && canWrite ? (
        <form onSubmit={onSubmit} className="panel mb-6 grid gap-4 p-5 md:grid-cols-2">
          {(
            [
              ['name', 'Customer name'],
              ['mobile', 'Mobile'],
              ['email', 'Email'],
              ['businessName', 'Business name'],
              ['gstNumber', 'GST (optional)'],
              ['address', 'Address'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
              <label className="label">{label}</label>
              <input
                className="input"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key !== 'gstNumber'}
              />
            </div>
          ))}
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as Customer['type'] })}
            >
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Customer['status'] })}
            >
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div>
            <label className="label">Follow-up date</label>
            <input
              type="date"
              className="input"
              value={form.followUpDate}
              onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[90px]"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              Save customer
            </button>
          </div>
        </form>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="input sm:max-w-xs"
          placeholder="Search name, mobile, email…"
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
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {query.isLoading ? <Spinner /> : null}
      {query.error ? <ErrorBanner message={getErrorMessage(query.error)} /> : null}

      {query.data ? (
        query.data.data.length === 0 ? (
          <EmptyState message="No customers found." />
        ) : (
          <>
            <div className="panel table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Mobile</th>
                    <th>Follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.data.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link to={`/customers/${c.id}`} className="font-semibold text-ink-900 hover:text-accent">
                          {c.name}
                        </Link>
                        <div className="text-xs text-ink-400">{c.businessName}</div>
                      </td>
                      <td>{c.type}</td>
                      <td>
                        <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                      </td>
                      <td>{c.mobile}</td>
                      <td>
                        {c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : '—'}
                      </td>
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
