import { DatabaseBackup } from "lucide-react";

import { ExportDataLink } from "@/components/settings/export-data-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <section aria-labelledby="page-title">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight" id="page-title">
          Configurações
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerencie a cópia de segurança dos registros da aplicação.
        </p>
      </header>

      <section aria-labelledby="data-title" className="mt-8 max-w-3xl">
        <Card>
          <CardHeader className="grid grid-cols-[auto_1fr] items-start gap-x-4">
            <span className="row-span-2 rounded-lg bg-primary/10 p-2.5 text-primary">
              <DatabaseBackup aria-hidden="true" className="size-5" />
            </span>
            <CardTitle id="data-title">Dados</CardTitle>
            <CardDescription>
              Baixe um arquivo JSON com pacientes, documentos clínicos,
              evoluções e cobranças.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-5 text-sm leading-6 text-muted-foreground">
              Guarde o arquivo em um local seguro. A exportação contém dados
              clínicos e financeiros e não substitui uma rotina externa de
              backup.
            </p>
            <ExportDataLink />
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
