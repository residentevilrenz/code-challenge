import { useEffect, useMemo, useState } from "react";
import { usePrices } from "../hooks/usePrices";
import { TokenSelect } from "./TokenSelect";
import { AmountInput } from "./AmountInput";

function formatNumber(num: number): string {
  if (num === 0) return "0";
  if (num < 0.0001) return num.toExponential(4);
  if (num < 1) return num.toPrecision(6);
  return num.toLocaleString("en-US", {
    maximumFractionDigits: 6,
    minimumFractionDigits: 2,
  });
}

export function SwapForm() {
  const { tokens, currencies, loading, error } = usePrices();
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [fromAmount, setFromAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showNoPriceItems, setShowNoPriceItems] = useState(
    String(import.meta.env.SHOW_NO_PRICE_ITEMS ?? "true").toLowerCase() !==
      "false",
  );

  const pricedCurrencies = useMemo(
    () => new Set(tokens.map((token) => token.currency)),
    [tokens],
  );

  const defaultFromCurrency = useMemo(() => {
    if (tokens.length === 0) return "";
    return tokens.find((t) => t.currency === "ETH")?.currency ?? tokens[0].currency;
  }, [tokens]);

  const defaultToCurrency = useMemo(() => {
    if (tokens.length === 0) return "";
    const preferred =
      tokens.find((t) => t.currency === "USDC" && t.currency !== defaultFromCurrency)
        ?.currency ?? "";
    if (preferred) return preferred;
    return tokens.find((t) => t.currency !== defaultFromCurrency)?.currency ?? "";
  }, [tokens, defaultFromCurrency]);

  const activeFromCurrency = fromCurrency || defaultFromCurrency;
  const activeToCurrency = toCurrency || defaultToCurrency;

  useEffect(() => {
    if (showNoPriceItems) return;
    if (fromCurrency && !pricedCurrencies.has(fromCurrency)) {
      setFromCurrency("");
    }
    if (toCurrency && !pricedCurrencies.has(toCurrency)) {
      setToCurrency("");
    }
  }, [fromCurrency, pricedCurrencies, showNoPriceItems, toCurrency]);

  const fromToken = tokens.find((t) => t.currency === activeFromCurrency);
  const toToken = tokens.find((t) => t.currency === activeToCurrency);

  const toAmount = useMemo(() => {
    const amount = parseFloat(fromAmount);
    if (!amount || !fromToken || !toToken || toToken.price === 0) return "";
    const result = (amount * fromToken.price) / toToken.price;
    return formatNumber(result);
  }, [fromAmount, fromToken, toToken]);

  const exchangeRate = useMemo(() => {
    if (!fromToken || !toToken || toToken.price === 0) return null;
    const rate = fromToken.price / toToken.price;
    return `1 ${activeFromCurrency} ≈ ${formatNumber(rate)} ${activeToCurrency}`;
  }, [fromToken, toToken, activeFromCurrency, activeToCurrency]);

  const canSubmit =
    !submitting &&
    fromAmount !== "" &&
    parseFloat(fromAmount) > 0 &&
    activeFromCurrency !== activeToCurrency &&
    !!fromToken &&
    !!toToken;

  function handleSwap() {
    setRotation((r) => r + 180);
    setFromCurrency(activeToCurrency);
    setToCurrency(activeFromCurrency);
    // Convert toAmount back to become the new fromAmount
    const parsed = parseFloat(toAmount.replace(/,/g, ""));
    setFromAmount(parsed && isFinite(parsed) ? String(parsed) : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSuccess(false);
    setSubmitError(null);

    // Fake API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Random failure (10–20% chance)
    const failureChance = 0.1 + Math.random() * 0.1;
    if (Math.random() < failureChance) {
      setSubmitting(false);
      setSubmitError("Transaction failed. Please try again.");
      return;
    }

    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-red-200/70 via-rose-100/70 to-white backdrop-blur-lg border border-rose-300/60">
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-rose-700">Loading...</span>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-red-200/70 via-rose-100/70 to-white backdrop-blur-lg border border-red-300/50">
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">Failed to load token prices</p>
          <p className="text-rose-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto rounded-2xl bg-gradient-to-br from-red-200/70 via-rose-100/70 to-white backdrop-blur-lg border border-rose-300/60 shadow-2xl shadow-red-200/40"
    >
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-rose-900">Swap</h2>
          <button
            type="button"
            onClick={() => setShowNoPriceItems((prev) => !prev)}
            aria-pressed={showNoPriceItems}
            className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
              showNoPriceItems
                ? "border-rose-500 bg-rose-500 text-white hover:bg-rose-400"
                : "border-rose-300 bg-white/70 text-rose-700 hover:bg-rose-50"
            }`}
          >
            {showNoPriceItems ? "Hide" : "Show"} No price items
          </button>
        </div>
      </div>

      {/* From section */}
      <div className="m-4 p-4 rounded-xl bg-white/75 border border-rose-200/80">
        <div className="flex items-center justify-between gap-3">
          <AmountInput
            label="You pay"
            value={fromAmount}
            onChange={setFromAmount}
          />
          <TokenSelect
            tokens={tokens}
            currencies={currencies}
            selectedCurrency={activeFromCurrency}
            onChange={setFromCurrency}
            disabledCurrency={activeToCurrency}
            showNoPriceItems={showNoPriceItems}
          />
        </div>
      </div>

      {/* Swap button */}
      <div className="flex justify-center -my-3 relative z-10">
        <button
          type="button"
          onClick={handleSwap}
          className="w-10 h-10 rounded-xl bg-white border-4 border-rose-100 flex items-center justify-center hover:bg-rose-50 transition-all duration-200 cursor-pointer group shadow-sm"
          aria-label="Swap tokens"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-rose-500 group-hover:text-rose-700 transition-transform duration-300"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* To section */}
      <div className="m-4 p-4 rounded-xl bg-white/75 border border-rose-200/80">
        <div className="flex items-center justify-between gap-3">
          <AmountInput
            label="You receive"
            value={toAmount}
            readOnly
          />
          <TokenSelect
            tokens={tokens}
            currencies={currencies}
            selectedCurrency={activeToCurrency}
            onChange={setToCurrency}
            disabledCurrency={activeFromCurrency}
            showNoPriceItems={showNoPriceItems}
          />
        </div>
      </div>

      {/* Exchange rate */}
      {exchangeRate && (
        <div className="px-5 pb-2 text-center">
          <span className="text-xs text-rose-700">{exchangeRate}</span>
        </div>
      )}

      {/* Submit button */}
      <div className="p-4 pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 cursor-pointer ${
            canSubmit
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-400/30"
              : "bg-rose-100 text-rose-400 cursor-not-allowed"
          }`}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Swapping...
            </span>
          ) : activeFromCurrency === activeToCurrency ? (
            "Select different tokens"
          ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
            "Enter an amount"
          ) : (
            "Confirm Swap"
          )}
        </button>
      </div>

      {/* Error message */}
      {submitError && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="p-3 rounded-xl bg-red-100/70 border border-red-300/50 text-center flex items-center justify-center gap-2">
            <span className="text-red-700 text-sm font-medium">{submitError}</span>
            <button
              type="submit"
              className="text-red-700 text-sm font-semibold underline underline-offset-2 hover:text-red-800 cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-300/50 text-center">
            <span className="text-emerald-700 text-sm font-medium">
              ✓ Swap successful! {fromAmount} {activeFromCurrency} → {toAmount}{" "}
              {activeToCurrency}
            </span>
          </div>
        </div>
      )}
    </form>
  );
}
