"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { navigationItems } from "./navigation-items";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  function closeNavigation() {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  useEffect(() => {
    if (!open) return;

    firstLinkRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeNavigation();
        return;
      }

      if (event.key !== "Tab") return;
      const navigation = document.getElementById("mobile-navigation");
      const focusable = navigation?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <Link className="font-semibold text-foreground" href="/">
        Fisio Registros
      </Link>
      <button
        ref={triggerRef}
        aria-controls="mobile-navigation"
        aria-expanded={open}
        aria-label="Abrir navegação"
        className="inline-flex size-11 items-center justify-center rounded-lg border border-border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-40 bg-foreground/30"
          onMouseDown={closeNavigation}
        >
          <aside
            aria-modal="true"
            aria-label="Navegação principal"
            className="ml-auto flex min-h-full w-[min(20rem,88vw)] flex-col bg-card p-4 shadow-xl"
            id="mobile-navigation"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold">Menu</span>
              <button
                aria-label="Fechar navegação"
                className="inline-flex size-11 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={closeNavigation}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <nav>
              <ul className="space-y-1">
                {navigationItems.map(({ href, icon: Icon, label }, index) => (
                  <li key={href}>
                    <Link
                      ref={index === 0 ? firstLinkRef : undefined}
                      className="flex min-h-12 items-center gap-3 rounded-lg px-3 font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      href={href}
                      onClick={closeNavigation}
                    >
                      <Icon aria-hidden="true" className="size-5" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
