import { statusMap } from "../../utils/statusMap.js";

function StatusBadge({ status }) {
    const config = statusMap[status] || {
        label: status | "Desconhecido",
        className: "bg-gray-100 text-gray-700 border border-gray-200",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}

export default StatusBadge;