import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Menu,
    Bell,
    Search,
    UserCircle,
    Shield,
    ChevronDown,
    User,
    Settings,
    LogOut,
} from "lucide-react";

import Sidebar from "./Sidebar.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { notificacaoService } from "../../services/notificacaoService.js";

function perfilLabel(perfil) {
    const labels = {
        ADMIN: "Administrador",
        GESTOR: "Gestor",
        SUPERVISOR: "Supervisor",
        OPERADOR: "Operador",
    };

    return labels[perfil] || perfil || "Usuário";
}

function Topbar() {
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Estado Notificações
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notificacoes, setNotificacoes] = useState([]);
    const [quantidadeNaoLidas, setQuantidadeNaoLidas] = useState(0);
    const [loadingNotificacoes, setLoadingNotificacoes] = useState(false);

    useEffect(() => {
        carregarQuantidadeNaoLidas();
    }, []);

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    async function carregarQuantidadeNaoLidas() {
        try {
            const data = await notificacaoService.contarNaoLidas();

            setQuantidadeNaoLidas(data.quantidade || 0);
        } catch (error) {
            console.log("Erro ao carregar quantidade de notificações: ", error);
        }
    }

    async function abrirNotificacoes() {
        const novoEstado = !isNotificationOpen;

        setIsNotificationOpen(novoEstado);

        if(!novoEstado) { return };

        try {
            setLoadingNotificacoes(true);
            const data = await notificacaoService.listar();

            setNotificacoes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("Erro ao carregar notificações: ",error);
        } finally {
            setLoadingNotificacoes(false);
        }
    }

    async function marcarComoLida(
        notificacao
    ) {
        if (notificacao.lida) {
            return;
        }

        try {
            const atualizada =
                await notificacaoService
                    .marcarComoLida(
                        notificacao.id
                    );

            setNotificacoes((prev) =>
                prev.map((item) =>
                    item.id === notificacao.id
                        ? atualizada
                        : item
                )
            );

            setQuantidadeNaoLidas(
                (prev) =>
                    Math.max(
                        0,
                        prev - 1
                    )
            );

        } catch (error) {
            console.error(
                "Erro ao marcar notificação como lida:",
                error
            );
        }
    }

    return (
        <>
            <header className="sticky top-0 z-30 h-20 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-[15px] font-bold text-slate-900">
                            Smart Production Manager
                        </h1>
                        <p className="text-[12px] text-slate-500">
                            Ambiente de produção industrial
                        </p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center flex-1 max-w-xl mx-8">
                    <div className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 flex items-center gap-3 focus-within:border-blue-500 focus-within:bg-white transition">
                        <Search size={17} className="text-slate-400" />
                        <input
                            placeholder="Buscar no sistema..."
                            className="w-full bg-transparent outline-none text-[13px] text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={abrirNotificacoes}
                            className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition"
                            title="Notificações"
                        >
                            <Bell size={20} />

                            {quantidadeNaoLidas > 0 && (
                                <span className="absolute -right-1 -top-1 min-w-[18px] h[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {quantidadeNaoLidas > 99 ? "99+" : quantidadeNaoLidas}
                                </span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 top-12 z-[80] w-[380px] max-w-[calc(100vw-2rem)] overflow-hiden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                                {/* CABEÇALHO */}
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                                    <div>
                                        <h3 className="text-[15px] font-bold text-slate-900">Notificações</h3>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {quantidadeNaoLidas} não lida(s)
                                        </p>
                                    </div>
                                    <Bell
                                        size={18}
                                        className="text-slate-400"
                                    />
                                </div>

                                {/* CONTEÚDO */}
                                <div className="max-h-[420px] overflow-y-auto">

                                    {loadingNotificacoes ? (
                                        <div className="p-8 text-center text-sm text-slate-500">
                                            Carregando notificações...
                                        </div>
                                    ) : notificacoes.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                <Bell size={20} />
                                            </div>
                                            <p className="mt-3 text-sm font-semibold text-slate-700">
                                                Nenhuma notificação
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Os alertas do sistema aparecerão aqui.
                                            </p>
                                        </div>
                                    ) : (
                                        notificacoes.map(
                                            (notificacao) => (
                                                <button
                                                    key={notificacao.id}
                                                    type="button"
                                                    onClick={() => marcarComoLida(notificacao)}
                                                    className={`w-full border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${
                                                        !notificacao.lida ? "bg-blue-50/50" : "bg-white"
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">

                                                        <NivelNotificacaoIcon
                                                            nivel={notificacao.nivel}
                                                        />

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <p className="text-[13px] font-semibold text-slate-900">
                                                                    {notificacao.titulo}
                                                                </p>

                                                                {!notificacao.lida && (
                                                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                                                                {notificacao.mensagem}
                                                            </p>

                                                            <div className="mt-2 flex items-center gap-2">
                                                                <span className={`text-[10px] font-bold uppercase ${nivelClass(
                                                                    notificacao.nivel
                                                                )}`}
                                                                >
                                                                    {nivelLabel(notificacao.nivel)}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400">
                                                                    •
                                                                </span>
                                                                <span className="text-[10px] text-slate-400">
                                                                    {formatarDataNotificacao(notificacao.criadoEm)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen((prev) => !prev)}
                            className="hidden md:flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 transition"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                <UserCircle size={22} />
                            </div>

                            <div className="text-left leading-tight">
                                <p className="text-[13px] font-semibold text-slate-900">
                                    {usuario?.nome || "Usuário"}
                                </p>

                                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                                    <Shield size={12} />
                                    {perfilLabel(usuario?.perfil)}
                                </div>
                            </div>

                            <ChevronDown
                                size={16}
                                className={`text-slate-500 transition ${
                                    isUserMenuOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {isUserMenuOpen && (
                            <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                <div className="border-b border-slate-100 px-5 py-4">
                                    <p className="text-[15px] font-semibold text-slate-900">
                                        Minha Conta
                                    </p>
                                </div>

                                <button
                                    className="flex w-full items-center gap-3 px-5 py-4 text-left text-[14px] text-slate-700 hover:bg-slate-50 transition"
                                >
                                    <User size={18} />
                                    Perfil
                                </button>

                                <button
                                    className="flex w-full items-center gap-3 px-5 py-4 text-left text-[14px] text-slate-700 hover:bg-slate-50 transition"
                                >
                                    <Settings size={18} />
                                    Configurações
                                </button>

                                <div className="border-t border-slate-100">
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 px-5 py-4 text-left text-[14px] text-red-600 hover:bg-red-50 transition"
                                    >
                                        <LogOut size={18} />
                                        Sair
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </>
    );
}

function NivelNotificacaoIcon({
    nivel
}) {
    const classes = {
        INFORMATIVA: "bg-blue-50 text-blue-600",
        ATENCAO: "bg-amber-50 text-amber-600",
        CRITICA: "bg-red-50 text-red-600",
    };

    return (
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            classes[nivel] || "bg-slate-100 text-slate-500"
        }`}
        >
            <Bell size={16} />
        </div>
    );
}

function nivelClass(nivel) {
    const classes = {
        INFORMATIVA: "text-blue-600",
        ATENCAO: "text-amber-600",
        CRITICA: "text-red-600",
    };

    return (
        classes[nivel] || "text-slate-500"
    );
}

function nivelLabel(nivel) {
    const labels = {
        INFORMATIVA: "Informativa",
        ATENCAO: "Atenção",
        CRITICA: "Crítica",
    };

    return (
        labels[nivel] || nivel
    );
}

function formatarDataNotificacao(data) {
    if(!data) {
        return "";
    }

    return new Date(data).toLocaleString(
        "pt-BR",
        {
            dataStyle: "short",
            timeStyle: "short",
        }
    );
}


export default Topbar;
