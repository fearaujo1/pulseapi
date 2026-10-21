import { useEffect, useState } from "react";
import {
    ChevronDown,
    Cpu,
    MapPin,
    Network,
    X,
} from "lucide-react";
import { Button, IconButton } from "../common/Button.jsx";
import { plantaService } from "../../services/plantaService";
import { linhaService } from "../../services/linhaService";

function EquipmentFormModal({
                                isOpen,
                                onClose,
                                onSubmit,
                                loading = false,
                                initialData = null,
                                mode = "create",
                            }) {
    const [plantas, setPlantas] = useState([]);
    const [linhas, setLinhas] = useState([]);
    const [plantasLoading, setPlantasLoading] = useState(false);
    const [linhasLoading, setLinhasLoading] = useState(false);
    const [formData, setFormData] = useState(() =>
        criarFormInicial(initialData)
    );

    const isEditMode = mode === "edit";

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setFormData(criarFormInicial(initialData));
    }, [isOpen, initialData]);

    useEffect(() => {
        if (!isOpen) {
            setPlantas([]);
            return undefined;
        }

        let ativo = true;

        async function carregarPlantas() {
            try {
                setPlantasLoading(true);
                const data = await plantaService.listar();

                if (ativo) {
                    setPlantas(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Erro ao carregar plantas:", error);

                if (ativo) {
                    setPlantas([]);
                }
            } finally {
                if (ativo) {
                    setPlantasLoading(false);
                }
            }
        }

        carregarPlantas();

        return () => {
            ativo = false;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !formData.plantaId) {
            setLinhas([]);
            return undefined;
        }

        let ativo = true;

        async function carregarLinhas() {
            try {
                setLinhasLoading(true);
                const data = await linhaService.listarPorPlanta(
                    formData.plantaId
                );

                if (ativo) {
                    setLinhas(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Erro ao carregar linhas:", error);

                if (ativo) {
                    setLinhas([]);
                }
            } finally {
                if (ativo) {
                    setLinhasLoading(false);
                }
            }
        }

        carregarLinhas();

        return () => {
            ativo = false;
        };
    }, [isOpen, formData.plantaId]);

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

    function handleChange(event) {
        const { name, value } = event.target;

        if (name === "plantaId") {
            setFormData((anterior) => ({
                ...anterior,
                plantaId: value,
                linhaId: "",
            }));
            return;
        }

        setFormData((anterior) => ({
            ...anterior,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        const payload = {
            codigo: formData.codigo.trim(),
            nome: formData.nome.trim(),
            tipo: formData.tipo.trim(),
            fabricante: normalizarTextoOpcional(formData.fabricante),
            modelo: normalizarTextoOpcional(formData.modelo),
            numeroSerie: normalizarTextoOpcional(formData.numeroSerie),
            ip: normalizarTextoOpcional(formData.ip),
            porta: formData.porta ? Number(formData.porta) : null,
            protocolo: normalizarTextoOpcional(formData.protocolo),
            status: formData.status,
            linhaId: Number(formData.linhaId),
        };

        onSubmit(payload);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
                <header className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5 md:px-7">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Cpu size={20} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {isEditMode
                                    ? "Editar equipamento"
                                    : "Novo equipamento"}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {isEditMode
                                    ? "Atualize os dados cadastrais e de comunicação."
                                    : "Cadastre o equipamento e configure sua comunicação."}
                            </p>
                        </div>
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

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 md:px-7">
                        <FormSection
                            icon={Cpu}
                            title="Identificação"
                            description="Informações que identificam o equipamento."
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field
                                    label="Código"
                                    name="codigo"
                                    value={formData.codigo}
                                    onChange={handleChange}
                                    placeholder="EQP-001"
                                    required
                                />

                                <Field
                                    label="Nome do equipamento"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    placeholder="Impressora Linha 01"
                                    required
                                />

                                <Field
                                    label="Tipo"
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    placeholder="Impressora industrial"
                                    required
                                />

                                <SelectField
                                    label="Status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                    <option value="EM_MANUTENCAO">
                                        Em manutenção
                                    </option>
                                    <option value="PARADO">Parado</option>
                                </SelectField>
                            </div>
                        </FormSection>

                        <FormSection
                            icon={MapPin}
                            title="Localização"
                            description="Vincule o equipamento à estrutura industrial."
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <SelectField
                                    label="Planta"
                                    name="plantaId"
                                    value={formData.plantaId}
                                    onChange={handleChange}
                                    disabled={plantasLoading}
                                    required
                                >
                                    <option value="">
                                        {plantasLoading
                                            ? "Carregando plantas..."
                                            : "Selecione uma planta"}
                                    </option>

                                    {plantas.map((planta) => (
                                        <option key={planta.id} value={planta.id}>
                                            {planta.nome} ({planta.codigo})
                                        </option>
                                    ))}
                                </SelectField>

                                <SelectField
                                    label="Linha"
                                    name="linhaId"
                                    value={formData.linhaId}
                                    onChange={handleChange}
                                    disabled={!formData.plantaId || linhasLoading}
                                    required
                                >
                                    <option value="">
                                        {!formData.plantaId
                                            ? "Selecione primeiro uma planta"
                                            : linhasLoading
                                                ? "Carregando linhas..."
                                                : "Selecione uma linha"}
                                    </option>

                                    {linhas.map((linha) => (
                                        <option key={linha.id} value={linha.id}>
                                            {linha.nome} ({linha.codigo})
                                        </option>
                                    ))}
                                </SelectField>
                            </div>
                        </FormSection>

                        <FormSection
                            icon={Network}
                            title="Dados técnicos e comunicação"
                            description="Dados do fabricante e acesso pela rede."
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <Field
                                    label="Fabricante"
                                    name="fabricante"
                                    value={formData.fabricante}
                                    onChange={handleChange}
                                    placeholder="Domino"
                                />

                                <Field
                                    label="Modelo"
                                    name="modelo"
                                    value={formData.modelo}
                                    onChange={handleChange}
                                    placeholder="Ax150i"
                                />

                                <Field
                                    label="Número de série"
                                    name="numeroSerie"
                                    value={formData.numeroSerie}
                                    onChange={handleChange}
                                    placeholder="DOM-001"
                                />

                                <Field
                                    label="Endereço IP"
                                    name="ip"
                                    value={formData.ip}
                                    onChange={handleChange}
                                    placeholder="192.168.0.100"
                                />

                                <Field
                                    label="Porta"
                                    name="porta"
                                    type="number"
                                    min="1"
                                    max="65535"
                                    value={formData.porta}
                                    onChange={handleChange}
                                    placeholder="9100"
                                />

                                <Field
                                    label="Protocolo"
                                    name="protocolo"
                                    value={formData.protocolo}
                                    onChange={handleChange}
                                    placeholder="TCP/IP"
                                />
                            </div>
                        </FormSection>
                    </div>

                    <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 md:px-7">
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
                            className="min-w-36"
                        >
                            {isEditMode
                                ? "Salvar alterações"
                                : "Criar equipamento"}
                        </Button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

function FormSection({ icon: Icon, title, description, children }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon size={16} />
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                        {title}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </section>
    );
}

function Field({
                   label,
                   required = false,
                   type = "text",
                   ...inputProps
               }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </span>

            <input
                {...inputProps}
                type={type}
                required={required}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
        </label>
    );
}

function SelectField({
                         label,
                         required = false,
                         children,
                         ...selectProps
                     }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </span>

            <div className="relative">
                <select
                    {...selectProps}
                    required={required}
                    className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-9 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {children}
                </select>

                <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
            </div>
        </label>
    );
}

function criarFormInicial(initialData) {
    return {
        codigo: initialData?.codigo || "",
        nome: initialData?.nome || "",
        tipo: initialData?.tipo || "",
        fabricante: initialData?.fabricante || "",
        modelo: initialData?.modelo || "",
        numeroSerie: initialData?.numeroSerie || "",
        ip: initialData?.ip || "",
        porta: initialData?.porta ?? "",
        protocolo: initialData?.protocolo || "",
        status: initialData?.status || "ATIVO",
        plantaId: initialData?.plantaId ?? "",
        linhaId: initialData?.linhaId ?? "",
    };
}

function normalizarTextoOpcional(valor) {
    const texto = valor?.trim();
    return texto || null;
}

export default EquipmentFormModal;
