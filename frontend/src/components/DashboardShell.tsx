'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/controllers/auth.controller';

interface NavItem {
  href: string;
  label: string;
  roles: ('admin' | 'manager')[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview & sales', roles: ['admin', 'manager'] },
  { href: '/dashboard/products', label: 'Products', roles: ['admin', 'manager'] },
  { href: '/dashboard/categories', label: 'Categories', roles: ['admin'] },
  { href: '/dashboard/inventory', label: 'Inventory', roles: ['admin', 'manager'] },
  { href: '/dashboard/orders', label: 'Orders', roles: ['admin', 'manager'] },
  { href: '/dashboard/users', label: 'Customers & staff', roles: ['admin'] },
  { href: '/dashboard/staff', label: 'Staff roles', roles: ['admin'] },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role as 'admin' | 'manager'),
  );

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="w-64 shrink-0 border-r border-line bg-surface">
        <div className="border-b border-line px-6 py-5">
          <Link href="/" className="font-display text-xl text-pine-700">
            OneSpace &amp; Co.
          </Link>
          <p className="mt-1 text-xs text-pine-700/50">
            {user?.role === 'admin' ? 'Admin console' : 'Shop manager console'}
          </p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {visibleItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-2 text-sm ${
                  active
                    ? 'bg-pine-500 text-white'
                    : 'text-ink hover:bg-pine-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-line p-3">
          <p className="px-3 text-sm text-ink">{user?.name}</p>
          <button
            onClick={logout}
            className="mt-2 w-full rounded px-3 py-2 text-left text-sm text-pine-700/70 hover:bg-pine-50"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
