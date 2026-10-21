import {
    ChartColumn,
    CircleAlert,
    ClipboardList,
    HardDriveIcon,
    Layers3,
    LayoutDashboard,
    Printer,
    Settings,
    Users,
    Workflow,
    X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { ACESSOS, possuiAcesso } from "../../config/accessControl.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

const LOGO_PULSEAPI = "/branding/png/pulseapi-horizontal-white.png";

const menuSections = [
    {
        title: null,
        items: [
            {
                label: "Visão geral",
                icon: LayoutDashboard,
                path: "/dashboard",
                allowedProfiles: ACESSOS.DASHBOARD,
            },
        ],
    },
    {
        title: "Operação",
        items: [
            {
                label: "Produções",
                icon: ClipboardList,
                path: "/producoes",
                allowedProfiles: ACESSOS.PRODUCOES,
            },
            {
                label: "Layouts",
                icon: Layers3,
                path: "/layouts-impressao",
                allowedProfiles: ACESSOS.LAYOUTS_IMPRESSAO,
            },
        ],
    },
    {
        title: "Estrutura",
        items: [
            {
                label: "Equipamentos",
                icon: HardDriveIcon,
                path: "/equipamentos",
                allowedProfiles: ACESSOS.EQUIPAMENTOS,
            },
            {
                label: "Ocorrências",
                icon: CircleAlert,
                path: "/eventos",
                allowedProfiles: ACESSOS.EVENTOS,
            },
            {
                label: "Plantas e linhas",
                icon: Workflow,
                path: "/linhas",
                allowedProfiles: ACESSOS.LINHAS,
            },
        ],
    },
    {
        title: "Análise",
        items: [
            {
                label: "Relatórios",
                icon: ChartColumn,
                path: "/relatorios",
                allowedProfiles: ACESSOS.RELATORIOS,
            },
        ],
    },
    {
        title: "Sistema",
        items: [
            {
                label: "Usuários",
                icon: Users,
                path: "/usuarios",
                allowedProfiles: ACESSOS.USUARIOS,
            },
            {
                label: "Configurações",
                icon: Settings,
                path: "/configuracoes",
                allowedProfiles: ACESSOS.CONFIGURACOES,
            },
        ],
    },
];

function Sidebar({ isOpen, onClose }) {
    const { usuario } = useAuth();
    const perfil = usuario?.perfil;

    return (
        <>
            <button
                type="button"
                aria-label="Fechar navegação"
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${
                    isOpen
                        ? "opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-62 flex-col border-r border-white/6 bg-[#0b1220] text-white transition-transform duration-200 ease-out lg:translate-x-0 ${
                    isOpen
                        ? "translate-x-0 shadow-2xl"
                        : "-translate-x-full"
                }`}
            >
                <div className="flex h-27 shrink-0 items-center border-b border-white/[0.07] px-6">
                    <img
                        src={LOGO_PULSEAPI}
                        alt="PulseAPI — Smart Production Manager"
                        className="h-auto w-62.5 object-contain object-left p-2"
                    />

                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.07] hover:text-white lg:hidden"
                        aria-label="Fechar menu"
                    >
                        <X size={19} />
                    </button>
                </div>

                <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
                    {menuSections.map((section, sectionIndex) => {
                        const visibleItems = section.items.filter((item) =>
                            possuiAcesso(perfil, item.allowedProfiles)
                        );

                        if (visibleItems.length === 0) {
                            return null;
                        }

                        return (
                            <section
                                key={section.title || sectionIndex}
                                className="mb-5 last:mb-0"
                            >
                                {section.title && (
                                    <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        {section.title}
                                    </p>
                                )}

                                <div className="space-y-0.5">
                                    {visibleItems.map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                onClick={onClose}
                                                className={({ isActive }) =>
                                                    `group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${
                                                        isActive
                                                            ? "bg-blue-600 text-white shadow-[0_6px_18px_rgba(37,99,235,0.22)]"
                                                            : "text-slate-400 hover:bg-white/[0.055] hover:text-slate-100"
                                                    }`
                                                }
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        <Icon
                                                            size={17}
                                                            strokeWidth={isActive ? 2.2 : 1.8}
                                                            className="shrink-0"
                                                        />
                                                        <span className="truncate">
                                                            {item.label}
                                                        </span>
                                                    </>
                                                )}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}
                </nav>

                <footer className="shrink-0 border-t border-white/[0.07] px-5 py-4">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-2 font-medium text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]" />
                            Sistema online
                        </span>
                        <span className="font-medium text-slate-600">
                            v1.0.4
                        </span>
                    </div>
                </footer>
            </aside>
        </>
    );
}

export default Sidebar;
