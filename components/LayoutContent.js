"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname === '/';
  const shouldHideSidebar = isLoginPage || isLandingPage;

  if (shouldHideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-black flex-col md:flex-row">
      {/* Sidebar for md+ screens */}
      <aside className="hidden md:flex w-56 bg-neutral-900 text-white flex-col gap-8 p-8 md:static md:h-auto md:min-h-screen">
        <h2 className="text-2xl font-bold mb-8">Business Tracker</h2>
        <nav className="flex flex-col gap-4">
          <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
          <Link href="/lessees" className="hover:text-blue-400 transition-colors">Lessee</Link>
          <Link href="/items" className="hover:text-blue-400 transition-colors">Items</Link>
          <Link href="/records" className="hover:text-blue-400 transition-colors">Records</Link>
          <Link href="/payments" className="hover:text-blue-400 transition-colors">Payment History</Link>
          <Link href="/inventory" className="hover:text-blue-400 transition-colors">Inventory</Link>
        </nav>
      </aside>
      {/* Hamburger menu for mobile */}
      <MobileNav />
      <main className="w-full flex-1 p-4 md:p-8 bg-black min-h-screen">{children}</main>
    </div>
  );
} 