interface AmountInputProps {
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  label: string;
  placeholder?: string;
}

export function AmountInput({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  label,
  placeholder = "0.00",
}: AmountInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Allow empty string, digits, and one decimal point
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      onChange?.(raw);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-rose-600 uppercase tracking-wide">
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`bg-transparent text-2xl font-medium text-rose-900 outline-none w-full placeholder:text-rose-300 ${
          readOnly ? "cursor-default" : ""
        }`}
      />
    </div>
  );
}
