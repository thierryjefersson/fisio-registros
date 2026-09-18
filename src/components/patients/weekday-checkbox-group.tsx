"use client";

import {
  calcularFrequenciaSemanal,
  DIAS_SEMANA,
} from "@/features/patients/schemas";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type WeekdayCheckboxGroupProps = {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
};

export function WeekdayCheckboxGroup({
  value,
  onChange,
  error,
}: WeekdayCheckboxGroupProps) {
  function alternarDia(dia: string) {
    const selecionados = value.includes(dia)
      ? value.filter((item) => item !== dia)
      : [...value, dia];
    onChange(selecionados);
  }

  return (
    <fieldset aria-describedby={error ? "diasAtendimento-error" : undefined}>
      <legend className="text-sm font-medium text-foreground">
        Dias habituais
      </legend>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {DIAS_SEMANA.map(({ label, value: dia }) => {
          const id = `dia-${dia.toLowerCase()}`;
          return (
            <Label
              className={cn(
                "flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-foreground transition-colors",
                value.includes(dia) && "border-primary bg-accent",
              )}
              htmlFor={id}
              key={dia}
            >
              <Checkbox
                aria-describedby={error ? "diasAtendimento-error" : undefined}
                checked={value.includes(dia)}
                id={id}
                name="diasAtendimento"
                onCheckedChange={() => alternarDia(dia)}
                value={dia}
              />
              <span>{label}</span>
            </Label>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-muted-foreground" role="status">
        Frequência: {calcularFrequenciaSemanal(value)}{" "}
        {value.length === 1 ? "dia" : "dias"} por semana
      </p>
      {error ? (
        <p className="mt-1 text-sm text-destructive" id="diasAtendimento-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
