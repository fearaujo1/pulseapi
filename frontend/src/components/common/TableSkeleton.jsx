function TableSkeleton({
                           rows = 5,
                           columns = 6,
                           minWidth = "900px",
                       }) {
    return (
        <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table
                    className="w-full"
                    style={{ minWidth }}
                >
                    <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                        {Array.from({ length: columns }).map((_, index) => (
                            <th
                                key={index}
                                className="px-6 py-4"
                            >
                                <div
                                    className={`h-4 rounded bg-slate-200 ${
                                        index === 0 ? "w-20" : "w-14"
                                    }`}
                                />
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="border-b border-slate-100 last:border-b-0"
                        >
                            {Array.from({ length: columns }).map(
                                (_, columnIndex) => (
                                    <td
                                        key={columnIndex}
                                        className="px-6 py-5"
                                    >
                                        {columnIndex === columns - 1 ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-9 w-9 rounded-xl bg-slate-200" />
                                                <div className="h-9 w-9 rounded-xl bg-slate-200" />
                                            </div>
                                        ) : columnIndex === columns - 2 ? (
                                            <div className="h-7 w-24 rounded-full bg-slate-200" />
                                        ) : (
                                            <div
                                                className={`h-4 rounded bg-slate-200 ${
                                                    columnIndex === 0
                                                        ? "w-40"
                                                        : "w-24"
                                                }`}
                                            />
                                        )}
                                    </td>
                                )
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TableSkeleton;