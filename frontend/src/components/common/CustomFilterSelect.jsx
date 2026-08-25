import { useEffect, useRef, useState } from "react";
import { ChevronDown, Funnel } from "lucide-react";

function CustomFilterSelect({
                                value,
                                onChange,
                                options = [],
                                placeholder = "Selecionar",
                            }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel =
        options.find((option) => option.value === value)?.label || placeholder;

    return (
        <div ref={containerRef} className="relative min-w-[220px]">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 flex items-center justify-between transition-all duration-200 hover:border-slate-300 ${
                    open ? "border-blue-500 bg-white" : ""
                }`}
            >
                <div className="flex items-center gap-3">
                    <Funnel size={18} className="text-slate-400" />
                    <span className="text-[13.5px] text-slate-800">{selectedLabel}</span>
                </div>

                <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                    {options.map((option) => {
                        const isSelected = option.value === value;

                        return (
                            <button
                                key={`${option.value}-${option.label}`}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-left text-[13.5px] transition-colors ${
                                    isSelected
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-800 hover:bg-slate-50"
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default CustomFilterSelect;