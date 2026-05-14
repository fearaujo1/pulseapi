import { useState } from "react";
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

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }


    return (
        <>
            <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition"
                        title="Abrir menu"
                    >
                        <Menu size={22} />
                    </button>


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
                    <button
                        className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition"
                        title="Notificações"
                    >
                        <Bell size={20} />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" />
                    </button>

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

export default Topbar;
