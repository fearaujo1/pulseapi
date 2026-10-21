function TableSkeleton({
                           rows = 5,
                           columns = 6,
                           minWidth = "56rem",
                           actionColumn = true,
                       }) {
    return (
        <div className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table
                    className="w-full"
                    style={{ minWidth }}
                >
                    <thead className="border-b border-slate-200 bg-slate-50/80">
                    <tr>
                        {Array.from({
                            length: columns,
                        }).map((_, index) => (
                            <th
                                key={index}
                                className="px-4 py-3"
                            >
                                <div
                                    className={`
                                            h-2.5 rounded
                                            bg-slate-200
                                            ${
                                        index === 0
                                            ? "w-16"
                                            : "w-12"
                                    }
                                        `}
                                />
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                    {Array.from({
                        length: rows,
                    }).map(
                        (_, rowIndex) => (
                            <tr key={rowIndex}>
                                {Array.from({
                                    length:
                                    columns,
                                }).map(
                                    (
                                        _,
                                        columnIndex
                                    ) => {
                                        const isActions =
                                            actionColumn &&
                                            columnIndex ===
                                            columns -
                                            1;

                                        const isStatus =
                                            columnIndex ===
                                            columns -
                                            (actionColumn
                                                ? 2
                                                : 1);

                                        return (
                                            <td
                                                key={
                                                    columnIndex
                                                }
                                                className="px-4 py-3.5"
                                            >
                                                {isActions ? (
                                                    <div className="flex justify-end gap-1.5">
                                                        <div className="h-8 w-8 rounded-lg bg-slate-200" />
                                                        <div className="h-8 w-8 rounded-lg bg-slate-200" />
                                                    </div>
                                                ) : isStatus ? (
                                                    <div className="h-5 w-16 rounded-md bg-slate-200" />
                                                ) : (
                                                    <div
                                                        className={`
                                                                h-3 rounded
                                                                bg-slate-200
                                                                ${
                                                            columnIndex ===
                                                            0
                                                                ? "w-32"
                                                                : "w-20"
                                                        }
                                                            `}
                                                    />
                                                )}
                                            </td>
                                        );
                                    }
                                )}
                            </tr>
                        )
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TableSkeleton;