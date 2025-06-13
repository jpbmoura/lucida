"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Settings,
  CreditCard,
  LogOut,
  UsersRound,
} from "lucide-react";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import LucidaLogo from "../lucida-logo";
import { Switch } from "../ui/switch";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  role?: string[];
  disabled?: boolean;
};

export function DashboardNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      role: ["admin", "student", "teacher"],
    },
    {
      title: "Criar Prova",
      href: "/dashboard/exams/create",
      icon: <FileText className="h-5 w-5" />,
      role: ["admin", "teacher"],
    },
    {
      title: "Minhas Provas",
      href: "/dashboard/exams",
      icon: <Folder className="h-5 w-5" />,
      role: ["admin", "teacher"],
    },
    {
      title: "Minhas Turmas",
      href: "/dashboard/classes",
      icon: <UsersRound className="h-5 w-5" />,
    },
    {
      title: "Configurações",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      role: ["admin", "teacher", "student"],
      disabled: true,
    },
  ];

  return (
    <div className="hidden border-r bg-muted/40 lg:block sticky top-0 left-0 w-64 h-screen">
      <div className="flex h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2 w-24">
            <LucidaLogo />
          </Link>
          <UserButton />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium gap-1">
            {navItems.map((item, index) => (
              <Button
                key={index}
                disabled={item.disabled}
                size="sm"
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  pathname === item.href && "bg-muted text-primary"
                )}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    item.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <div className="flex items-center gap-2"></div>
          <SignOutButton>
            <Button variant="outline" className="w-full justify-start gap-3">
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
