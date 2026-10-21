import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (!totalPages || totalPages <= 1) {
        return null;
    }

    return (
        <nav
            className="mt-4 flex items-center justify-end gap-1"
            aria-label="Paginação"
        >
            <PageButton
                title="Página anterior"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeft size={13} />
            </PageButton>

            {montarPaginas(currentPage, totalPages).map((pagina, index) =>
                pagina === "..." ? (
                    <span
                        key={`reticencias-${index}`}
                        className="flex h-7 min-w-6 items-center justify-center text-[10px] text-slate-400"
                    >
                        …
                    </span>
                ) : (
                    <PageButton
                        key={pagina}
                        active={pagina === currentPage}
                        title={`Página ${pagina}`}
                        onClick={() => onPageChange(pagina)}
                    >
                        {pagina}
                    </PageButton>
                )
            )}

            <PageButton
                title="Próxima página"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <ChevronRight size={13} />
            </PageButton>
        </nav>
    );
}

function PageButton({ children, active, disabled, onClick, title }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${
                active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
        >
            {children}
        </button>
    );
}

function montarPaginas(atual, total) {
    if (total <= 5) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }
    if (atual <= 3) {
        return [1, 2, 3, 4, "...", total];
    }
    if (atual >= total - 2) {
        return [1, "...", total - 3, total - 2, total - 1, total];
    }
    return [1, "...", atual - 1, atual, atual + 1, "...", total];
}

export default Pagination;
