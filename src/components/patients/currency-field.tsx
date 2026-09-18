"use client";

import { NumericFormat, type NumericFormatProps } from "react-number-format";

type CurrencyFieldProps = Omit<NumericFormatProps, "onValueChange"> & {
  onValueChange: (value: string) => void;
};

export function CurrencyField({ onValueChange, ...props }: CurrencyFieldProps) {
  return (
    <NumericFormat
      {...props}
      allowNegative={false}
      decimalScale={2}
      decimalSeparator=","
      fixedDecimalScale={false}
      onValueChange={({ value }) => onValueChange(value)}
      prefix="R$ "
      thousandSeparator="."
      valueIsNumericString
    />
  );
}
