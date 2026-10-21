import { useEffect, useState } from "react";
import {
    Button,
    IconButton,
} from "../common/Button.jsx";

function UserFormModal({
                           isOpen,
                           onClose,
                           onSubmit,
                           loading = false,
                           initialData = null,
                           mode = "create",
                           turnos = [],
                       }) {
    const [formData, setFormData] = useState(() =>
        criarFormInicial(initialData)
    );

    const isEditMode = mode === "edit";
    const isOperador = Number(formData.perfilId) === 4;

    useEffect(() => {
        if (isOpen) {
            setFormData(criarFormInicial(initialData));
        }
    }, [isOpen, initialData]);

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

        if (name === "perfilId") {
            const novoPerfil = Number(value);

            setFormData((anterior) => ({
                ...anterior,
                perfilId: value,
                turnoIds: novoPerfil === 4 ? anterior.turnoIds : [],
            }));
            return;
        }

        setFormData((anterior) => ({
            ...anterior,
            [name]: value,
        }));
    }

    function toggleTurno(turnoId) {
        setFormData((anterior) => ({
            ...anterior,
            turnoIds: anterior.turnoIds.includes(turnoId)
                ? anterior.turnoIds.filter((id) => id !== turnoId)
                : [...anterior.turnoIds, turnoId],
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        onSubmit(formData);
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
            <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
                <header className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5 md:px-7">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {isEditMode ? "Editar usuário" : "Novo usuário"}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {isEditMode
                                    ? "Atualize os dados, o perfil e os turnos permitidos."
                                    : "Cadastre o usuário e defina seu nível de acesso."}
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

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 md:px-7">
                        <section className="rounded-xl border border-slate-200 p-4 md:p-5">
                            <SectionTitle
                                icon={ShieldCheck}
                                title="Dados e acesso"
                                description="Informações de identificação e perfil do usuário."
                            />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field
                                    icon={User}
                                    label="Nome completo"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    placeholder="João Silva"
                                    required
                                />

                                <Field
                                    icon={Mail}
                                    type="email"
                                    label="E-mail"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="usuario@empresa.com"
                                    required
                                />

                                <Field
                                    icon={Phone}
                                    label="Telefone"
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    placeholder="(43) 99999-9999"
                                />

                                {!isEditMode && (
                                    <Field
                                        icon={Lock}
                                        type="password"
                                        label="Senha"
                                        name="senha"
                                        value={formData.senha}
                                        onChange={handleChange}
                                        placeholder="Defina uma senha segura"
                                        autoComplete="new-password"
                                        required
                                    />
                                )}

                                <SelectField
                                    label="Perfil de acesso"
                                    name="perfilId"
                                    value={formData.perfilId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="4">Operador</option>
                                    <option value="3">Supervisor</option>
                                    <option value="2">Gestor</option>
                                    <option value="1">Administrador</option>
                                </SelectField>
                            </div>
                        </section>

                        {isOperador && (
                            <section className="rounded-xl border border-slate-200 p-4 md:p-5">
                                <SectionTitle
                                    icon={Clock3}
                                    title="Turnos do operador"
                                    description="Selecione os períodos em que o usuário poderá acessar o sistema."
                                />

                                {turnos.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50 px-4 py-3">
                                        <p className="text-xs font-semibold text-amber-700">
                                            Nenhum turno configurado
                                        </p>
                                        <p className="mt-1 text-[11px] text-amber-600">
                                            Cadastre os turnos em Configurações antes de associá-los.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {turnos.map((turno) => {
                                            const selecionado =
                                                formData.turnoIds.includes(turno.id);

                                            return (
                                                <button
                                                    key={turno.id}
                                                    type="button"
                                                    disabled={!turno.ativo}
                                                    onClick={() => toggleTurno(turno.id)}
                                                    className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                                                        selecionado
                                                            ? "border-blue-500 bg-blue-50"
                                                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-800">
                                                            {turno.nome}
                                                        </p>
                                                        <p className="mt-0.5 text-[10px] text-slate-500">
                                                            {formatarHora(turno.horaInicio)} → {formatarHora(turno.horaFim)}
                                                            {!turno.ativo && " • Inativo"}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                                                            selecionado
                                                                ? "border-blue-600 bg-blue-600 text-white"
                                                                : "border-slate-300"
                                                        }`}
                                                    >
                                                        {selecionado && <Check size={13} />}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        )}
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
                                : "Criar usuário"}
                        </Button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

function SectionTitle({ icon: Icon, title, description }) {
    return (
        <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon size={16} />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
            </div>
        </div>
    );
}

function Field({ icon: Icon, label, required = false, type = "text", ...props }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}{required && <span className="ml-1 text-red-500">*</span>}
            </span>
            <div className="flex h-10 items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10">
                <Icon size={15} className="shrink-0 text-slate-400" />
                <input
                    {...props}
                    type={type}
                    required={required}
                    className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                />
            </div>
        </label>
    );
}

function SelectField({ label, required, children, ...props }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}{required && <span className="ml-1 text-red-500">*</span>}
            </span>
            <div className="relative">
                <select
                    {...props}
                    required={required}
                    className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-9 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                >
                    {children}
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
        </label>
    );
}

function formatarHora(hora) {
    return hora ? String(hora).substring(0, 5) : "--:--";
}

function criarFormInicial(initialData) {
    return {
        nome: initialData?.nome || "",
        email: initialData?.email || "",
        telefone: initialData?.telefone || "",
        senha: "",
        perfilId: initialData?.perfilId ? String(initialData.perfilId) : "4",
        turnoIds: Array.isArray(initialData?.turnos)
            ? initialData.turnos.map((turno) => turno.id)
            : [],
    };
}

export default UserFormModal;
