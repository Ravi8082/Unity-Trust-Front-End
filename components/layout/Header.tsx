"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Building2, 
  LogOut, 
  User, 
  LayoutDashboard 
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "ROLE_ADMIN":
        return "/admin";
      case "ROLE_MANAGER":
        return "/manager";
      default:
        return "/dashboard";
    }
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="gold-text text-lg font-bold leading-tight">UnityTrust</span>
            <span className="text-xs text-muted-foreground">Bank</span>
          </div>
        </Link>


        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link href={getDashboardLink()}>
                <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-foreground hover:bg-primary/10 bg-transparent">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="gap-2 text-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/open-account">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Open Account
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border-t border-border/50 md:hidden"
          >
            <nav className="flex flex-col gap-2 p-4">
              <Link 
                href="/" 
                className="rounded-lg px-4 py-2 text-foreground hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/open-account" 
                className="rounded-lg px-4 py-2 text-foreground hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Open Account
              </Link>
              <Link 
                href="/branches" 
                className="rounded-lg px-4 py-2 text-foreground hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Branches
              </Link>
              <Link 
                href="/about" 
                className="rounded-lg px-4 py-2 text-foreground hover:bg-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="mt-2 border-t border-border pt-2">
                {isAuthenticated ? (
                  <>
                    <Link 
                      href={getDashboardLink()}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-foreground hover:bg-secondary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login"
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-foreground hover:bg-secondary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Login
                    </Link>
                    <Link 
                      href="/open-account"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="mt-2 w-full bg-primary text-primary-foreground">
                        Open Account
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
