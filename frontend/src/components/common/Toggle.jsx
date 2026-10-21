function Toggle({
                    checked,
                    onChange,
                    disabled = false,
                    label = "Alternar opção",
                    size = "small",
                }) {
    const medium = size === "medium";

    return (
        <button
            type="button"
            role="switch"
            aria-checked={Boolean(checked)}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                medium ? "h-6 w-11" : "h-5 w-9"
            } ${checked ? "bg-blue-600" : "bg-slate-300"}`}
        >
            <span
                className={`absolute rounded-full bg-white shadow-sm transition-all ${
                    medium
                        ? `top-1 h-4 w-4 ${checked ? "left-6" : "left-1"}`
                        : `top-0.5 h-4 w-4 ${checked ? "left-[18px]" : "left-0.5"}`
                }`}
            />
        </button>
    );
}

export default Toggle;
