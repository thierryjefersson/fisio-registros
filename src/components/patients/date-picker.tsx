"use client";

import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatarDataCivil, validarDataCivil } from "@/lib/dates";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  className?: string;
  disableFuture?: boolean;
};

export function DatePicker({
  id,
  value,
  onBlur,
  onChange,
  className,
  disableFuture = false,
  ...ariaProps
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = dateCivilParaLocal(value);

  return (
    <Popover
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) onBlur?.();
      }}
      open={open}
    >
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "mt-1 h-11 w-full justify-between px-3 font-normal",
              className,
            )}
            id={id}
            variant="outline"
            {...ariaProps}
          />
        }
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value && validarDataCivil(value)
            ? formatarDataCivil(value)
            : "Selecione a data"}
        </span>
        <CalendarIcon aria-hidden="true" className="size-4 opacity-70" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          captionLayout="dropdown"
          disabled={disableFuture ? { after: new Date() } : undefined}
          autoFocus
          locale={ptBR}
          mode="single"
          onSelect={(date) => {
            if (!date) return;
            onChange(localParaDataCivil(date));
            setOpen(false);
          }}
          selected={selectedDate}
        />
      </PopoverContent>
    </Popover>
  );
}

function dateCivilParaLocal(value: string): Date | undefined {
  if (!validarDataCivil(value)) return undefined;
  const [ano, mes, dia] = value.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function localParaDataCivil(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}
