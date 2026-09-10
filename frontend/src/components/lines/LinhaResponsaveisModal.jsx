import {
    UserPlus,
    Users,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { linhaUsuarioService } from "../../services/linhaUsuarioService.js";
import { usuarioService } from "../../services/usuarioService.js";

function LinhaResponsaveisModal({
                                    isOpen,
                                    linha,
                                    onClose,
                                }) {
    const [usuarios, setUsuarios] = useState([]);
    const [vinculos, setVinculos] = useState([]);
    const [usuarioId, setUsuarioId] = useState("");
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [removendoId, setRemovendoId] = useState(null);

    useEffect(() => {
        if (isOpen && linha?.id) {
            carregarDados();
        }
    }, [isOpen, linha?.id]);

    const usuariosDisponiveis = useMemo(() => {
        const idsVinculados = new Set(
            vinculos.map((vinculo) => vinculo.usuarioId)
        );

        return usuarios
            .filter((usuario) => {
                const perfil = obterPerfil(usuario);

                return (
                    usuario.status === "ATIVO" &&
                    ["OPERADOR", "SUPERVISOR"].includes(perfil) &&
                    !idsVinculados.has(usuario.id)
                );
            })
            .sort((a, b) =>
                a.nome.localeCompare(b.nome, "pt-BR")
            );
    }, [usuarios, vinculos]);

    async function carregarDados() {
        try {
            setLoading(true);

            const [usuariosData, vinculosData] =
                await Promise.all([
                    usuarioService.listar(),
                    linhaUsuarioService.listarPorLinha(
                        linha.id
                    ),
                ]);

            setUsuarios(
                Array.isArray(usuariosData)
                    ? usuariosData
                    : []
            );

            setVinculos(
                Array.isArray(vinculosData)
                    ? vinculosData
                    : []
            );
        } catch (error) {
            mostrarErro(
                error,
                "Erro ao carregar responsáveis."
            );
        } finally {
            setLoading(false);
        }
    }

    async function adicionarResponsavel() {
        if (!usuarioId) {
            toast.error("Selecione um usuário.");
            return;
        }

        const usuario = usuarios.find(
            (item) =>
                item.id === Number(usuarioId)
        );

        if (!usuario) {
            toast.error("Usuário não encontrado.");
            return;
        }

        const papelNaLinha = obterPerfil(usuario);

        try {
            setSalvando(true);

            const novoVinculo =
                await linhaUsuarioService.vincular(
                    linha.id,
                    usuario.id,
                    papelNaLinha
                );

            setVinculos((anteriores) =>
                [...anteriores, novoVinculo].sort(
                    (a, b) =>
                        a.usuarioNome.localeCompare(
                            b.usuarioNome,
                            "pt-BR"
                        )
                )
            );

            setUsuarioId("");

            toast.success(
                "Responsável vinculado com sucesso!"
            );
        } catch (error) {
            mostrarErro(
                error,
                "Erro ao vincular responsável."
            );
        } finally {
            setSalvando(false);
        }
    }

    async function removerResponsavel(vinculo) {
        try {
            setRemovendoId(vinculo.id);

            await linhaUsuarioService.remover(
                linha.id,
                vinculo.id
            );

            setVinculos((anteriores) =>
                anteriores.filter(
                    (item) =>
                        item.id !== vinculo.id
                )
            );

            toast.success(
                "Responsável removido com sucesso!"
            );
        } catch (error) {
            mostrarErro(
                error,
                "Erro ao remover responsável."
            );
        } finally {
            setRemovendoId(null);
        }
    }

    if (!isOpen || !linha) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <Users
                                size={20}
                                className="text-blue-600"
                            />

                            <h2 className="text-lg font-bold text-slate-900">
                                Responsáveis pela Linha
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            {linha.nome}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6 p-6">
                    <section>
                        <h3 className="text-sm font-semibold text-slate-900">
                            Adicionar responsável
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Somente operadores e supervisores
                            ativos são exibidos.
                        </p>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <select
                                value={usuarioId}
                                onChange={(event) =>
                                    setUsuarioId(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    loading ||
                                    salvando ||
                                    usuariosDisponiveis.length === 0
                                }
                                className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <option value="">
                                    {usuariosDisponiveis.length === 0
                                        ? "Nenhum usuário disponível"
                                        : "Selecione um usuário"}
                                </option>

                                {usuariosDisponiveis.map(
                                    (usuario) => (
                                        <option
                                            key={usuario.id}
                                            value={usuario.id}
                                        >
                                            {usuario.nome} —{" "}
                                            {formatarPerfil(
                                                obterPerfil(usuario)
                                            )}
                                        </option>
                                    )
                                )}
                            </select>

                            <button
                                type="button"
                                onClick={adicionarResponsavel}
                                disabled={
                                    !usuarioId ||
                                    salvando ||
                                    loading
                                }
                                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <UserPlus size={17} />

                                {salvando
                                    ? "Adicionando..."
                                    : "Adicionar"}
                            </button>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">
                                Responsáveis vinculados
                            </h3>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {vinculos.length}
                            </span>
                        </div>

                        <div className="mt-3 max-h-[340px] space-y-2 overflow-y-auto pr-1">
                            {loading ? (
                                <EstadoVazio texto="Carregando responsáveis..." />
                            ) : vinculos.length === 0 ? (
                                <EstadoVazio texto="Nenhum responsável vinculado." />
                            ) : (
                                vinculos.map((vinculo) => (
                                    <div
                                        key={vinculo.id}
                                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {vinculo.usuarioNome}
                                                </p>

                                                <PapelBadge
                                                    papel={
                                                        vinculo.papelNaLinha
                                                    }
                                                />
                                            </div>

                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                {vinculo.usuarioEmail}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removerResponsavel(
                                                    vinculo
                                                )
                                            }
                                            disabled={
                                                removendoId ===
                                                vinculo.id
                                            }
                                            className="shrink-0 rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            title="Remover responsável"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

function PapelBadge({ papel }) {
    const supervisor = papel === "SUPERVISOR";

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                supervisor
                    ? "bg-violet-100 text-violet-700"
                    : "bg-blue-100 text-blue-700"
            }`}
        >
            {formatarPerfil(papel)}
        </span>
    );
}

function EstadoVazio({ texto }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500">
            {texto}
        </div>
    );
}

function obterPerfil(usuario) {
    const perfil =
        usuario?.perfil?.nome ??
        usuario?.perfil ??
        "";

    return String(perfil).toUpperCase();
}

function formatarPerfil(perfil) {
    const labels = {
        OPERADOR: "Operador",
        SUPERVISOR: "Supervisor",
    };

    return labels[perfil] || perfil;
}

function mostrarErro(error, fallback) {
    console.error(fallback, error);
    console.error(
        "Resposta:",
        error.response?.data
    );

    toast.error(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        fallback
    );
}

export default LinhaResponsaveisModal;