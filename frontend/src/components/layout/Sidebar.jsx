import {
    X,
    LayoutDashboard,
    FileText,
    Factory,
    Package,
    CircleAlert,
    ChartColumn,
    Users,
    Settings,
    Wifi,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "OPs", icon: FileText, path: "/ops" },
    { label: "Linhas/Estações", icon: Factory, path: "/linhas" },
    { label: "Produtos/Processos", icon: Package, path: "/produtos" },
    { label: "Eventos", icon: CircleAlert, path: "/eventos" },
    { label: "Histórico", icon: ChartColumn, path: "/historico" },
    { label: "Usuários", icon: Users, path: "/usuarios" },
    { label: "Configurações", icon: Settings, path: "/configuracoes" },
];

function Sidebar({isOpen, onClose}) {

    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
            />

            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-6 py-6">
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-300 hover:bg-slate-800"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="px-6 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                            <Factory size={28} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">PulseAPI</h2>
                            <p className="text-sm leading-tight text-slate-300">
                                Smart Production <br/> Manager
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 border-b border-slate-700" />
                </div>

                <nav className="flex-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex h-14 items-center gap-4 px-7 text-[15px] font-semibold transition ${
                                        isActive
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-300 hover:bg-slate-900 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={22} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-800 px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                        <Wifi size={16} />
                        Conectado
                    </div>

                    <p className="mt-3 text-xs text-slate-400">v1.0.4</p>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
