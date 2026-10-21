import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import {
    Button,
    IconButton,
} from "./Button.jsx";

function ConfirmDeleteModal({
                                isOpen,
                                onClose,
                                onConfirm,
                                loading = false,
                                title = "Confirmar exclusão",
                                description = "Confirme a exclusão deste registro.",
                                warningMessage = "Esta ação não poderá ser desfeita.",
                                itemLabel = "Registro selecionado",
                                itemName = "",
                                details = [],
                                confirmText = "Excluir",
                                loadingText = "Excluindo...",
                            }) {
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        function fecharComEscape(event) {
            if (event.key === "Escape" && !loading) {
                onClose();
            }
        }

        document.addEventListener("keydown", fecharComEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", fecharComEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, loading, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
            >
                <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {title}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            {description}
                        </p>
                    </div>

                    <IconButton
                        icon={X}
                        variant="ghost"
                        size="medium"
                        onClick={onClose}
                        disabled={loading}
                        title="Fechar modal"
                    />
                </header>

                <div className="space-y-4 px-6 py-5">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex gap-3">
                            <AlertTriangle
                                size={18}
                                className="mt-0.5 shrink-0 text-red-600"
                            />
                            <div>
                                <p className="text-xs font-semibold text-red-700">
                                    Atenção
                                </p>
                                <p className="mt-1 text-[11px] leading-5 text-red-700/90">
                                    {warningMessage}
                                </p>
                            </div>
                        </div>
                    </div>

                    {(itemName || details.length > 0) && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                {itemLabel}
                            </p>

                            {itemName && (
                                <p className="mt-1.5 text-sm font-semibold text-slate-900">
                                    {itemName}
                                </p>
                            )}

                            {details.length > 0 && (
                                <dl className="mt-3 grid gap-1.5">
                                    {details.map((detail, index) => (
                                        <div
                                            key={`${detail.label}-${index}`}
                                            className="flex gap-2 text-[11px]"
                                        >
                                            <dt className="font-medium text-slate-500">
                                                {detail.label}:
                                            </dt>
                                            <dd className="min-w-0 truncate text-slate-700">
                                                {detail.value ?? "—"}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            )}
                        </div>
                    )}
                </div>

                <footer className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="danger"
                        size="small"
                        onClick={onConfirm}
                        loading={loading}
                        loadingText={loadingText}
                        className="min-w-28"
                    >
                        {confirmText}
                    </Button>
                </footer>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal;
