function FormField({
                       label,
                       children,
                       className = "",
                       required = false,
                       error = "",
                       hint = "",
                   }) {
    return (
        <label className={`block min-w-0 ${className}`}>
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </span>

            {children}

            {error ? (
                <span className="mt-1 block text-[10px] text-red-600">
                    {error}
                </span>
            ) : hint ? (
                <span className="mt-1 block text-[10px] text-slate-400">
                    {hint}
                </span>
            ) : null}
        </label>
    );
}

export default FormField;
