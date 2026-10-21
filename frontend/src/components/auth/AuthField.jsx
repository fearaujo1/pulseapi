import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
                       autoFocus = false,
                   }) {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && mostrarSenha ? "text" : type;

    return (
        <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </span>

            <span
                className={`flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-100 ${
                    compact ? "h-10" : "h-11"
                } ${disabled ? "bg-slate-50 opacity-70" : ""}`}
            >
                {Icon && (
                    <Icon
                        size={compact ? 16 : 17}
                        strokeWidth={1.8}
                        className="shrink-0 text-slate-400"
                    />
                )}

                <input
                    name={name}
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    autoComplete={autoComplete}
                    disabled={disabled}
                    required={required}
                    autoFocus={autoFocus}
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none focus:outline-none focus-visible:outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setMostrarSenha((atual) => !atual)}
                        disabled={disabled}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                        title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {mostrarSenha ? (
                            <EyeOff size={16} />
                        ) : (
                            <Eye size={16} />
                        )}
                    </button>
                )}
            </span>
        </label>
    );
}

export default AuthField;
