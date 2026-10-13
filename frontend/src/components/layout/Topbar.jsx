import {
    useEffect,
    useRef,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
    Bell,
    ChevronDown,
    LogOut,
    Menu,
    Settings,
    Shield,
    ShieldCheck,
    UserCircle,
} from "lucide-react";

import Sidebar from "./Sidebar.jsx";

import {
    ACESSOS,
    possuiAcesso,
} from "../../config/accessControl.js";

import {
    useAuth,
} from "../../contexts/AuthContext.jsx";

import {
    notificacaoService,
} from "../../services/notificacaoService.js";

function perfilLabel(perfil) {
    const labels = {
        ADMIN: "Administrador",
        GESTOR: "Gestor",
        SUPERVISOR: "Supervisor",
        OPERADOR: "Operador",
    };

    return (
        labels[perfil] ||
        perfil ||
        "Usuário"
    );
}

function Topbar() {
    const navigate = useNavigate();

    const {
        usuario,
        logout,
    } = useAuth();

    const userMenuRef = useRef(null);
    const notificationRef = useRef(null);

    const [
        isUserMenuOpen,
        setIsUserMenuOpen,
    ] = useState(false);

    const [
        isSidebarOpen,
        setIsSidebarOpen,
    ] = useState(false);

    const [
        isNotificationOpen,
        setIsNotificationOpen,
    ] = useState(false);

    const [
        notificacoes,
        setNotificacoes,
    ] = useState([]);

    const [
        quantidadeNaoLidas,
        setQuantidadeNaoLidas,
    ] = useState(0);

    const [
        loadingNotificacoes,
        setLoadingNotificacoes,
    ] = useState(false);

    const podeAcessarConfiguracoes =
        possuiAcesso(
            usuario?.perfil,
            ACESSOS.CONFIGURACOES
        );

    useEffect(() => {
        async function carregarQuantidade() {
            try {
                const data =
                    await notificacaoService
                        .contarNaoLidas();

                setQuantidadeNaoLidas(
                    data.quantidade || 0
                );
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
            const clicouNoMenuUsuario =
                userMenuRef.current?.contains(
                    event.target
                );

            const clicouNasNotificacoes =
                notificationRef.current?.contains(
                    event.target
                );

            if (!clicouNoMenuUsuario) {
                setIsUserMenuOpen(false);
            }

            if (!clicouNasNotificacoes) {
                setIsNotificationOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            fecharMenus
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                fecharMenus
            );
        };
    }, []);

    function handleLogout() {
        setIsUserMenuOpen(false);
        setIsNotificationOpen(false);

        logout();

        navigate(
            "/login",
            { replace: true }
        );
    }

    function abrirMenuUsuario() {
        setIsNotificationOpen(false);

        setIsUserMenuOpen(
            (estadoAtual) => !estadoAtual
        );
    }

    async function abrirNotificacoes() {
        const novoEstado =
            !isNotificationOpen;

        setIsUserMenuOpen(false);
        setIsNotificationOpen(novoEstado);

        if (!novoEstado) {
            return;
        }

        try {
            setLoadingNotificacoes(true);

            const data =
                await notificacaoService.listar();

            setNotificacoes(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (error) {
            console.error(
                "Erro ao carregar notificações:",
                error
            );
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

            setNotificacoes(
                (notificacoesAtuais) =>
                    notificacoesAtuais.map(
                        (item) =>
                            item.id ===
                            notificacao.id
                                ? atualizada
                                : item
                    )
            );

            setQuantidadeNaoLidas(
                (quantidadeAtual) =>
                    Math.max(
                        0,
                        quantidadeAtual - 1
                    )
            );
        } catch (error) {
            console.error(
                "Erro ao marcar notificação como lida:",
                error
            );
        }
    }

    function abrirConfiguracoes() {
        setIsUserMenuOpen(false);

        navigate("/configuracoes");
    }

    return (
        <>
            <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-5 md:px-6">
                {/* Lado esquerdo */}

                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            setIsSidebarOpen(true)
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:hidden"
                        title="Abrir menu"
                    >
                        <Menu size={21} />
                    </button>

                    <div className="min-w-0">
                        <h1 className="truncate text-[15px] font-bold text-slate-900 sm:text-base">
                            Smart Production Manager
                        </h1>

                        <p className="hidden text-xs text-slate-500 sm:block">
                            Ambiente de produção industrial
                        </p>
                    </div>
                </div>

                {/* Informação central */}

                <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 xl:flex">
                    <ShieldCheck size={15} />
                    Sessão protegida
                </div>

                {/* Lado direito */}

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Notificações */}

                    <div
                        ref={notificationRef}
                        className="relative"
                    >
                        <button
                            type="button"
                            onClick={abrirNotificacoes}
                            className={`
                                relative flex h-10 w-10
                                items-center justify-center
                                rounded-xl
                                text-slate-600
                                transition
                                ${
                                isNotificationOpen
                                    ? "bg-blue-50 text-blue-600"
                                    : "hover:bg-slate-100"
                            }
                            `}
                            title="Notificações"
                        >
                            <Bell size={20} />

                            {quantidadeNaoLidas > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                                    {quantidadeNaoLidas > 99
                                        ? "99+"
                                        : quantidadeNaoLidas}
                                </span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 top-12 z-[80] w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                                    <div>
                                        <h3 className="text-[15px] font-bold text-slate-900">
                                            Notificações
                                        </h3>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {quantidadeNaoLidas} não lida(s)
                                        </p>
                                    </div>

                                    <Bell
                                        size={18}
                                        className="text-slate-400"
                                    />
                                </div>

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
                                                    key={
                                                        notificacao.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        marcarComoLida(
                                                            notificacao
                                                        )
                                                    }
                                                    className={`
                                                        w-full border-b
                                                        border-slate-100
                                                        px-5 py-4
                                                        text-left
                                                        transition
                                                        hover:bg-slate-50
                                                        ${
                                                        !notificacao.lida
                                                            ? "bg-blue-50/50"
                                                            : "bg-white"
                                                    }
                                                    `}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <NivelNotificacaoIcon
                                                            nivel={
                                                                notificacao.nivel
                                                            }
                                                        />

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <p className="text-[13px] font-semibold text-slate-900">
                                                                    {
                                                                        notificacao.titulo
                                                                    }
                                                                </p>

                                                                {!notificacao.lida && (
                                                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                                                {
                                                                    notificacao.mensagem
                                                                }
                                                            </p>

                                                            <div className="mt-2 flex items-center gap-2">
                                                                <span
                                                                    className={`
                                                                        text-[10px]
                                                                        font-bold
                                                                        uppercase
                                                                        ${nivelClass(
                                                                        notificacao.nivel
                                                                    )}
                                                                    `}
                                                                >
                                                                    {nivelLabel(
                                                                        notificacao.nivel
                                                                    )}
                                                                </span>

                                                                <span className="text-[10px] text-slate-400">
                                                                    •
                                                                </span>

                                                                <span className="text-[10px] text-slate-400">
                                                                    {formatarDataNotificacao(
                                                                        notificacao.criadoEm
                                                                    )}
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

                    {/* Usuário */}

                    <div
                        ref={userMenuRef}
                        className="relative"
                    >
                        <button
                            type="button"
                            onClick={abrirMenuUsuario}
                            className={`
                                flex items-center gap-3
                                rounded-2xl border
                                px-2 py-2
                                transition
                                sm:px-3
                                ${
                                isUserMenuOpen
                                    ? "border-blue-200 bg-blue-50"
                                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                            }
                            `}
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                <UserCircle size={22} />
                            </div>

                            <div className="hidden max-w-[170px] text-left leading-tight md:block">
                                <p className="truncate text-[13px] font-semibold text-slate-900">
                                    {usuario?.nome ||
                                        "Usuário"}
                                </p>

                                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                                    <Shield size={12} />

                                    {perfilLabel(
                                        usuario?.perfil
                                    )}
                                </div>
                            </div>

                            <ChevronDown
                                size={16}
                                className={`
                                    hidden text-slate-500
                                    transition md:block
                                    ${
                                    isUserMenuOpen
                                        ? "rotate-180"
                                        : ""
                                }
                                `}
                            />
                        </button>

                        {isUserMenuOpen && (
                            <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                <div className="border-b border-slate-100 px-5 py-4">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                        {usuario?.nome ||
                                            "Usuário"}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-slate-500">
                                        {usuario?.email ||
                                            "E-mail não informado"}
                                    </p>

                                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                                        <Shield size={12} />

                                        {perfilLabel(
                                            usuario?.perfil
                                        )}
                                    </span>
                                </div>

                                {podeAcessarConfiguracoes && (
                                    <button
                                        type="button"
                                        onClick={
                                            abrirConfiguracoes
                                        }
                                        className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <Settings size={18} />
                                        Configurações
                                    </button>
                                )}

                                <div className="border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                    >
                                        <LogOut size={18} />
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
                onClose={() =>
                    setIsSidebarOpen(false)
                }
            />
        </>
    );
}

function NivelNotificacaoIcon({
                                  nivel,
                              }) {
    const classes = {
        INFORMATIVA:
            "bg-blue-50 text-blue-600",
        ATENCAO:
            "bg-amber-50 text-amber-600",
        CRITICA:
            "bg-red-50 text-red-600",
    };

    return (
        <div
            className={`
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-xl
                ${
                classes[nivel] ||
                "bg-slate-100 text-slate-500"
            }
            `}
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
        classes[nivel] ||
        "text-slate-500"
    );
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
    if (!data) {
        return "";
    }

    return new Date(data).toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short",
        }
    );
}

export default Topbar;