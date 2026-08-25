function AuthField({
                       label,
                       icon: Icon,
                       type = "text",
                       placeholder,
                       value,
                       onChange,
                       name,
                       autoComplete,
                       disabled = false,
                       required = false,
                       compact = false,
                   }) {
    return (
        <label className="block">
            <span
                className={`mb-2 block font-semibold text-slate-900 ${
                    compact ? "text-[13.5px]" : "text-lg"
                }`}
            >
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </span>

            <div
                className={`flex items-center gap-3 rounded-2xl bg-slate-100 px-4 transition focus-within:ring-2 focus-within:ring-blue-500 ${
                    compact ? "h-11" : "h-14"
                }`}
            >
                {Icon && (
                    <Icon
                        size={compact ? 18 : 22}
                        className="shrink-0 text-slate-400"
                    />
                )}

                <input
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    autoComplete={autoComplete}
                    disabled={disabled}
                    required={required}
                    className={`w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed ${
                        compact ? "text-[13px]" : "text-base"
                    }`}
                />
            </div>
        </label>
    );
}

export default AuthField;