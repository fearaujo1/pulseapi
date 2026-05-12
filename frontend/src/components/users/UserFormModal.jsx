import { useEffect, useState } from "react";
import { X, User, Mail, Lock, ChevronDown, Info } from "lucide-react";

const initialForm = {
    nome: "",
    email: "",
    senha: "",
    perfil: "OPERADOR",
};

function UserFormModal({
                           isOpen,
                           onClose,
                           onSubmit,
                           loading = false,
                           initialData = null,
                           mode = "create",
                       }) {
    const [formData, setFormData] = useState(initialForm);

    const isEditMode = mode === "edit";

    useEffect(() => {
        if (initialData) {
            setFormData({
                nome: initialData.nome || "",
                email: initialData.email || "",
                senha: "",
                perfil: initialData.perfil || "OPERADOR",
            });
        } else {
            setFormData(initialForm);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        onSubmit(formData);
    }



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-3xl rounded-[28px] bg-white shadow-2xl">
                <div className="flex items-start justify-between px-8 pt-8">
                    <div>
                        <h2 className="text-[20px] font-bold text-slate-900">
                            Novo Usuário
                        </h2>
                        <p className="mt-2 text-[13px] text-slate-500">
                            Cadastre um usuário e defina seu perfil de acesso
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                Nome completo *
                            </label>

                            <div className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 flex items-center gap-3 outline-none focus-within:border-blue-500">
                                <User size={17} className="text-slate-400" />
                                <input
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    placeholder="Ex: João Silva"
                                    className="w-full bg-transparent outline-none text-[13px]"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                E-mail *
                            </label>

                            <div className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 flex items-center gap-3 outline-none focus-within:border-blue-500">
                                <Mail size={17} className="text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="usuario@empresa.com"
                                    className="w-full bg-transparent outline-none text-[13px]"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                Senha temporária *
                            </label>

                            <div className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 flex items-center gap-3 outline-none focus-within:border-blue-500">
                                <Lock size={17} className="text-slate-400" />
                                <input
                                    type="password"
                                    name="senha"
                                    value={formData.senha}
                                    onChange={handleChange}
                                    placeholder={isEditMode ? "Deixe em branco para manter a senha atual" : "Ex: 12345"}
                                    className="w-full bg-transparent outline-none text-[13px]"
                                    required={!isEditMode}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                                Perfil *
                            </label>

                            <div className="relative">
                                <select
                                    name="perfil"
                                    value={formData.perfil}
                                    onChange={handleChange}
                                    className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                                    required
                                >
                                    <option value="OPERADOR">Operador</option>
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="GESTOR">Gestor</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>

                                <ChevronDown
                                    size={17}
                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                        <div className="flex gap-3">
                            <Info className="mt-0.5 text-blue-600" size={20} />
                            <div>
                                <p className="text-[14.5px] font-semibold text-blue-700">
                                    Primeiro acesso:
                                </p>
                                <p className="mt-1 text-[12.5px] text-blue-700/90">
                                    O usuário deverá alterar a senha temporária no primeiro login.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-6 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-70 text-[13.5px]"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-10 rounded-xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 text-[13.5px]"
                        >
                            {loading
                                ? "Salvando..."
                                : isEditMode ? "Salvar Alterações" : "Criar Usuário"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserFormModal;