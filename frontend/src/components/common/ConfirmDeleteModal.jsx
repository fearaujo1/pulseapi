import { AlertTriangle, X } from "lucide-react";

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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-xl rounded-[28px] bg-white shadow-2xl">
                <div className="flex items-start justify-between px-8 pt-8">
                    <div>
                        <h2 className="text-[20px] font-bold text-slate-900">
                            {title}
                        </h2>

                        <p className="mt-2 text-[13px] text-slate-500">
                            {description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Fechar modal"
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="px-8 pb-8 pt-6">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                        <div className="flex gap-3">
                            <AlertTriangle
                                className="mt-0.5 shrink-0 text-red-600"
                                size={22}
                            />

                            <div>
                                <p className="text-[14.5px] font-semibold text-red-700">
                                    Atenção
                                </p>
                                <p className="mt-2 text-[13px] text-red-700/90">
                                    {warningMessage}
                                </p>
                            </div>
                        </div>
                    </div>

                    {(itemName || details.length > 0) && (
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-[13px] text-slate-500">
                                {itemLabel}
                            </p>

                            {itemName && (
                                <p className="mt-2 text-[16px] font-semibold text-slate-900">
                                    {itemName}
                                </p>
                            )}

                            {details.length > 0 && (
                                <div className="mt-3 space-y-1.5">
                                    {details.map((detail, index) => (
                                        <p
                                            key={`${detail.label}-${index}`}
                                            className="text-[13px] text-slate-600"
                                        >
                                            <span className="font-medium">
                                                {detail.label}:
                                            </span>{" "}
                                            {detail.value ?? "-"}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-6 text-[13.5px] font-semibold text-slate-700
                            transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className="h-10 rounded-xl b-red-600 px-6 text-[13.5px] font-semibold text-white transition hover:bg-red-700
                            disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? loadingText : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal;