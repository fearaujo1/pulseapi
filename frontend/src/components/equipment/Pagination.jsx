function Pagination({
    currentPage,
    totalPages,
    onPageChange,
                    }) {
    if (totalPages <= 1) return null;

    function getPages() {
        const pages = [];

        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }

        return pages;
    }

    return (
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
                Página {currentPage} de {totalPages}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Anterior
                </button>

                {getPages().map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition ${
                            currentPage === page
                                ? "bg-blue-600 text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Próxima
                </button>
            </div>
        </div>
    );
}

export default Pagination;