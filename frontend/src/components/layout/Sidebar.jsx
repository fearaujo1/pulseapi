import {
    X,
    LayoutDashboard,
    Factory,
    CircleAlert,
    ChartColumn,
    Users,
    Settings,
    Wifi,
    HardDriveIcon,
    Printer,
    Layers3,
    ClipboardList,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const menuSections = [
    {
        title: null,

        items: [
            {
                label: "Dashboard",
                icon: LayoutDashboard,
                path: "/dashboard",
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
            },

            /*
             * Por enquanto a tela da fila é global.
             *
             * Quando Gerenciar Linhas estiver implementado,
             * o OPERADOR poderá acessar uma fila filtrada
             * pela linha/equipamentos atribuídos a ele.
             */
            {
                label: "Fila de Impressão",
                icon: Printer,
                path: "/fila-impressao",
                hideForOperator: true,
            },

            {
                label: "Layouts de Impressão",
                icon: Layers3,
                path: "/layouts-impressao",
                hideForOperator: true,
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
            },

            {
                label: "Ocorrências",
                icon: CircleAlert,
                path: "/eventos",
                hideForOperator: true,
            },

            {
                label: "Linhas",
                icon: Factory,
                path: "/linhas",
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
                hideForOperator: true,
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
                adminOnly: true,
            },

            {
                label: "Configurações",
                icon: Settings,
                path: "/configuracoes",
                adminOnly: true,
            },
        ],
    },
];

function Sidebar({
                     isOpen,
                     onClose,
                 }) {
    const { usuario } = useAuth();

    function canSeeItem(
        item,
        perfil
    ) {
        if (item.adminOnly) {
            return perfil === "ADMIN";
        }

        if (item.hideForOperator) {
            return perfil !== "OPERADOR";
        }

        return true;
    }

    return (
        <>

            {/* ================================== */}
            {/* OVERLAY SOMENTE MOBILE            */}
            {/* ================================== */}

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


            {/* ================================== */}
            {/* SIDEBAR                            */}
            {/* ================================== */}

            <aside
                className={`
                    fixed left-0 top-0 z-50
                    flex h-screen w-[270px] flex-col
                    bg-slate-950 text-white

                    transition-transform
                    duration-300
                    ease-in-out

                    shadow-2xl

                    lg:translate-x-0
                    lg:shadow-none

                    ${
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }
                `}
            >

                {/* ============================== */}
                {/* LOGO / CABEÇALHO              */}
                {/* ============================== */}

                <div className="flex items-center justify-between px-6 py-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                            <Factory size={25} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                PulseAPI
                            </h2>

                            <p className="text-xs leading-tight text-slate-300">
                                Smart Production
                                <br />
                                Manager
                            </p>
                        </div>
                    </div>


                    {/* Fechar somente no mobile */}

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
                        title="Fechar menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mx-6 border-b border-slate-800" />


                {/* ============================== */}
                {/* NAVEGAÇÃO                     */}
                {/* ============================== */}

                <nav className="flex-1 overflow-y-auto py-4">

                    {menuSections.map(
                        (section, sectionIndex) => {

                            const visibleItems =
                                section.items.filter(
                                    (item) =>
                                        canSeeItem(
                                            item,
                                            usuario?.perfil
                                        )
                                );

                            if (visibleItems.length === 0) {
                                return null;
                            }

                            return (
                                <div
                                    key={sectionIndex}
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
                                                        key={item.path}
                                                        to={item.path}

                                                        /*
                                                         * No desktop isso não
                                                         * fecha visualmente a
                                                         * Sidebar porque ela
                                                         * possui lg:translate-x-0.
                                                         *
                                                         * No mobile fecha
                                                         * normalmente.
                                                         */
                                                        onClick={onClose}

                                                        className={({
                                                                        isActive,
                                                                    }) =>
                                                            `
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
                                                            `
                                                        }
                                                    >
                                                        <Icon size={19} />

                                                        {item.label}
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


                {/* ============================== */}
                {/* RODAPÉ                         */}
                {/* ============================== */}

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