import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

function CustomFilterSelect({
                                value,
                                onChange,
                                options = [],
                                placeholder = "Selecionar",
                                className = "",
                                disabled = false,
                            }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel =
        options.find((option) => option.value === value)?.label || placeholder;

    return (
        <div
            ref={containerRef}
            className={`relative w-full sm:w-40 ${className}`}
        >
            <button
                type="button"
                onClick={() => setOpen((anterior) => !anterior)}
                disabled={disabled}
                aria-expanded={open}
                className={`flex h-9 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    open
                        ? "border-blue-500 ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300"
                }`}
            >
                <span className="truncate text-slate-700">{selectedLabel}</span>
                <ChevronDown
                    size={14}
                    className={`shrink-0 text-slate-400 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && !disabled && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-40 max-h-64 min-w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/10">
                    {options.map((option) => {
                        const selected = option.value === value;

                        return (
                            <button
                                key={`${option.value}-${option.label}`}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className={`flex w-full items-center justify-between gap-4 rounded-lg px-3 py-1.5 text-left text-[11px] transition ${
                                    selected
                                        ? "bg-blue-50 font-semibold text-blue-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                <span className="whitespace-nowrap">{option.label}</span>
                                {selected && <Check size={13} />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default CustomFilterSelect;
