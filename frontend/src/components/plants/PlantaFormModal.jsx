import { useEffect, useState } from "react";
import {
    Building2,
    ChevronDown,
    MapPin,
    X,
} from "lucide-react";

import {
    Button,
    IconButton,
} from "../common/Button.jsx";

function PlantaFormModal({ isOpen, onClose, onSubmit, initialData = null, loading = false }) {
    const [formData, setFormData] = useState(() =>
        criarFormInicial(initialData));
    const isEditMode = Boolean(initialData?.id);

    useEffect(() => {
        if (isOpen) setFormData(criarFormInicial(initialData));
    }, [isOpen, initialData]);

    useEffect(() => {
        if (!isOpen) return undefined;
        function fechar(event) {
            if (event.key === "Escape" && !loading)
                onClose();
        }
        document.addEventListener("keydown", fechar);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", fechar);
            document.body.style.overflow = "";
        };
    }, [isOpen, loading, onClose]);

    if (!isOpen) return null;

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((anterior) => ({
            ...anterior, [name]: name ===
            "estado" ? value.toUpperCase() : value
        }));
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}>
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
                <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Building2 size={19} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {isEditMode ? "Editar planta" : "Nova planta"}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Cadastre um centro de produção da empresa.
                            </p>
                        </div>
                    </div>
                    <IconButton
                        icon={X}
                        onClick={onClose}
                        disabled={loading}
                        title="Fechar modal"
                    />
                </header>

                <form onSubmit={(event) => { event.preventDefault(); onSubmit(formData); }}>
                    <div className="space-y-5 px-6 py-5">
                        <section className="rounded-xl border border-slate-200 p-4">
                            <div className="mb-4 flex items-center gap-2.5">
                                <Building2 size={16} className="text-slate-500" />
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Identificação
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Campo
                                    label="Nome da planta"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    placeholder="Centro de Produção Londrina"
                                    required
                                />
                                <Campo
                                    label="Código"
                                    name="codigo"
                                    value={formData.codigo}
                                    onChange={handleChange}
                                    placeholder="PL01"
                                    required
                                />
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 p-4">
                            <div className="mb-4 flex items-center gap-2.5">
                                <MapPin
                                    size={16}
                                    className="text-slate-500"
                                />
                                <h3
                                    className="text-sm font-semibold
                                    text-slate-900"
                                >
                                    Localização e status
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Campo
                                        label="Endereço"
                                        name="endereco"
                                        value={formData.endereco}
                                        onChange={handleChange}
                                        placeholder="Avenida Industrial, 1000"
                                    />
                                </div>
                                <Campo
                                    label="Cidade"
                                    name="cidade"
                                    value={formData.cidade}
                                    onChange={handleChange}
                                    placeholder="Londrina"
                                />
                                <Campo
                                    label="Estado"
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    placeholder="PR"
                                    maxLength={2}
                                />
                                <SelectStatus
                                    value={formData.status}
                                    onChange={handleChange}
                                />
                            </div>
                        </section>
                    </div>

                    <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            loading={loading}
                            loadingText="Salvando..."
                            className="min-w-32"
                        >
                            {isEditMode
                                ? "Salvar alterações"
                                : "Criar planta"}
                        </Button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

function Campo({
                   label,
                   required = false,
                   ...props
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
                {required &&
                    <span
                        className="ml-1 text-red-500">*
                    </span>
                }
            </span>
            <input
                {...props}
                required={required}
                className="h-10 w-full rounded-lg border border-slate-200
                    bg-slate-50 px-3 text-xs text-slate-800 outline-none
                    transition placeholder:text-[10.5px] placeholder:text-slate-400
                    focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
            />
        </label>
    ); }

function SelectStatus({
                          value, onChange
}) {
    return (
        <label className="block">
            <span
                className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
                Status
                <span
                    className="text-red-500">*
                </span>
            </span>
            <div className="relative">
                <select
                    name="status"
                    value={value}
                    onChange={onChange}
                    className="h-10 w-full appearance-none rounded-lg
                        border border-slate-200 bg-slate-50 px-3
                        pr-9 text-xs outline-none focus:border-blue-500"
                >
                    <option value="ATIVA">
                        Ativa
                    </option>
                    <option value="INATIVA">
                        Inativa
                    </option>
                </select>
                <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3
                    top-1/2 -translate-y-1/2 text-slate-400"
                />
            </div>
        </label>
    ); }

function criarFormInicial(data) {
    return {
        nome: data?.nome || "",
        codigo: data?.codigo || "",
        endereco: data?.endereco || "",
        cidade: data?.cidade || "",
        estado: data?.estado || "",
        status: data?.status || "ATIVA"
    };
}

export default PlantaFormModal;