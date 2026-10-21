import { IconButton } from "../Button.jsx";

function TableActionButton({
                               children,
                               onClick,
                               title,
                               variant = "default",
                               disabled = false,
                               className = "",
                               ...props
                           }) {
    function handleClick(event) {
        event.stopPropagation();

        if (!disabled) {
            onClick?.(event);
        }
    }

    return (
        <IconButton
            size="small"
            variant={converterVariant(variant)}
            disabled={disabled}
            title={title}
            aria-label={title}
            onClick={handleClick}
            className={className}
            {...props}
        >
            {children}
        </IconButton>
    );
}

function converterVariant(variant) {
    const variants = {
        default: "secondary",
        primary: "softPrimary",
        danger: "dangerOutline",
        success: "success",
        warning: "warning",
    };

    return variants[variant] || variants.default;
}

export default TableActionButton;