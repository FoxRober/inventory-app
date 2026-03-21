"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  Clock, 
  Bookmark, 
  Settings,
  Cpu,
  FolderOpen
} from "lucide-react";
import "./Sidebar.css";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventario", href: "/inventory", icon: Package },
  { name: "Movimientos", href: "/movements", icon: ArrowRightLeft },
  { name: "Préstamos", href: "/loans", icon: Clock },
  { name: "Wishlist", href: "/wishlist", icon: Bookmark },
  { name: "Proyectos", href: "/projects", icon: FolderOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Cpu className="text-primary" size={28} />
        <h2>Inventario Pro</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link href={item.href} className={`nav-link ${isActive ? "active" : ""}`}>
                  <item.icon size={20} className="nav-icon" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <Link href="/settings" className={`nav-link w-full text-left ${pathname === '/settings' ? 'active' : ''}`}>
          <Settings size={20} className="nav-icon" />
          <span>Configuración</span>
        </Link>
      </div>
    </aside>
  );
}
