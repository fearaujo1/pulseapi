import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Bell,
    ChevronDown,
    LogOut,
    Menu,
    Settings,
    Shield,
} from "lucide-react";

import Sidebar from "./Sidebar.jsx";
import { ACESSOS, possuiAcesso } from "../../config/accessControl.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { notificacaoService } from "../../services/notificacaoService.js";

const routeTitles = [
    { prefix: "/dashboard", title: "Visão geral", eyebrow: "Dashboard" },
    { prefix: "/producoes", title: "Produções", eyebrow: "Operação" },
    { prefix: "/layouts-impressao", title: "Layouts de impressão", eyebrow: "Operação" },
    { prefix: "/equipamentos", title: "Equipamentos", eyebrow: "Estrutura" },
    { prefix: "/eventos", title: "Ocorrências", eyebrow: "Estrutura" },
    { prefix: "/linhas", title: "Plantas e linhas", eyebrow: "Estrutura" },
    { prefix: "/relatorios", title: "Relatórios", eyebrow: "Análise" },
    { prefix: "/usuarios", title: "Usuários", eyebrow: "Sistema" },
    { prefix: "/configuracoes", title: "Configurações", eyebrow: "Sistema" },
];

function perfilLabel(perfil) {
    const labels = {
        ADMIN: "Administrador",
        GESTOR: "Gestor",
        SUPERVISOR: "Supervisor",
        OPERADOR: "Operador",
    };

    return labels[perfil] || perfil || "Usuário";
}

function obterIniciais(nome) {
    if (!nome?.trim()) return "US";

    return nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join("");
}

function Topbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { usuario, logout } = useAuth();

    const userMenuRef = useRef(null);
    const notificationRef = useRef(null);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notificacoes, setNotificacoes] = useState([]);
    const [quantidadeNaoLidas, setQuantidadeNaoLidas] = useState(0);
    const [loadingNotificacoes, setLoadingNotificacoes] = useState(false);

    const routeInfo =
        routeTitles.find((route) =>
            location.pathname.startsWith(route.prefix)
        ) || {
            title: "PulseAPI",
            eyebrow: "Smart Production Manager",
        };

    const podeAcessarConfiguracoes = possuiAcesso(
        usuario?.perfil,
        ACESSOS.CONFIGURACOES
    );

    useEffect(() => {
        async function carregarQuantidade() {
            try {
                const data = await notificacaoService.contarNaoLidas();
                setQuantidadeNaoLidas(data.quantidade || 0);
            } catch (error) {
                console.error(
                    "Erro ao carregar quantidade de notificações:",
                    error
                );
            }
        }

        carregarQuantidade();
    }, []);

    useEffect(() => {
        function fecharMenus(event) {
            if (!userMenuRef.current?.contains(event.target)) {
                setIsUserMenuOpen(false);
            }

            if (!notificationRef.current?.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        }

        document.addEventListener("mousedown", fecharMenus);
        return () => document.removeEventListener("mousedown", fecharMenus);
    }, []);

    useEffect(() => {
        setIsSidebarOpen(false);
        setIsNotificationOpen(false);
        setIsUserMenuOpen(false);
    }, [location.pathname]);

    function handleLogout() {
        setIsUserMenuOpen(false);
        setIsNotificationOpen(false);
        logout();
        navigate("/login", { replace: true });
    }

    function abrirMenuUsuario() {
        setIsNotificationOpen(false);
        setIsUserMenuOpen((estadoAtual) => !estadoAtual);
    }

    async function abrirNotificacoes() {
        const novoEstado = !isNotificationOpen;

        setIsUserMenuOpen(false);
        setIsNotificationOpen(novoEstado);

        if (!novoEstado) return;

        try {
            setLoadingNotificacoes(true);
            const data = await notificacaoService.listar();
            setNotificacoes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar notificações:", error);
        } finally {
            setLoadingNotificacoes(false);
        }
    }

    async function marcarComoLida(notificacao) {
        if (notificacao.lida) return;

        try {
            const atualizada = await notificacaoService.marcarComoLida(
                notificacao.id
            );

            setNotificacoes((atuais) =>
                atuais.map((item) =>
                    item.id === notificacao.id ? atualizada : item
                )
            );

            setQuantidadeNaoLidas((atual) => Math.max(0, atual - 1));
        } catch (error) {
            console.error("Erro ao marcar notificação como lida:", error);
        }
    }

    return (
        <>
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
                        aria-label="Abrir menu"
                    >
                        <Menu size={19} />
                    </button>

                    <div className="min-w-0">
                        <p className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:block">
                            {routeInfo.eyebrow}
                        </p>
                        <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-slate-900 sm:text-base">
                            {routeInfo.title}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div ref={notificationRef} className="relative">
                        <button
                            type="button"
                            onClick={abrirNotificacoes}
                            className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition ${
                                isNotificationOpen
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            }`}
                            aria-label="Notificações"
                        >
                            <Bell size={18} />

                            {quantidadeNaoLidas > 0 && (
                                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                                    {quantidadeNaoLidas > 99
                                        ? "99+"
                                        : quantidadeNaoLidas}
                                </span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 top-11 z-[80] w-[360px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
                                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Notificações
                                        </h2>
                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                            {quantidadeNaoLidas} não lida(s)
                                        </p>
                                    </div>
                                    <Bell size={17} className="text-slate-400" />
                                </div>

                                <div className="max-h-[380px] overflow-y-auto">
                                    {loadingNotificacoes ? (
                                        <div className="px-5 py-10 text-center text-sm text-slate-500">
                                            Carregando notificações...
                                        </div>
                                    ) : notificacoes.length === 0 ? (
                                        <div className="px-5 py-10 text-center">
                                            <p className="text-sm font-medium text-slate-700">
                                                Nenhuma notificação
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Novos alertas aparecerão aqui.
                                            </p>
                                        </div>
                                    ) : (
                                        notificacoes.map((notificacao) => (
                                            <button
                                                key={notificacao.id}
                                                type="button"
                                                onClick={() =>
                                                    marcarComoLida(notificacao)
                                                }
                                                className={`w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50 ${
                                                    !notificacao.lida
                                                        ? "bg-blue-50/40"
                                                        : "bg-white"
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <NivelNotificacaoIcon
                                                        nivel={notificacao.nivel}
                                                    />

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="text-[12px] font-semibold text-slate-900">
                                                                {notificacao.titulo}
                                                            </p>
                                                            {!notificacao.lida && (
                                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                                                            )}
                                                        </div>

                                                        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-600">
                                                            {notificacao.mensagem}
                                                        </p>

                                                        <div className="mt-2 flex items-center gap-2 text-[10px]">
                                                            <span
                                                                className={`font-semibold uppercase ${nivelClass(
                                                                    notificacao.nivel
                                                                )}`}
                                                            >
                                                                {nivelLabel(
                                                                    notificacao.nivel
                                                                )}
                                                            </span>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="text-slate-400">
                                                                {formatarDataNotificacao(
                                                                    notificacao.criadoEm
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

                    <div ref={userMenuRef} className="relative">
                        <button
                            type="button"
                            onClick={abrirMenuUsuario}
                            className={`flex h-10 items-center gap-2 rounded-lg px-1.5 transition sm:pr-2.5 ${
                                isUserMenuOpen
                                    ? "bg-slate-100"
                                    : "hover:bg-slate-100"
                            }`}
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#101828] text-[11px] font-bold text-white">
                                {obterIniciais(usuario?.nome)}
                            </span>

                            <span className="hidden max-w-[150px] text-left md:block">
                                <span className="block truncate text-[12px] font-semibold text-slate-800">
                                    {usuario?.nome || "Usuário"}
                                </span>
                                <span className="block truncate text-[10px] text-slate-500">
                                    {perfilLabel(usuario?.perfil)}
                                </span>
                            </span>

                            <ChevronDown
                                size={14}
                                className={`hidden text-slate-400 transition md:block ${
                                    isUserMenuOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {isUserMenuOpen && (
                            <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
                                <div className="border-b border-slate-100 px-4 py-3.5">
                                    <p className="truncate text-[13px] font-semibold text-slate-900">
                                        {usuario?.nome || "Usuário"}
                                    </p>
                                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                        {usuario?.email || "E-mail não informado"}
                                    </p>
                                    <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                                        <Shield size={11} />
                                        {perfilLabel(usuario?.perfil)}
                                    </span>
                                </div>

                                {podeAcessarConfiguracoes && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            navigate("/configuracoes");
                                        }}
                                        className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <Settings size={16} />
                                        Configurações
                                    </button>
                                )}

                                <div className="border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[12px] font-medium text-red-600 transition hover:bg-red-50"
                                    >
                                        <LogOut size={16} />
                                        Sair do sistema
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

function NivelNotificacaoIcon({ nivel }) {
    const classes = {
        INFORMATIVA: "bg-blue-50 text-blue-600",
        ATENCAO: "bg-amber-50 text-amber-600",
        CRITICA: "bg-red-50 text-red-600",
    };

    return (
        <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                classes[nivel] || "bg-slate-100 text-slate-500"
            }`}
        >
            <Bell size={14} />
        </div>
    );
}

function nivelClass(nivel) {
    const classes = {
        INFORMATIVA: "text-blue-600",
        ATENCAO: "text-amber-600",
        CRITICA: "text-red-600",
    };

    return classes[nivel] || "text-slate-500";
}

function nivelLabel(nivel) {
    const labels = {
        INFORMATIVA: "Informativa",
        ATENCAO: "Atenção",
        CRITICA: "Crítica",
    };

    return labels[nivel] || nivel;
}

function formatarDataNotificacao(data) {
    if (!data) return "";

    return new Date(data).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export default Topbar;
