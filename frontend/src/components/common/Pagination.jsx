function Pagination({
    currentPage,
    totalPages,
    onPageChange
}) {
    if (totalPages <= 1) return null;

    function handlePageChange(page) {
        if (page < 1 || page > totalPages || page === currentPage) return;

        onPageChange(page);
    }


    function getVisiblePages() {
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            return Array.from(
                {length: totalPages },
                (_, index) => index + 1
            );
        }

        let startPage = Math.max(currentPage - 2, 1);
        let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

        if(endPage - startPage < maxVisiblePages - 1) {
            startPage = endPage - maxVisiblePages + 1;
        }

        return Array.from(
            { length: endPage - startPage + 1 },
            (_, index) => startPage + index
        );
    }

    const visiblePages = getVisiblePages();

    return (
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
                Página {currentPage} de {totalPages}
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm
                    font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Anterior
                </button>

                {visiblePages[0] > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => handlePageChange(1)}
                            className="h-10 min-w-10 rounded-xl border border-slate-200 bg-white px-3 text-sm
                            font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            1
                        </button>

                        {visiblePages[0] > 2 && (
                            <span className="px-1 text-slate-400">...</span>
                        )}
                    </>
                )}

                {visiblePages.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => handlePageChange(page)}
                        aria-current={currentPage === page ? "page" : undefined}
                        className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition ${
                            currentPage === page 
                                ? "bg-blue-600 text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {visiblePages.at(-1) < totalPages && (
                    <>
                        {visiblePages.at(-1) < totalPages - 1 && (
                            <span className="px-1 text-slate-400">...</span>
                        )}

                        <button
                            type="button"
                            onClick={() => handlePageChange(totalPages)}
                            className="h-10 min-w-10 rounded-xl border border-slate-200 bg-white px-3 text-sm
                            font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700
                    transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Próxima
                </button>
            </div>
        </div>
    );
}

export default Pagination;