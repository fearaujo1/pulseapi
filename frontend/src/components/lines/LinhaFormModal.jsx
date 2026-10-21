import { useEffect, useState } from "react";
import { ChevronDown, Network, X, Loader2 } from "lucide-react";
import { Button, IconButton } from "../common/Button.jsx";

function LinhaFormModal({
                            isOpen,
                            onClose,
                            onSubmit,
                            planta,
                            initialData = null,
                            loading = false,
                        }) {
    const [formData, setFormData] = useState(() => criarFormInicial(initialData));
    const isEditMode = Boolean(initialData?.id);

    // Reinicializa o formulário ao abrir ou mudar os dados iniciais
    useEffect(() => {
        if (isOpen) setFormData(criarFormInicial(initialData));
    }, [isOpen, initialData]);

    // Gerencia o fechamento via tecla Escape e trava o scroll do body
    useEffect(() => {
        if (!isOpen) return undefined;

        function fechar(event) {
            if (event.key === "Escape" && !loading) onClose();
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
        setFormData((anterior) => ({ ...anterior, [name]: value }));
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) onClose();
            }}
        >
            <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">

                {/* HEADER */}
                <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Network size={19} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {isEditMode ? "Editar linha" : "Nova linha"}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Planta: <strong className="text-slate-700">{planta?.nome}</strong>
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

                {/* FORMULÁRIO */}
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit({ ...formData, plantaId: planta.id });
                    }}
                >
                    <div className="space-y-4 px-6 py-5">
                        {/* Inputs: Nome e Código */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Campo
                                label="Nome da linha"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                placeholder="Linha de Codificação 01"
                                required
                            />
                            <Campo
                                label="Código"
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleChange}
                                placeholder="LIN01"
                                required
                            />
                        </div>

                        {/* Input: Descrição */}
                        <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Descrição
              </span>
                            <textarea
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Descreva a finalidade da linha"
                                className="min-h-20 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none placeholder:text-[10.5px] placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                            />
                        </label>

                        {/* Input: Status */}
                        <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Status <span className="text-red-500">*</span>
              </span>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-9 text-xs outline-none focus:border-blue-500"
                                >
                                    <option value="ATIVA">Ativa</option>
                                    <option value="INATIVA">Inativa</option>
                                </select>
                                <ChevronDown
                                    size={15}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                            </div>
                        </label>
                    </div>

                    {/* FOOTER */}
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
                            disabled={!planta?.id}
                            className="min-w-32"
                        >
                            {isEditMode
                                ? "Salvar alterações"
                                : "Criar linha"}
                        </Button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

// Sub-componente auxiliar para Campos de Texto
function Campo({ label, required = false, ...props }) {
    return (
        <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
          {required && <span className="ml-1 text-red-500">*</span>}
      </span>
            <input
                {...props}
                required={required}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none placeholder:text-[10.5px] placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
            />
        </label>
    );
}

// Função auxiliar de estado inicial
function criarFormInicial(data) {
    return {
        nome: data?.nome || "",
        codigo: data?.codigo || "",
        descricao: data?.descricao || "",
        status: data?.status || "ATIVA",
    };
}

export default LinhaFormModal;
