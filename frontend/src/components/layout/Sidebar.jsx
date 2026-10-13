import {
    ChartColumn,
    CircleAlert,
    ClipboardList,
    Factory,
    HardDriveIcon,
    Layers3,
    LayoutDashboard,
    Printer,
    Settings,
    Users,
    Wifi,
    X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import {
    ACESSOS,
    possuiAcesso,
} from "../../config/accessControl.js";

import { useAuth } from "../../contexts/AuthContext.jsx";

/*
 * Futuramente este valor poderá vir das
 * configurações da empresa.
 */
const LOGO_EMPRESA_PADRAO =
    "/branding/logo-autopack.png";

const menuSections = [
    {
        title: null,
        items: [
            {
                label: "Dashboard",
                icon: LayoutDashboard,
                path: "/dashboard",
                allowedProfiles:
                ACESSOS.DASHBOARD,
            },
        ],
    },

    {
        title: "Produção",
        items: [
            {
                label: "Produções",
                icon: ClipboardList,
                path: "/producoes",
                allowedProfiles:
                ACESSOS.PRODUCOES,
            },
            {
                label: "Fila de Impressão",
                icon: Printer,
                path: "/fila-impressao",
                allowedProfiles:
                ACESSOS.FILA_IMPRESSAO,
            },
            {
                label: "Layouts de Impressão",
                icon: Layers3,
                path: "/layouts-impressao",
                allowedProfiles:
                ACESSOS.LAYOUTS_IMPRESSAO,
            },
        ],
    },

    {
        title: "Gestão",
        items: [
            {
                label: "Equipamentos",
                icon: HardDriveIcon,
                path: "/equipamentos",
                allowedProfiles:
                ACESSOS.EQUIPAMENTOS,
            },
            {
                label: "Ocorrências",
                icon: CircleAlert,
                path: "/eventos",
                allowedProfiles:
                ACESSOS.EVENTOS,
            },
            {
                label: "Plantas e Linhas",
                icon: Factory,
                path: "/linhas",
                allowedProfiles:
                ACESSOS.LINHAS,
            },
        ],
    },

    {
        title: "Análises",
        items: [
            {
                label: "Relatórios",
                icon: ChartColumn,
                path: "/relatorios",
                allowedProfiles:
                ACESSOS.RELATORIOS,
            },
        ],
    },

    {
        title: "Administração",
        items: [
            {
                label: "Usuários",
                icon: Users,
                path: "/usuarios",
                allowedProfiles:
                ACESSOS.USUARIOS,
            },
            {
                label: "Configurações",
                icon: Settings,
                path: "/configuracoes",
                allowedProfiles:
                ACESSOS.CONFIGURACOES,
            },
        ],
    },
];

function Sidebar({
                     isOpen,
                     onClose,
                 }) {
    const { usuario } = useAuth();

    const perfil =
        usuario?.perfil;

    return (
        <>
            <div
                onClick={onClose}
                className={`
                    fixed inset-0 z-40
                    bg-black/30
                    transition-opacity duration-300
                    lg:hidden
                    ${
                    isOpen
                        ? "opacity-100"
                        : "pointer-events-none opacity-0"
                }
                `}
            />

            <aside
                className={`
                    fixed left-0 top-0 z-50
                    flex h-screen w-[270px] flex-col
                    bg-slate-950 text-white
                    shadow-2xl
                    transition-transform
                    duration-300
                    ease-in-out
                    lg:translate-x-0
                    lg:shadow-none
                    ${
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }
                `}
            >
                <div className="relative px-6 pb-5 pt-6">
                    <div className="flex min-h-[100px] flex-col justify-center">
                        <img
                            src={LOGO_EMPRESA_PADRAO}
                            alt="Logo da empresa"
                            className="h-auto max-h-[90px] w-full max-w-[205px] object-contain object-center"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-3 top-3 rounded-xl p-2 text-slate-300 transition hover:bg-slate-800 lg:hidden"
                        title="Fechar menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mx-6 border-b border-slate-800" />

                <nav className="flex-1 overflow-y-auto py-4">
                    {menuSections.map(
                        (
                            section,
                            sectionIndex
                        ) => {
                            const visibleItems =
                                section.items.filter(
                                    (item) =>
                                        possuiAcesso(
                                            perfil,
                                            item.allowedProfiles
                                        )
                                );

                            if (
                                visibleItems.length === 0
                            ) {
                                return null;
                            }

                            return (
                                <div
                                    key={
                                        section.title ||
                                        sectionIndex
                                    }
                                    className="mb-5"
                                >
                                    {section.title && (
                                        <p className="mb-2 px-7 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                            {section.title}
                                        </p>
                                    )}

                                    <div className="space-y-1">
                                        {visibleItems.map(
                                            (item) => {
                                                const Icon =
                                                    item.icon;

                                                return (
                                                    <NavLink
                                                        key={
                                                            item.path
                                                        }
                                                        to={
                                                            item.path
                                                        }
                                                        onClick={
                                                            onClose
                                                        }
                                                        className={({
                                                                        isActive,
                                                                    }) => `
                                                            mx-3
                                                            flex h-12
                                                            items-center
                                                            gap-3
                                                            rounded-xl
                                                            px-4
                                                            text-[14px]
                                                            font-semibold
                                                            transition
                                                            ${
                                                            isActive
                                                                ? "bg-blue-600 text-white"
                                                                : "text-slate-300 hover:bg-slate-900 hover:text-white"
                                                        }
                                                        `}
                                                    >
                                                        <Icon
                                                            size={
                                                                19
                                                            }
                                                        />

                                                        {
                                                            item.label
                                                        }
                                                    </NavLink>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            );
                        }
                    )}
                </nav>

                <div className="border-t border-slate-800 px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                        <Wifi size={16} />
                        Conectado
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                        v1.0.4
                    </p>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;