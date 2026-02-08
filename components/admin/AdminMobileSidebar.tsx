"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Building,
  CreditCard,
  BarChart3,
  Settings,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/applications", icon: FileText, label: "Applications" },
  { href: "/admin/accounts", icon: CreditCard, label: "Accounts" },
  { href: "/admin/branches", icon: Building, label: "Branches" },
  { href: "/admin/ledger", icon: BarChart3, label: "Ledger" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

interface AdminMobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminMobileSidebar({ open, onClose }: AdminMobileSidebarProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card lg:hidden"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="gold-text text-lg font-bold leading-tight">Admin Panel</span>
                  <span className="text-xs text-muted-foreground">UnityTrust Bank</span>
                </div>
              </div>
              <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 p-4">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <link.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
