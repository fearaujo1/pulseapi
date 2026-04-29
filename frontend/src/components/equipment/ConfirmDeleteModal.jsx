import { AlertTriangle, X } from "lucide-react";

function ConfirmDeleteModal({
                                isOpen,
                                onClose,
                                onConfirm,
                                loading = false,
                                equipamento = null,
                            }) {
    if (!isOpen || !equipamento) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-xl rounded-[28px] bg-white shadow-2xl">
                <div className="flex items-start justify-between px-8 pt-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                            <AlertTriangle size={24} />
                        </div>

                        <div>
                            <h2 className="text-[20px] font-bold text-slate-900">
                                Excluir Equipamento
                            </h2>
                            <p className="mt-2 text-[15px] text-slate-500">
                                Essa ação não poderá ser desfeita.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="px-8 pt-6">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-[14px] text-slate-700">
                            Você está prestes a excluir o equipamento:
                        </p>

                        <div className="mt-4 space-y-2">
                            <p className="text-[14px] font-semibold text-slate-900">
                                {equipamento.nome || "-"}
                            </p>
                            <p className="text-[13.5px] text-slate-500">
                                Código: {equipamento.codigo || "-"}
                            </p>
                            <p className="text-[13.5px] text-slate-500">
                                Tipo: {equipamento.tipo || "-"}
                            </p>
                            <p className="text-[13.5px] text-slate-500">
                                Setor: {equipamento.setor || "-"}
                            </p>

                            <p className="text-[13.5px] text-slate-500">
                                IP: {equipamento.ip || "-"}
                            </p>
                            <p className="text-[13.5px] text-slate-500">
                                Porta: {equipamento.porta || "-"}
                            </p>
                            <p className="text-[13.5px] text-slate-500">
                                Protocolo: {equipamento.protocolo || "-"}
                            </p>

                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 px-8 pb-8">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-6 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 text-[13.5px]"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="h-10 rounded-xl bg-red-600 px-6 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 text-[13.5px]"
                    >
                        {loading ? "Excluindo..." : "Excluir Equipamento"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal;