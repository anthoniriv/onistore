import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Images, MessageSquare, Ticket, TrendingUp, ExternalLink, LogOut } from "lucide-react";
import { getSession } from "@/lib/auth";
import { OniLogo } from "@/components/brand";
import { logoutAction } from "../actions";
import { AdminNavLink } from "@/components/admin/nav-link";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/ventas", label: "Ventas", icon: TrendingUp },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/cupones", label: "Cupones", icon: Ticket },
  { href: "/admin/banners", label: "Banners", icon: Images },
  { href: "/admin/mensajes", label: "Mensajes", icon: MessageSquare },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-oni-black text-oni-bone md:grid md:grid-cols-[230px_1fr]">
      {/* Sidebar desktop */}
      <aside className="hidden border-r border-oni-line bg-oni-ink md:flex md:flex-col">
        <div className="border-b border-oni-line p-4">
          <Link href="/admin"><OniLogo /></Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => (
            <AdminNavLink key={n.href} href={n.href} exact={n.exact} icon={<n.icon className="h-4 w-4" />} label={n.label} />
          ))}
        </nav>
        <div className="space-y-1 border-t border-oni-line p-3">
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-oni-ash hover:bg-oni-surface hover:text-oni-bone">
            <ExternalLink className="h-4 w-4" /> Ver tienda
          </Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-oni-ash hover:bg-oni-surface hover:text-oni-red">
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </form>
        </div>
      </aside>

      {/* Topbar mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-oni-line bg-oni-ink px-4 py-3 md:hidden">
        <Link href="/admin"><OniLogo /></Link>
        <form action={logoutAction}>
          <button className="grid h-9 w-9 place-items-center text-oni-ash"><LogOut className="h-5 w-5" /></button>
        </form>
      </header>

      <div className="flex flex-col">
        {/* Nav scroll mobile */}
        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-oni-line bg-oni-ink px-3 py-2 md:hidden">
          {NAV.map((n) => (
            <AdminNavLink key={n.href} href={n.href} exact={n.exact} icon={<n.icon className="h-4 w-4" />} label={n.label} compact />
          ))}
        </nav>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
