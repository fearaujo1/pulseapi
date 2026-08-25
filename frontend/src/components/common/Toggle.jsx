function Toggle({
                    checked,
                    onChange,
                    disabled = false,
                    label = "Alternar opção",
                }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative h-7 w-12 rounded-full transition ${
                checked ? "bg-blue-600" : "bg-slate-300"
            } disabled:cursor-not-allowed disabled:opacity-60`}
        >
            <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    checked ? "left-6" : "left-1"
                }`}
            />
        </button>
    );
}

export default Toggle;