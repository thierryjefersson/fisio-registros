"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function SuccessToast({ message }: { message: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const exibido = useRef(false);

  useEffect(() => {
    if (exibido.current) return;
    exibido.current = true;
    toast.success(message, { id: "patient-saved" });
    router.replace(pathname);
  }, [message, pathname, router]);

  return null;
}
