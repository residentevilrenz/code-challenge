import { useEffect, useMemo, useRef, useState } from "react";

export interface CurrencyDropdownOption {
  currency: string;
  iconUrl: string;
  disabled?: boolean;
  note?: string;
}

interface CurrencyDropdownProps {
  options: CurrencyDropdownOption[];
  selectedCurrency: string;
  onSelect: (currency: string) => void;
}

export function CurrencyDropdown({
  options,
  selectedCurrency,
  onSelect,
}: CurrencyDropdownProps) {
  const [imgError, setImgError] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const selected = useMemo(
    () => options.find((option) => option.currency === selectedCurrency),
    [options, selectedCurrency],
  );

  const filteredOptions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((option) =>
      option.currency.toLowerCase().includes(keyword),
    );
  }, [options, search]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[selectedCurrency]?.scrollIntoView({
      block: "nearest",
      behavior: "auto",
    });
  }, [open, selectedCurrency, filteredOptions]);

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  function renderTokenBadge(iconUrl: string, fallbackCurrency: string) {
    const hasImage = !imgError.has(fallbackCurrency);
    return hasImage ? (
      <img
        src={iconUrl}
        alt={fallbackCurrency}
        className="h-6 w-6 rounded-full"
        onError={() =>
          setImgError((prev) => new Set(prev).add(fallbackCurrency))
        }
      />
    ) : (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-300 text-xs font-bold text-rose-900">
        {fallbackCurrency.charAt(0)}
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-w-[8.5rem] max-w-[10.5rem] items-center gap-2 rounded-lg border border-rose-300/80 bg-white/80 px-2 py-1.5 text-rose-900 transition-colors hover:bg-rose-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected
          ? renderTokenBadge(selected.iconUrl, selected.currency)
          : renderTokenBadge("", selectedCurrency)}
        <span className="min-w-0 flex-1 truncate text-left text-base font-semibold">
          {selectedCurrency || "Select"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-auto h-4 w-4 shrink-0 text-rose-700 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-52 rounded-xl border border-rose-300/80 bg-rose-50 p-1 shadow-2xl shadow-rose-200/50">
          <div className="px-1 pb-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search currency..."
              className="w-full rounded-md border border-rose-300 bg-white px-2 py-1.5 text-sm text-rose-900 outline-none placeholder:text-rose-400 focus:border-rose-500"
            />
          </div>

          <ul
            role="listbox"
            aria-label="Select token"
            className="max-h-64 overflow-y-auto"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-2 py-2 text-sm text-rose-500">No matches</li>
            ) : (
              filteredOptions.map((option) => {
                const active = option.currency === selectedCurrency;
                const disabled = !!option.disabled;
                return (
                  <li key={option.currency}>
                    <button
                      ref={(el) => {
                        optionRefs.current[option.currency] = el;
                      }}
                      type="button"
                      onClick={() => {
                        if (disabled) return;
                        onSelect(option.currency);
                        setOpen(false);
                      }}
                      disabled={disabled}
                      role="option"
                      aria-selected={active}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
                        disabled
                          ? "cursor-not-allowed opacity-40"
                          : active
                            ? "bg-rose-500/80 text-white ring-1 ring-rose-300/70"
                            : "text-rose-900 hover:bg-rose-100"
                      }`}
                    >
                      {renderTokenBadge(option.iconUrl, option.currency)}
                      <span className="text-sm font-semibold">
                        {option.currency}
                      </span>
                      {option.note && (
                        <span className="ml-auto text-[11px] text-rose-500">
                          {option.note}
                        </span>
                      )}
                      {active && (
                        <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5 text-white"
                            aria-hidden="true"
                          >
                            <path d="m5 12 4 4L19 6" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
