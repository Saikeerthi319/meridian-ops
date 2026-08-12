import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import type { ApiSuccess, DashboardData } from '../api/types';
import { Badge, ErrorBanner, PageHeader, Spinner, statusTone } from '../components/ui';

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<DashboardData>>('/dashboard');
      return res.data.data;
    },
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorBanner message={getErrorMessage(error)} />;
  if (!data) return null;

  const cards = [
    { label: 'Customers', value: data.counts.customers },
    { label: 'Active products', value: data.counts.activeProducts },
    { label: 'Draft challans', value: data.counts.draftChallans },
    { label: 'Confirmed challans', value: data.counts.confirmedChallans },
    { label: 'Low stock SKUs', value: data.counts.lowStock },
  ];

  return (
    <div>
      <PageHeader
        title="Operations dashboard"
        subtitle="Today’s pulse across CRM, inventory, and challans."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="panel px-4 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-ink-950">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Low stock</h2>
            <Link to="/products?lowStock=true" className="text-sm font-semibold text-accent">
              View products
            </Link>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-ink-500">No products below alert level.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStock.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-ink-400">{p.sku}</div>
                      </td>
                      <td>{p.currentStock}</td>
                      <td>{p.minStockAlert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Follow-ups due</h2>
            <Link to="/customers" className="text-sm font-semibold text-accent">
              View customers
            </Link>
          </div>
          {data.followUpsDue.length === 0 ? (
            <p className="text-sm text-ink-500">No follow-ups due.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  {data.followUpsDue.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link to={`/customers/${c.id}`} className="font-medium text-ink-900 hover:text-accent">
                          {c.name}
                        </Link>
                        <div className="text-xs text-ink-400">{c.businessName}</div>
                      </td>
                      <td>
                        <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                      </td>
                      <td>
                        {c.followUpDate
                          ? new Date(c.followUpDate).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
