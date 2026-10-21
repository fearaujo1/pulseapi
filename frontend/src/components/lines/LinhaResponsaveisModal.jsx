import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Trash2,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button, IconButton } from "../common/Button.jsx";
import { linhaUsuarioService } from "../../services/linhaUsuarioService.js";
import { usuarioService } from "../../services/usuarioService.js";

function LinhaResponsaveisModal({ isOpen, linha, onClose }) {
    const [usuarios, setUsuarios] = useState([]);
    const [vinculos, setVinculos] = useState([]);
    const [usuarioId, setUsuarioId] = useState("");
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [removendoId, setRemovendoId] = useState(null);
    const linhaId = linha?.id;
    const processando =
        salvando || removendoId !== null;

    const carregarDados = useCallback(async () => {
        if (!linhaId) return;
        try {
            setLoading(true);
            const [usuariosData, responsaveisData] = await Promise.all([
                usuarioService.listar(),
                linhaUsuarioService.listarPorLinha(linhaId),
            ]);
            setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
            setVinculos(Array.isArray(responsaveisData) ? responsaveisData : []);
        } catch (error) {
            mostrarErro(error, "Não foi possível carregar os responsáveis.");
        } finally {
            setLoading(false);
        }
    }, [linhaId]);

    useEffect(() => {
        if (isOpen) carregarDados();
    }, [isOpen, carregarDados]);

    useEffect(() => {
        if (!isOpen) return undefined;

        function fechar(event) {
            if (event.key === "Escape" && !salvando && removendoId === null) {
                onClose();
            }
        }

        document.addEventListener("keydown", fechar);
        return () => document.removeEventListener("keydown", fechar);
    }, [isOpen, salvando, removendoId, onClose]);

    const disponiveis = useMemo(() => {
        const vinculados = new Set(vinculos.map((item) => item.usuarioId));

        return usuarios
            .filter(
                (usuario) =>
                    usuario.status === "ATIVO" &&
                    ["OPERADOR", "SUPERVISOR"].includes(obterPerfil(usuario)) &&
                    !vinculados.has(usuario.id)
            )
            .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    }, [usuarios, vinculos]);

    if (!isOpen || !linha) return null;

    async function adicionar() {
        const usuario = usuarios.find((item) => item.id === Number(usuarioId));
        if (!usuario) return toast.error("Selecione um usuário.");

        try {
            setSalvando(true);
            const novo = await linhaUsuarioService.vincular(linha.id, usuario.id, obterPerfil(usuario));
            setVinculos((anteriores) =>
                [...anteriores, novo].sort((a, b) => a.usuarioNome.localeCompare(b.usuarioNome, "pt-BR"))
            );
            setUsuarioId("");
            toast.success("Responsável vinculado com sucesso!");
        } catch (error) {
            mostrarErro(error, "Erro ao vincular responsável.");
        } finally {
            setSalvando(false);
        }
    }

    async function remover(vinculo) {
        try {
            setRemovendoId(vinculo.id);
            await linhaUsuarioService.remover(linha.id, vinculo.id);
            setVinculos((anteriores) => anteriores.filter((item) => item.id !== vinculo.id));
            toast.success("Responsável removido com sucesso!");
        } catch (error) {
            mostrarErro(error, "Erro ao remover responsável.");
        } finally {
            setRemovendoId(null);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                {/* HEADER DO MODAL */}
                <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Users size={19} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Responsáveis pela linha</h2>
                            <p className="mt-1 text-xs text-slate-500">{linha.nome}</p>
                        </div>
                    </div>
                    <IconButton
                        icon={X}
                        onClick={onClose}
                        disabled={processando}
                        title="Fechar modal"
                    />
                </header>

                {/* CORPO DO FORMULÁRIO */}
                <div className="space-y-5 px-6 py-5">

                    {/* SEÇÃO: FORMULÁRIO DE ADIÇÃO */}
                    <section>
                        <h3 className="text-xs font-semibold text-slate-800">Adicionar responsável</h3>
                        <p className="mt-1 text-[10px] text-slate-500">Somente operadores e supervisores ativos.</p>

                        <div className="mt-3 flex gap-2">
                            <select
                                value={usuarioId}
                                disabled={loading || salvando || !disponiveis.length}
                                className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[11px] outline-none focus:border-blue-500 disabled:opacity-50"
                                onChange={(event) => setUsuarioId(event.target.value)}
                            >
                                <option value="">
                                    {disponiveis.length ? "Selecione um usuário" : "Nenhum usuário disponível"}
                                </option>
                                {disponiveis.map((usuario) => (
                                    <option key={usuario.id} value={usuario.id}>
                                        {usuario.nome} — {formatarPerfil(obterPerfil(usuario))}
                                    </option>
                                ))}
                            </select>

                            <Button
                                size="small"
                                icon={UserPlus}
                                onClick={adicionar}
                                loading={salvando}
                                loadingText="Adicionando..."
                                disabled={
                                    !usuarioId ||
                                    loading
                                }
                            >
                                Adicionar
                            </Button>
                        </div>
                    </section>

                    {/* SEÇÃO: LISTAGEM DE RESPONSÁVEIS */}
                    <section>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-slate-800">Responsáveis vinculados</h3>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {vinculos.length}
                              </span>
                        </div>

                        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                            {loading ? (
                                <Estado texto="Carregando responsáveis..." />
                            ) : !vinculos.length ? (
                                <Estado texto="Nenhum responsável vinculado." />
                            ) : (
                                vinculos.map((vinculo) => (
                                    <div
                                        key={vinculo.id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-xs font-semibold text-slate-900">
                                                    {vinculo.usuarioNome}
                                                </p>
                                                <PapelBadge papel={vinculo.papelNaLinha} />
                                            </div>
                                            <p className="mt-0.5 truncate text-[10px] text-slate-500">
                                                {vinculo.usuarioEmail}
                                            </p>
                                        </div>

                                        <IconButton
                                            icon={Trash2}
                                            size="small"
                                            variant="dangerOutline"
                                            title={`Remover ${vinculo.usuarioNome}`}
                                            onClick={() => remover(vinculo)}
                                            loading={removendoId === vinculo.id}
                                            disabled={
                                                removendoId !== null &&
                                                removendoId !== vinculo.id
                                            }
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* FOOTER DO MODAL */}
                <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={onClose}
                        disabled={processando}
                    >
                        Fechar
                    </Button>
                </footer>

            </div>
        </div>
    );
}

{/* COMPONENTES AUXILIARES COESOS */}
function PapelBadge({ papel }) {
    const supervisor = papel === "SUPERVISOR";
    return (
        <span
            className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                supervisor ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
            }`}
        >
      formatarPerfil(papel)
    </span>
    );
}

function Estado({ texto }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-7 text-center text-[11px] text-slate-500">
            {texto}
        </div>
    );
}

{/* FUNÇÕES AUXILIARES DE SUPORTE */}
function obterPerfil(usuario) {
    return String(usuario?.perfil?.nome ?? usuario?.perfil ?? "").toUpperCase();
}

function formatarPerfil(perfil) {
    return { OPERADOR: "Operador", SUPERVISOR: "Supervisor" }[perfil] || perfil;
}

function mostrarErro(error, fallback) {
    console.error(fallback, error);
    toast.error(error.response?.data?.detail || error.response?.data?.message || fallback);
}

export default LinhaResponsaveisModal;
