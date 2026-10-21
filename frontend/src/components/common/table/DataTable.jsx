import TableEmptyState from "./TableEmptyState.jsx";
import TableSkeleton from "./TableSkeleton.jsx";

function DataTable({
                       columns = [],
                       data = [],
                       loading = false,
                       skeletonRows = 5,
                       minWidth = "56rem",
                       rowKey = (row) => row.id,
                       emptyTitle = "Nenhum registro encontrado",
                       emptyDescription = "Não existem registros para exibir.",
                       emptyIcon,
                       onRowClick,
                       rowClassName,
                   }) {
    if (loading) {
        return (
            <TableSkeleton
                rows={skeletonRows}
                columns={columns.length}
                minWidth={minWidth}
                actionColumn={columns.some(
                    (column) =>
                        column.type === "actions"
                )}
            />
        );
    }

    if (data.length === 0) {
        return (
            <TableEmptyState
                title={emptyTitle}
                description={emptyDescription}
                icon={emptyIcon}
            />
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table
                    className="w-full"
                    style={{ minWidth }}
                >
                    <thead className="border-b border-slate-200 bg-slate-50/80">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className={`
                                        whitespace-nowrap px-4 py-3
                                        text-[10px] font-semibold
                                        uppercase tracking-wider
                                        text-slate-500
                                        ${obterAlinhamento(
                                    column.align
                                )}
                                        ${
                                    column.headerClassName ||
                                    ""
                                }
                                    `}
                                style={{
                                    width: column.width,
                                }}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                    {data.map((row, rowIndex) => {
                        const clickable =
                            Boolean(onRowClick);

                        const customRowClass =
                            typeof rowClassName ===
                            "function"
                                ? rowClassName(
                                    row,
                                    rowIndex
                                )
                                : rowClassName || "";

                        function handleKeyDown(event) {
                            if (
                                !clickable ||
                                event.target !==
                                event.currentTarget
                            ) {
                                return;
                            }

                            if (
                                event.key === "Enter" ||
                                event.key === " "
                            ) {
                                event.preventDefault();
                                onRowClick(row);
                            }
                        }

                        return (
                            <tr
                                key={obterChave(
                                    row,
                                    rowKey,
                                    rowIndex
                                )}
                                onClick={
                                    clickable
                                        ? () =>
                                            onRowClick(
                                                row
                                            )
                                        : undefined
                                }
                                onKeyDown={
                                    handleKeyDown
                                }
                                tabIndex={
                                    clickable
                                        ? 0
                                        : undefined
                                }
                                className={`
                                        transition
                                        hover:bg-slate-50/80
                                        focus-visible:outline-none
                                        focus-visible:ring-2
                                        focus-visible:ring-inset
                                        focus-visible:ring-blue-500/40
                                        ${
                                    clickable
                                        ? "cursor-pointer"
                                        : ""
                                }
                                        ${customRowClass}
                                    `}
                            >
                                {columns.map(
                                    (column) => (
                                        <td
                                            key={
                                                column.key
                                            }
                                            className={`
                                                    px-4 py-3.5
                                                    text-xs text-slate-600
                                                    ${obterAlinhamento(
                                                column.align
                                            )}
                                                    ${
                                                column.cellClassName ||
                                                ""
                                            }
                                                `}
                                        >
                                            {column.render
                                                ? column.render(
                                                    row,
                                                    rowIndex
                                                )
                                                : row[
                                                    column
                                                        .key
                                                    ] ??
                                                "—"}
                                        </td>
                                    )
                                )}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function obterChave(item, rowKey, index) {
    if (typeof rowKey === "function") {
        return rowKey(item, index);
    }

    return (
        item?.[rowKey] ??
        item?.id ??
        index
    );
}

function obterAlinhamento(align) {
    const alinhamentos = {
        center: "text-center",
        right: "text-right",
        left: "text-left",
    };

    return (
        alinhamentos[align] ||
        alinhamentos.left
    );
}

export function TablePrimaryText({
                                     children,
                                     title,
                                     className = "",
                                 }) {
    return (
        <p
            title={title}
            className={`
                truncate text-xs
                font-semibold text-slate-900
                ${className}
            `}
        >
            {children ?? "—"}
        </p>
    );
}

export function TableSecondaryText({
                                       children,
                                       title,
                                       className = "",
                                   }) {
    if (
        children === null ||
        children === undefined ||
        children === ""
    ) {
        return null;
    }

    return (
        <p
            title={title}
            className={`
                mt-0.5 truncate
                text-[10px] text-slate-500
                ${className}
            `}
        >
            {children}
        </p>
    );
}

export function TableText({
                              children,
                              title,
                              className = "",
                          }) {
    return (
        <span
            title={title}
            className={`
                block truncate
                text-xs text-slate-600
                ${className}
            `}
        >
            {children ?? "—"}
        </span>
    );
}

export function TableActions({
                                 children,
                                 align = "right",
                             }) {
    return (
        <div
            className={`
                flex items-center gap-1.5
                ${
                align === "left"
                    ? "justify-start"
                    : align === "center"
                        ? "justify-center"
                        : "justify-end"
            }
            `}
            onClick={(event) =>
                event.stopPropagation()
            }
        >
            {children}
        </div>
    );
}

export default DataTable;