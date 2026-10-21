import {
    statusMaps as defaultStatusMap,
    formatarStatus,
} from "../../config/statusMaps.js";

function StatusBadge({
                         status,
                         statusMap = defaultStatusMap,
                         size = "small",
                         showDot = false,
                     }) {
    const config =
        statusMap[status] || {
            label: formatarStatus(status),
            className:
                "bg-slate-100 text-slate-600 ring-slate-500/20",
        };

    const sizes = {
        compact:
            "rounded-md px-1.5 py-0.5 text-[10px] leading-4",
        small:
            "rounded-md px-2 py-0.5 text-[10px] leading-4",
        medium:
            "rounded-lg px-2.5 py-1 text-xs",
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                whitespace-nowrap font-semibold
                ring-1 ring-inset
                ${sizes[size] || sizes.small}
                ${config.className}
            `}
        >
            {showDot && (
                <span
                    className={`h-1.5 w-1.5 rounded-full ${
                        config.dotClass || "bg-current"
                    }`}
                />
            )}

            {config.label}
        </span>
    );
}

export default StatusBadge;