import { statusMap as defaultStatusMap } from "../../utils/statusMap.js";

function StatusBadge({
    status,
    statusMap = defaultStatusMap,
    size = "small",
 })
{
    const config = statusMap[status] || {
        label: status || "Desconhecido",
        className: "border border-slate-200 bg-slate-100 text-slate-600",
    };

    const sizeClass =
        size === "medium"
            ? "px-3 py-1 text-sm"
            : "px-3 py-1 text-xs";

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}
        >
            {config.label}
        </span>
    );
}

export default StatusBadge;