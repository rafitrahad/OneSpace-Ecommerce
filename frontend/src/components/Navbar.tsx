'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/controllers/auth.controller';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  if (pathname?.startsWith('/dashboard')) return null;

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(search ? `/?search=${encodeURIComponent(search)}` : '/');
  }

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="font-display text-2xl text-pine-700">
          OneSpace &amp; Co.
        </Link>

        <form onSubmit={onSearch} className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full max-w-md rounded-pill border border-line bg-paper px-4 py-2 text-sm outline-none focus:border-pine-500"
          />
        </form>

        <nav className="flex items-center gap-4 text-sm">
          {user && (user.role === 'admin' || user.role === 'manager') && (
            <Link href="/dashboard" className="text-pine-700 hover:underline">
              Dashboard
            </Link>
          )}
          {user && user.role === 'customer' && (
            <>
              <Link href="/cart" className="text-pine-700 hover:underline">
                Cart
              </Link>
              <Link href="/orders" className="text-pine-700 hover:underline">
                My orders
              </Link>
              <Link href="/profile" className="text-pine-700 hover:underline">
                Profile
              </Link>
            </>
          )}
          {user ? (
            <button onClick={logout} className="text-pine-700/70 hover:text-pine-700">
              Log out
            </button>
          ) : (
            <>
              <Link href="/login" className="text-pine-700 hover:underline">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-pill bg-pine-500 px-4 py-2 text-white hover:bg-pine-600"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
