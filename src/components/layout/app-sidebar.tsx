import Link from "next/link";

import { navigationItems } from "./navigation-items";

export function AppSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-border bg-card px-4 py-6 md:block">
      <Link
        className="mb-8 block px-3 text-lg font-semibold text-foreground"
        href="/"
      >
        Fisio Registros
      </Link>
      <nav aria-label="Navegação principal">
        <ul className="space-y-1">
          {navigationItems.map(({ href, icon: Icon, label }) => (
            <li key={href}>
              <Link
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={href}
              >
                <Icon aria-hidden="true" className="size-5" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
