import { Loader2 } from "lucide-react";

const buttonVariants = {
    primary: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
    danger: "border-transparent bg-red-600 text-white hover:bg-red-700",
    dangerOutline: "border-red-200 bg-white text-red-600 hover:bg-red-50",
    softPrimary: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    ghost: "border-transparent bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    warning: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
};

const buttonSizes = {
    small: "h-9 rounded-lg px-3 text-[11px] gap-1.5",
    medium: "h-10 rounded-lg px-4 text-xs gap-2",
    large: "h-11 rounded-xl px-5 text-sm gap-2",
};

const iconButtonSizes = {
    small: "h-8 w-8 rounded-lg",
    medium: "h-9 w-9 rounded-lg",
    large: "h-10 w-10 rounded-xl",
};

const iconSizes = {
    small: 14,
    medium: 15,
    large: 17,
};

export function Button({
                           children,
                           type = "button",
                           variant = "primary",
                           size = "medium",
                           icon: Icon,
                           iconPosition = "left",
                           loading = false,
                           loadingText,
                           disabled = false,
                           fullWidth = false,
                           className = "",
                           ...props
                       }) {
    const texto =
        loading && loadingText
            ? loadingText
            : children;

    const tamanhoIcone = iconSizes[size] || iconSizes.medium;

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`
                inline-flex shrink-0 items-center
                justify-center border font-semibold
                shadow-sm transition
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${buttonVariants[variant] || buttonVariants.primary}
                ${buttonSizes[size] || buttonSizes.medium}
                ${fullWidth ? "w-full" : ""}
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <Loader2
                    size={tamanhoIcone}
                    className="shrink-0 animate-spin"
                />
            ) : (
                Icon &&
                iconPosition === "left" && (
                    <Icon
                        size={tamanhoIcone}
                        className="shrink-0"
                    />
                )
            )}

            {texto}

            {!loading &&
                Icon &&
                iconPosition === "right" && (
                    <Icon
                        size={tamanhoIcone}
                        className="shrink-0"
                    />
                )}
        </button>
    );
}

export function IconButton({
                               icon: Icon,
                               children,
                               type = "button",
                               variant = "ghost",
                               size = "medium",
                               loading = false,
                               disabled = false,
                               title,
                               className = "",
                               ...props
                           }) {
    const tamanhoIcone =
        iconSizes[size] || iconSizes.medium;

    return (
        <button
            type={type}
            disabled={disabled || loading}
            title={title}
            aria-label={
                props["aria-label"] || title
            }
            className={`
                inline-flex shrink-0 items-center
                justify-center border transition
                disabled:cursor-not-allowed
                disabled:opacity-40
                ${buttonVariants[variant] || buttonVariants.ghost}
                ${iconButtonSizes[size] || iconButtonSizes.medium}
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <Loader2
                    size={tamanhoIcone}
                    className="animate-spin"
                />
            ) : Icon ? (
                <Icon size={tamanhoIcone} />
            ) : (
                children
            )}
        </button>
    );
}

export default Button;