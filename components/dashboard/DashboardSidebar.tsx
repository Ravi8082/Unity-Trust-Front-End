"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Building2, 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  QrCode, 
  CreditCard,
  Landmark,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/accounts", icon: Wallet, label: "Accounts" },
  { href: "/dashboard/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/dashboard/upi", icon: QrCode, label: "UPI" },
  { href: "/dashboard/atm", icon: CreditCard, label: "ATM Card" },
  { href: "/dashboard/loans", icon: Landmark, label: "Loans" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/dashboard/help", icon: HelpCircle, label: "Help" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      className="relative hidden h-full flex-col border-r border-border bg-card lg:flex"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Building2 className="h-6 w-6 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="gold-text text-lg font-bold leading-tight">UnityTrust</span>
            <span className="text-xs text-muted-foreground">Banking</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <link.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {link.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </motion.aside>
  );
}
