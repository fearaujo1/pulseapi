function FormField({
                       label,
                       children,
                       className = "",
                       required = false,
                       error = "",
                   }) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </span>

            {children}

            {error && (
                <span className="mt-1 block text-xs text-red-600">
                    {error}
                </span>
            )}
        </label>
    );
}

export default FormField;