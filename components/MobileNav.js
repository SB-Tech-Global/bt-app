"use client";
import { useState } from "react";
import Link from "next/link";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden w-full bg-neutral-900 text-white flex items-center justify-between px-4 py-3 sticky top-0 z-10">
      <span className="font-bold text-lg">Business Tracker</span>
      <button
        className="flex flex-col justify-center items-center w-8 h-8 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open navigation menu"
      >
        <span className={`block w-6 h-0.5 bg-white mb-1 transition-transform ${open ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-white mb-1 transition-opacity ${open ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-white transition-transform ${open ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40"
          onClick={() => setOpen(false)}
        />
      )}
      {/* Slide-out menu */}
      <nav
        className={`fixed top-0 right-0 h-full w-2/3 max-w-xs bg-neutral-900 text-white z-50 transform ${open ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-200 ease-in-out flex flex-col pt-20 px-6 gap-6 shadow-lg`}
        style={{ minWidth: 200 }}
      >
        <Link href="/dashboard" onClick={() => setOpen(false)} className="hover:text-blue-400 transition-colors text-lg">Dashboard</Link>
        <Link href="/lessees" onClick={() => setOpen(false)} className="hover:text-blue-400 transition-colors text-lg">Lessee</Link>
        <Link href="/items" onClick={() => setOpen(false)} className="hover:text-blue-400 transition-colors text-lg">Items</Link>
        <Link href="/records" onClick={() => setOpen(false)} className="hover:text-blue-400 transition-colors text-lg">Records</Link>
        <Link href="/payments" onClick={() => setOpen(false)} className="hover:text-blue-400 transition-colors text-lg">Payment History</Link>
        <Link href="/inventory" onClick={() => setOpen(false)} className="hover:text-blue-400 transition-colors text-lg">Inventory</Link>
      </nav>
    </header>
  );
} 