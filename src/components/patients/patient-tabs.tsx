"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Resumo", suffix: "" },
  { label: "Avaliação", suffix: "/avaliacao" },
  { label: "Plano terapêutico", suffix: "/plano" },
];

export function PatientTabs({ patientId }: { patientId: string }) {
  const pathname = usePathname();
  const base = `/pacientes/${patientId}`;

  return (
    <nav aria-label="Seções do tratamento" className="mb-8 overflow-x-auto">
      <div className="flex min-w-max gap-1 border-b border-border">
        {tabs.map((tab) => {
          const href = `${base}${tab.suffix}`;
          const active = pathname === href;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              href={href}
              key={tab.label}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
