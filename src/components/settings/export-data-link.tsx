import { Download } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ExportDataLink() {
  return (
    <a
      className={cn(buttonVariants({ size: "lg" }), "min-h-11 px-5")}
      download
      href="/api/exportar"
    >
      <Download aria-hidden="true" />
      Exportar dados
    </a>
  );
}
