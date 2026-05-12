import { useEffect, useState } from "react";
import type { Token, TokenPrice } from "../types";

const PRICES_URL =
  import.meta.env.VITE_PRICES_URL ?? "https://interview.switcheo.com/prices.json";
const GITHUB_TOKENS_URL =
  import.meta.env.VITE_GITHUB_TOKENS_URL ??
  "https://api.github.com/repos/Switcheo/token-icons/contents/tokens";

let cachedTokens: Token[] | null = null;
let inFlightRequest: Promise<Token[]> | null = null;
let cachedCurrencies: Token[] | null = null;
let inFlightCurrenciesRequest: Promise<Token[]> | null = null;

async function loadTokens(): Promise<Token[]> {
  if (cachedTokens) return cachedTokens;
  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = (async () => {
    const res = await fetch(PRICES_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: TokenPrice[] = await res.json();

    // Filter invalid prices, deduplicate by currency (keep most recent)
    const map = new Map<string, TokenPrice>();
    for (const entry of data) {
      if (!entry.price || entry.price <= 0) continue;
      const existing = map.get(entry.currency);
      if (!existing || new Date(entry.date) > new Date(existing.date)) {
        map.set(entry.currency, entry);
      }
    }

    const tokenList: Token[] = Array.from(map.values())
      .map((t) => ({
        currency: t.currency,
        price: t.price,
        iconUrl: "",
      }))
      .sort((a, b) => a.currency.localeCompare(b.currency));

    cachedTokens = tokenList;
    return tokenList;
  })();

  try {
    return await inFlightRequest;
  } finally {
    inFlightRequest = null;
  }
}

async function loadAllCurrencies(): Promise<Token[]> {
  if (cachedCurrencies) return cachedCurrencies;
  if (inFlightCurrenciesRequest) return inFlightCurrenciesRequest;

  inFlightCurrenciesRequest = (async () => {
    const res = await fetch(GITHUB_TOKENS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Array<{
      name: string;
      download_url: string | null;
    }>;

    const currencyList = data
      .filter((file) => file.name.endsWith(".svg"))
      .map((file) => ({
        currency: file.name.replace(/\.svg$/, ""),
        price: 0,
        iconUrl: file.download_url ?? "",
      }))
      .sort((a, b) => a.currency.localeCompare(b.currency));

    cachedCurrencies = currencyList;
    return currencyList;
  })();

  try {
    return await inFlightCurrenciesRequest;
  } finally {
    inFlightCurrenciesRequest = null;
  }
}

export function usePrices() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currencies, setCurrencies] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      try {
        const [tokenList, currencyList] = await Promise.all([
          loadTokens(),
          loadAllCurrencies().catch(() => [] as Token[]),
        ]);
        const iconUrlByCurrency = new Map(
          currencyList.map((currency) => [currency.currency, currency.iconUrl]),
        );
        const tokensWithIcons = tokenList.map((token) => ({
          ...token,
          iconUrl: iconUrlByCurrency.get(token.currency) ?? token.iconUrl,
        }));
        const fallbackCurrencyList = tokensWithIcons.map((token) => ({
          currency: token.currency,
          price: token.price,
          iconUrl: token.iconUrl,
        }));

        if (!cancelled) {
          setTokens(tokensWithIcons);
          setCurrencies(
            currencyList.length > 0 ? currencyList : fallbackCurrencyList,
          );
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch prices");
          setLoading(false);
        }
      }
    }

    fetchPrices();
    return () => {
      cancelled = true;
    };
  }, []);

  return { tokens, currencies, loading, error };
}
