'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BedDouble, 
  Users, 
  Receipt, 
  Wrench, 
  Sparkles,
  PieChart
} from 'lucide-react';
import styles from '../../app/dashboard/DashboardLayout.module.css';

// Navigation items definition with prefix /dashboard
const ALL_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiredPerms: [] },
  { href: '/dashboard/reservations', label: 'Réservations', icon: CalendarDays, requiredPerms: ['reservations.read'] },
  { href: '/dashboard/rooms', label: 'Chambres', icon: BedDouble, requiredPerms: ['settings.rooms.read'] },
  { href: '/dashboard/housekeeping', label: 'Housekeeping', icon: Sparkles, requiredPerms: ['housekeeping.read'] },
  { href: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench, requiredPerms: ['maintenance.read'] },
  { href: '/dashboard/guests', label: 'Clients', icon: Users, requiredPerms: ['guests.read'] },
  { href: '/dashboard/billing', label: 'Folios & Facturation', icon: Receipt, requiredPerms: ['billing.read'] },
  { href: '/dashboard/reports', label: 'Rapports', icon: PieChart, requiredPerms: ['reports.read'] },
  { href: '/dashboard/profile', label: 'Profil', icon: Users, requiredPerms: [] },
];

export function SidebarNav({ userPerms }: { userPerms: string[] }) {
  const pathname = usePathname();

  // Filter navigation items based on user permissions
  const navItems = ALL_NAV_ITEMS.filter(item => 
    item.requiredPerms.length === 0 || item.requiredPerms.some(p => userPerms.includes(p))
  );

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        
        // Active state checking:
        // - For /dashboard: active only if exact match
        // - For others: active if starting with the href (e.g., /dashboard/reservations/new is active on Reservations tab)
        const isActive = item.href === '/dashboard' 
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href);

        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
