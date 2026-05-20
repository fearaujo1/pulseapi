import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CircleAlert,
    ClipboardList,
    Factory,
    Plus,
    Search,
    Wrench,
} from "lucide-react";
import toast from "react-hot-toast";

import Topbar from "../components/layout/Topbar";
import SummaryCard from "../components/equipment/SummaryCard";
import CustomFilterSelect from "../components/equipment/CustomFilterSelect";
import { paradasService } from "../services/paradasService";

const tipoOptions = [
    { value: "", label: "Todos os tipos" },
    { value: "FALHA_EQUIPAMENTO", label: "Falha de equipamento" },
    { value: "PARADA_LINHA", label: "Parada de linha" },
    { value: "MANUTENCAO", label: "Manutenção" },
    { value: "OUTRO", label: "Outro" },
];

function tipoLabel(tipo) {
    const labels = {
        FALHA_EQUIPAMENTO: "Falha de equipamento",
        PARADA_LINHA: "Parada de linha",
        MANUTENCAO: "Manutenção",
        OUTRO: "Outro",
    };

    return labels[tipo] || tipo;
}

function tipoClass(tipo) {
    const classes = {
        FALHA_EQUIPAMENTO: "bg-red-50 text-red-600",
        PARADA_LINHA: "bg-amber-50 text-amber-600",
        MANUTENCAO: "bg-blue-50 text-blue-600",
        OUTRO: "bg-slate-100 text-slate-600",
    };

    return classes[tipo] || "bg-slate-100 text-slate-600";
}

function EventosPage() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [tipoFilter, setTipoFilter] = useState("");

    async function carregarEventos() {
        try {
            setLoading(true);

            const data = await paradasService.listar();
            setEventos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar eventos:", error);
            console.error("Resposta:", error.response?.data);
            toast.error("Erro ao carregar eventos.");
            setEventos([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregarEventos();
    }, []);

    const eventosFiltrados = useMemo(() => {
        const searchLower = search.trim().toLowerCase();

        return eventos.filter((evento) => {
            const matchSearch =
                !searchLower ||
                evento.titulo?.toLowerCase().includes(searchLower) ||
                evento.descricao?.toLowerCase().includes(searchLower) ||
                evento.equipamentoNome?.toLowerCase().includes(searchLower) ||
                evento.equipamentoCodigo?.toLowerCase().includes(searchLower);

            const matchTipo = !tipoFilter || evento.tipo === tipoFilter;

            return matchSearch && matchTipo;
        });
    }, [eventos, search, tipoFilter]);

    const total = eventos.length;
    const falhas = eventos.filter((e) => e.tipo === "FALHA_EQUIPAMENTO").length;
    const paradas = eventos.filter((e) => e.tipo === "PARADA_LINHA").length;
    const manutencoes = eventos.filter((e) => e.tipo === "MANUTENCAO").length;

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <section className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-950">
                            Eventos e Ocorrências
                        </h1>

                        <p className="mt-1 text-[16px] text-slate-600">
                            Registro e acompanhamento de ocorrências, falhas e paradas de produção
                        </p>
                    </div>

                    <button className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] flex items-center gap-2 shadow-sm">
                        <Plus size={15} />
                        Nova Ocorrência
                    </button>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                    <SummaryCard
                        title="Total de Eventos"
                        value={total}
                        subtitle="Ocorrências registradas"
                        icon={<ClipboardList size={28} className="text-blue-600" />}
                        className="border-blue-200 bg-blue-50"
                    />

                    <SummaryCard
                        title="Falhas de Equipamento"
                        value={falhas}
                        subtitle="Falhas registradas"
                        icon={<AlertTriangle size={28} className="text-red-600" />}
                        className="border-red-200 bg-red-50"
                    />

                    <SummaryCard
                        title="Paradas de Linha"
                        value={paradas}
                        subtitle="Paradas operacionais"
                        icon={<CircleAlert size={28} className="text-amber-600" />}
                        className="border-amber-200 bg-amber-50"
                    />

                    <SummaryCard
                        title="Manutenções"
                        value={manutencoes}
                        subtitle="Eventos de manutenção"
                        icon={<Wrench size={28} className="text-slate-600" />}
                        className="border-slate-200 bg-white"
                    />
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                        <h2 className="text-[24px] md:text-xl font-bold text-slate-950">
                            Lista de Eventos ({eventosFiltrados.length})
                        </h2>
                    </div>

                    <div className="mb-6">
                        <div className="flex flex-col xl:flex-row gap-4">
                            <div className="flex items-center gap-3 flex-1 h-14 rounded-2xl bg-slate-50 border border-slate-200 px-4 transition-all duration-200 focus-within:border-blue-500 focus-within:bg-white">
                                <Search size={18} className="text-slate-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por título, descrição ou equipamento..."
                                    className="w-full bg-transparent outline-none text-[16px] placeholder:text-slate-400"
                                />
                            </div>

                            <div className="flex gap-4 flex-wrap">
                                <CustomFilterSelect
                                    value={tipoFilter}
                                    onChange={setTipoFilter}
                                    options={tipoOptions}
                                    placeholder="Todos os tipos"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-left">
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Título</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Tipo</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Equipamento</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Descrição</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Ações</th>
                                </tr>
                                </thead>

                                <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                            Carregando eventos...
                                        </td>
                                    </tr>
                                ) : eventosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                            Nenhum evento encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    eventosFiltrados.map((evento) => (
                                        <tr
                                            key={evento.id}
                                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                                {evento.titulo || "-"}
                                            </td>

                                            <td className="px-6 py-5">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tipoClass(evento.tipo)}`}>
                            {tipoLabel(evento.tipo)}
                          </span>
                                            </td>

                                            <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Factory size={15} />
                                                    <span>
                              {evento.equipamentoNome || "-"}{" "}
                                                        {evento.equipamentoCodigo ? `(${evento.equipamentoCodigo})` : ""}
                            </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-[13.5px] text-slate-600 max-w-[360px] truncate">
                                                {evento.descricao || "-"}
                                            </td>

                                            <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                                Em breve
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default EventosPage;