import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/customers', label: 'Customers' },
  { to: '/products', label: 'Products' },
  { to: '/stock-movements', label: 'Stock' },
  { to: '/challans', label: 'Challans' },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-ink-100 bg-ink-950 text-ink-50 lg:min-h-screen lg:border-b-0 lg:border-r lg:border-ink-800">
        <div className="px-6 py-7">
          <p className="font-display text-2xl font-bold tracking-tight text-white">Meridian Ops</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-300">ERP + CRM Portal</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-ink-200 hover:bg-ink-800 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-ink-100/80 bg-white/70 px-4 py-3 backdrop-blur sm:px-8">
          <div>
            <p className="text-sm font-semibold text-ink-900">{user?.name}</p>
            <p className="text-xs uppercase tracking-wide text-ink-400">{user?.role}</p>
          </div>
          <button type="button" className="btn-secondary" onClick={logout}>
            Log out
          </button>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
