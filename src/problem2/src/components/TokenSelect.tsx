import { useMemo } from "react";
import type { Token } from "../types";
import { CurrencyDropdown } from "./CurrencyDropdown";

interface TokenSelectProps {
  tokens: Token[];
  currencies: Token[];
  selectedCurrency: string;
  onChange: (currency: string) => void;
  disabledCurrency?: string;
  showNoPriceItems?: boolean;
}

export function TokenSelect({
  tokens,
  currencies,
  selectedCurrency,
  onChange,
  disabledCurrency,
  showNoPriceItems = true,
}: TokenSelectProps) {
  const pricedCurrencies = useMemo(
    () => new Set(tokens.map((token) => token.currency)),
    [tokens],
  );

  const options = useMemo(
    () =>
      currencies
        .filter(
          (currency) =>
            showNoPriceItems || pricedCurrencies.has(currency.currency),
        )
        .map((currency) => {
          const hasPrice = pricedCurrencies.has(currency.currency);
          const disabled =
            currency.currency === disabledCurrency ||
            (showNoPriceItems && !hasPrice);
          return {
            currency: currency.currency,
            iconUrl: currency.iconUrl,
            disabled,
            note: showNoPriceItems && !hasPrice ? "No price" : undefined,
          };
        }),
    [currencies, disabledCurrency, pricedCurrencies, showNoPriceItems],
  );

  return (
    <CurrencyDropdown
      options={options}
      selectedCurrency={selectedCurrency}
      onSelect={onChange}
    />
  );
}
