import { responderExportacao } from "@/features/export/http";

export const dynamic = "force-dynamic";

export function GET() {
  return responderExportacao();
}
