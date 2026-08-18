import { useEffect, useState } from "react";
import {
    AlertTriangle,
    CircleHelp,
    ClipboardList,
    Send,
} from "lucide-react";
import toast from "react-hot-toast";

import Topbar from "../components/layout/Topbar";
import { equipamentosService } from "../services/equipamentosService";
import { ocorrenciaService } from "../services/ocorrenciaService.js";


const initialForm = {
    titulo: "",
    descricao: "",
    tipo: "FALHA_EQUIPAMENTO",
    equipamentoId: "",
};

function RegistrarOcorrenciaPage() {
    const [formData, setFormData] = useState(initialForm);
    const [equipamentos, setEquipamentos] = useState([]);
    const [loadingEquipamentos, setLoadingEquipamentos] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    
    async function carregarEquipamentos() {
        try {
            setLoadingEquipamentos(true);

            const data = await equipamentosService.listar();
            setEquipamentos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar equipamentos:", error);
            console.error("Resposta:", error.response?.data);
            toast.error("Erro ao carregar equipamentos.");
            setEquipamentos([]);
        } finally {
            setLoadingEquipamentos(false);
        }
    }

    useEffect(() => {
        carregarEquipamentos();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "equipamentoId" ? Number(value) : value,
        }));
    }

    async function handleSubmit(equipamento) {
        equipamento.preventDefault();

        if (!formData.equipamentoId) {
            toast.error("Selecione um equipamento.");
            return;
        }

        try {
            setSubmitLoading(true);

            const payload = {
                titulo: formData.titulo,
                descricao: formData.descricao,
                tipo: formData.tipo,
                equipamentoId: Number(formData.equipamentoId),
            };

            await ocorrenciaService.criar(payload);

            toast.success("Parada registrada com sucesso!");
            setFormData(initialForm);
        } catch (error) {
            console.error("Erro ao registrar parada:", error);
            console.error("Resposta:", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao registrar parada."
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <section className="mb-6 flex justify-end">
                    {/*
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-950">
                            Registrar Parada
                        </h1>

                        <p className="mt-1 text-[16px] text-slate-600">
                            Registre rapidamente uma ocorrência ou parada de produção
                        </p>
                    </div>
                    */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowHelp((prev) => !prev)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600 shadow-sm hover:bg-blue-50 transition"
                            title="Orientações"
                        >
                            <CircleHelp size={22} />
                        </button>

                        {showHelp && (
                            <div className="absolute right-0 top-14 z-50 w-[320px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
                                <h2 className="mb-4 text-[18px] font-bold text-slate-950">
                                    Orientações
                                </h2>

                                <div className="space-y-4 text-[13.5px] text-slate-600">
                                    <p>
                                        <strong className="text-slate-900">Falha:</strong> problema
                                        em equipamento que impacta a produção.
                                    </p>

                                    <p>
                                        <strong className="text-slate-900">Parada:</strong>{" "}
                                        interrupção operacional da linha.
                                    </p>

                                    <p>
                                        <strong className="text-slate-900">Manutenção:</strong>{" "}
                                        ação preventiva ou corretiva registrada.
                                    </p>
                                </div>

                                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                    <p className="text-[13px] font-semibold text-amber-700">
                                        Atenção
                                    </p>

                                    <p className="mt-1 text-[12.5px] text-amber-700/90">
                                        Registre informações claras para facilitar o acompanhamento
                                        da equipe responsável.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="flex justify-center">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-5xl rounded-[32px] border border-slate-200 bg-white shadow-sm p-6 md:p-6"
                    >
                        <div className="mb-10 text-center">
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <AlertTriangle size={30} />
                            </div>

                            <h2 className="text-[28px] font-bold text-slate-950">
                                Nova Ocorrência
                            </h2>

                            <p className="mt-1 text-[14.5px] text-slate-500">
                                Preencha os dados da parada identificada no chão de fábrica
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Título *">
                                <input
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    placeholder="Ex: Falha na impressora"
                                    required
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                                />
                            </Field>

                            <Field label="Tipo *">
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    required
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                                >
                                    <option value="FALHA_EQUIPAMENTO">
                                        Falha de equipamento
                                    </option>
                                    <option value="PARADA_LINHA">Parada de linha</option>
                                    <option value="MANUTENCAO">Manutenção</option>
                                    <option value="OUTRO">Outro</option>
                                </select>
                            </Field>

                            <Field label="Equipamento *">
                                <select
                                    name="equipamentoId"
                                    value={formData.equipamentoId}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingEquipamentos}
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px] disabled:opacity-70"
                                >
                                    <option value="">
                                        {loadingEquipamentos
                                            ? "Carregando equipamentos..."
                                            : "Selecione um equipamento"}
                                    </option>

                                    {equipamentos.map((equipamento) => (
                                        <option key={equipamento.id} value={equipamento.id}>
                                            {equipamento.codigo} - {equipamento.nome}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Descrição">
                                <textarea
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleChange}
                                    placeholder="Descreva o que aconteceu..."
                                    className="min-h-[110px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 text-[13px]"
                                />
                            </Field>
                        </div>

                        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                            <div className="flex gap-3">
                                <ClipboardList className="mt-0.5 text-blue-600" size={20} />

                                <div>
                                    <p className="text-[14.5px] font-semibold text-blue-700">
                                        Registro operacional
                                    </p>

                                    <p className="mt-1 text-[12.5px] text-blue-700/90">
                                        As informações registradas ficarão disponíveis para
                                        acompanhamento da equipe responsável.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <Send size={16} />
                                {submitLoading ? "Registrando..." : "Registrar Parada"}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="mb-2 block text-[14.5px] font-semibold text-slate-900">
                {label}
            </label>

            {children}
        </div>
    );
}

export default RegistrarOcorrenciaPage;