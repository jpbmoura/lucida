"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

import LucidaLogo from "../lucida-logo";

export function NavBar() {
  const { isSignedIn, user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Planos", href: "#precos" },
    { name: "Como Funciona", href: "#como-funciona" },
    { name: "FAQ", href: "#faq" },
    { name: "Contato", href: "#contato" },
  ];

  return (
    <header className="flex h-16 items-center justify-between w-full dark">
      <div className="flex items-center gap-6 md:gap-10">
        <Link href="/" className="flex items-center space-x-2 w-24">
          <LucidaLogo isDark={true} />
        </Link>
      </div>

      <nav className="hidden gap-6 md:flex">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={(e) => {
              if (item.href.startsWith("#")) {
                e.preventDefault();
                const element = document.querySelector(item.href);
                if (element) {
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }
            }}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Mobile menu button */}
      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <UserButton />
        ) : (
          <Link href="/sign-in">
            <Button>Entrar</Button>
          </Link>
        )}
      </div>

      {/* Mobile menu */}
      {/* {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto pb-32 bg-background md:hidden">
          <div className="relative z-20 grid gap-6 rounded-md shadow-md">
            <nav className="grid grid-flow-row auto-rows-max text-sm ">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex w-full items-center rounded-md p-2 text-sm font-medium ${
                    pathname === item.href ? "bg-accent" : "hover:bg-accent"
                  }`}
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    if (item.href.startsWith("#")) {
                      e.preventDefault();
                      setTimeout(() => {
                        const element = document.querySelector(item.href);
                        if (element) {
                          element.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }, 100);
                    }
                  }}
                >
                  {item.name}
                </Link>
              ))}
              {!user && (
                <>
                  <Link
                    href="/sign-in"
                    className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/sign-up"
                    className="flex w-full items-center rounded-md bg-primary p-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Criar conta
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )} */}
    </header>
  );
}
