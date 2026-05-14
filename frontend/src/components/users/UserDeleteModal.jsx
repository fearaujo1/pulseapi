import { AlertTriangle, X } from "lucide-react";

function UserDeleteModal({
                             isOpen,
                             onClose,
                             onConfirm,
                             loading = false,
                             usuario = null,
                         }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-xl rounded-[28px] bg-white shadow-2xl">
                <div className="flex items-start justify-between px-8 pt-8">
                    <div>
                        <h2 className="text-[20px] font-bold text-slate-900">
                            Excluir Usuário
                        </h2>
                        <p className="mt-2 text-[13px] text-slate-500">
                            Confirme a exclusão deste usuário do sistema
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-70"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="px-8 pb-8 pt-6">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                        <div className="flex gap-3">
                            <AlertTriangle className="mt-0.5 text-red-600" size={22} />

                            <div>
                                <p className="text-[14.5px] font-semibold text-red-700">
                                    Atenção: esta ação não pode ser desfeita.
                                </p>

                                <p className="mt-2 text-[13px] text-red-700/90">
                                    O usuário será removido permanentemente do sistema.
                                </p>
                            </div>
                        </div>
                    </div>

                    {usuario && (
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-[13px] text-slate-500">Usuário selecionado</p>

                            <p className="mt-2 text-[16px] font-semibold text-slate-900">
                                {usuario.nome}
                            </p>

                            <p className="mt-1 text-[13px] text-slate-600">
                                {usuario.email}
                            </p>

                            <p className="mt-1 text-[13px] text-slate-600">
                                Perfil: {usuario.perfil}
                            </p>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-6 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-70 text-[13.5px]"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className="h-10 rounded-xl bg-red-600 px-6 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 text-[13.5px]"
                        >
                            {loading ? "Excluindo..." : "Excluir Usuário"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserDeleteModal;