import { useEffect, useState } from "react";
import { Info, X, ChevronDown } from "lucide-react";

const initialForm = {
    codigo: "",
    nome: "",
    tipo: "",
    fabricante: "",
    modelo: "",
    numeroSerie: "",
    setor: "",
    status: "ATIVO",
    ip: "",
    porta: "",
    protocolo: "",
};

function EquipmentFormModal({
                                isOpen,
                                onClose,onSubmit,
                                loading = false,
                                initialData = null,
                                mode = "create",
                            }) {
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (initialData) {
            setFormData({
                codigo: initialData.codigo || "",
                nome: initialData.nome || "",
                tipo: initialData.tipo || "",
                fabricante: initialData.fabricante || "",
                modelo: initialData.modelo || "",
                numeroSerie: initialData.numeroSerie || "",
                setor: initialData.setor || "",
                status: initialData.status || "ATIVO",
                ip: initialData.ip || "",
                porta: initialData.porta || "",
                protocolo: initialData.protocolo || "",
            });
        } else {
            setFormData(initialForm);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        onSubmit(formData);
    }

    const isEditMode = mode === "edit";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-3xl rounded-[28px] bg-white shadow-2xl">
                <div className="flex items-start justify-between px-8 pt-8">
                    <div>
                        <h2 className="text-[20px] font-bold text-slate-900">
                            {isEditMode ? "Editar Equipamento" : "Novo Equipamento"}
                        </h2>
                        <p className="mt-2 text-[13px] text-slate-500">
                            {isEditMode
                                ? "Atualize as informações do equipamento"
                                : "Preencha as informações básicas do equipamento"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                Código do Equipamento *
                            </label>
                            <input
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleChange}
                                placeholder="Ex: EQP-001"
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                Nome do Equipamento *
                            </label>
                            <input
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                placeholder="Ex: Impressora Domino Ax150i"
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                Tipo *
                            </label>
                            <input
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                placeholder="Ex: Impressora Industrial"
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                Setor *
                            </label>
                            <input
                                name="setor"
                                value={formData.setor}
                                onChange={handleChange}
                                placeholder="Ex: Linha 01"
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                Fabricante
                            </label>
                            <input
                                name="fabricante"
                                value={formData.fabricante}
                                onChange={handleChange}
                                placeholder="Ex: Domino"
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                Modelo
                            </label>
                            <input
                                name="modelo"
                                value={formData.modelo}
                                onChange={handleChange}
                                placeholder="Ex: Ax150i"
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                Número de Série
                            </label>
                            <input
                                name="numeroSerie"
                                value={formData.numeroSerie}
                                onChange={handleChange}
                                placeholder="Ex: DOM-AX150I-001"
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                IP
                            </label>
                            <input
                                name="ip"
                                value={formData.ip}
                                onChange={handleChange}
                                placeholder="Ex: 192.168.0.100"
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                Porta
                            </label>
                            <input
                                name="porta"
                                value={formData.porta}
                                onChange={handleChange}
                                placeholder="Ex: 9100"
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                Protocolo
                            </label>
                            <input
                                name="protocolo"
                                value={formData.protocolo}
                                onChange={handleChange}
                                placeholder="Ex: TCP/IP"
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                            />
                        </div>

                    </div>

                    <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                        <div className="flex gap-3">
                            <Info className="mt-0.5 text-blue-600" size={20} />
                            <div>
                                <p className="text-[14.5px] font-semibold text-blue-700">
                                    Próximos passos:
                                </p>
                                <p className="mt-1 text-[12.5px] text-blue-700/90">
                                    Após criar o equipamento, você poderá editar seus dados,
                                    alterar o status e gerenciá-lo diretamente na lista.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-6 font-semibold text-slate-700 hover:bg-slate-50 text-[13.5px]"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-10 rounded-xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 text-[13.5px]"
                        >
                            {loading
                                ? "Salvando..."
                                : isEditMode
                                    ? "Salvar Alterações"
                                    : "Criar Equipamento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EquipmentFormModal;