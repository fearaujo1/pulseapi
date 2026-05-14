import { Bell, Menu, Search, ChevronDown, UserCircle2 } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar.jsx";

function Topbar() {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    return (
        <>
            <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-slate-100"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="hidden md:flex items-center gap-3">
                        <button className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-[13.5px] flex items-center gap-2 text-slate-700">
                            Planta Londrina <ChevronDown size={18} />
                        </button>

                        <button className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-[13.5px] flex items-center gap-2 text-slate-700">
                            Todas as linhas <ChevronDown size={18} />
                        </button>

                        <button className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-[13.5px] flex items-center gap-2 text-slate-700">
                            Turno A <ChevronDown size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="hidden lg:flex items-center gap-3 w-[420px] h-10 rounded-2x1 border border-slate-200 px-4 bg-slate-50">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar equipamento, código, setor..."
                            className="w-full bg-transparent outline-none text-[13.5px] text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    <button className="relative w-11 h-11 rounded-xl flex items-center justify-center hover:bg-slate-100">
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[12px] flex items-center justify-center">
                        3
                    </span>
                    </button>
                    <div className="flex items-center gap-3">
                        <UserCircle2 size={30} className="text-blue-600" />
                        <div className="hidden md:block leading-tight">
                            <p className="font-semibold text-[15px] text-slate-800">João Silva</p>
                            <p className="text-[12px] text-slate-500">Supervisor</p>
                        </div>
                        <ChevronDown size={18} className="text-slate-500" />
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
