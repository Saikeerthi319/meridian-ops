import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import type { ApiSuccess, Customer } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { Badge, ErrorBanner, PageHeader, Spinner, statusTone } from '../components/ui';

export function CustomerDetailPage() {
  const { id = '' } = useParams();
  const { hasRole } = useAuth();
  const canWrite = hasRole('ADMIN', 'SALES');
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Customer>>({});
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [error, setError] = useState('');

  const query = useQuery({
    queryKey: ['customer', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<Customer>>(`/customers/${id}`);
      return res.data.data;
    },
  });

  useEffect(() => {
    if (query.data) {
      setForm({
        name: query.data.name,
        mobile: query.data.mobile,
        email: query.data.email,
        businessName: query.data.businessName,
        gstNumber: query.data.gstNumber || '',
        type: query.data.type,
        address: query.data.address,
        status: query.data.status,
        followUpDate: query.data.followUpDate
          ? query.data.followUpDate.slice(0, 10)
          : '',
        notes: query.data.notes || '',
      });
    }
  }, [query.data]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/customers/${id}`, {
        ...form,
        gstNumber: form.gstNumber || null,
        followUpDate: form.followUpDate || null,
        notes: form.notes || null,
      });
    },
    onSuccess: async () => {
      setError('');
      await qc.invalidateQueries({ queryKey: ['customer', id] });
      await qc.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const followUpMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/customers/${id}/follow-ups`, {
        note,
        followUpDate: followUpDate || null,
      });
    },
    onSuccess: async () => {
      setNote('');
      setFollowUpDate('');
      setError('');
      await qc.invalidateQueries({ queryKey: ['customer', id] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (query.isLoading) return <Spinner />;
  if (query.error) return <ErrorBanner message={getErrorMessage(query.error)} />;
  if (!query.data) return null;

  function onSave(e: FormEvent) {
    e.preventDefault();
    updateMutation.mutate();
  }

  function onFollowUp(e: FormEvent) {
    e.preventDefault();
    followUpMutation.mutate();
  }

  return (
    <div>
      <PageHeader
        title={query.data.name}
        subtitle={query.data.businessName}
        actions={
          <Link to="/customers" className="btn-secondary">
            Back to list
          </Link>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      <div className="mb-4">
        <Badge tone={statusTone(query.data.status)}>{query.data.status}</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={onSave} className="panel grid gap-4 p-5 md:grid-cols-2">
          <h2 className="font-display text-xl font-semibold md:col-span-2">Profile</h2>
          {(
            [
              ['name', 'Name'],
              ['mobile', 'Mobile'],
              ['email', 'Email'],
              ['businessName', 'Business name'],
              ['gstNumber', 'GST'],
              ['address', 'Address'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
              <label className="label">{label}</label>
              <input
                className="input"
                value={(form[key] as string) || ''}
                disabled={!canWrite}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              disabled={!canWrite}
              value={form.type || 'RETAIL'}
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
              disabled={!canWrite}
              value={form.status || 'LEAD'}
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
              disabled={!canWrite}
              value={(form.followUpDate as string) || ''}
              onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[90px]"
              disabled={!canWrite}
              value={(form.notes as string) || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          {canWrite ? (
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                Save changes
              </button>
            </div>
          ) : null}
        </form>

        <div className="space-y-6">
          {canWrite ? (
            <form onSubmit={onFollowUp} className="panel space-y-4 p-5">
              <h2 className="font-display text-xl font-semibold">Add follow-up</h2>
              <div>
                <label className="label">Note</label>
                <textarea
                  className="input min-h-[90px]"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Next follow-up date</label>
                <input
                  type="date"
                  className="input"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={followUpMutation.isPending}>
                Add follow-up
              </button>
            </form>
          ) : null}

          <section className="panel p-5">
            <h2 className="mb-4 font-display text-xl font-semibold">Follow-up history</h2>
            <div className="space-y-3">
              {(query.data.followUps || []).length === 0 ? (
                <p className="text-sm text-ink-500">No follow-ups yet.</p>
              ) : (
                query.data.followUps!.map((f) => (
                  <div key={f.id} className="rounded-lg border border-ink-100 px-4 py-3">
                    <p className="text-sm text-ink-800">{f.note}</p>
                    <p className="mt-2 text-xs text-ink-400">
                      {f.createdBy.name} · {new Date(f.createdAt).toLocaleString()}
                      {f.followUpDate
                        ? ` · next ${new Date(f.followUpDate).toLocaleDateString()}`
                        : ''}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
