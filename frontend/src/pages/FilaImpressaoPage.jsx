import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    Clock3,
    CircleAlert,
    Printer,
    Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Topbar from "../components/layout/Topbar";
import toast from "react-hot-toast";
import { filaImpressaoService } from "../services/filaImpressaoService";
import { equipamentosService } from "../services/equipamentosService";

import PageHeader from "../components/common/PageHeader";
import ContentCard from "../components/common/ContentCard";
import SummaryCard from "../components/common/SummaryCard.jsx";

import FilaImpressaoFilters from "../components/printing/FilaImpressaoFilters";
import FilaImpressaoTable from "../components/printing/FilaImpressaoTable";
import FilaImpressaoDetalhesModal from "../components/printing/FilaImpressaoDetalhesModal";

function FilaImpressaoPage() {

    const navigate = useNavigate();
    const { usuario } = useAuth();

    const podeCancelar = ["ADMIN", "GESTOR", "SUPERVISOR"].includes(
        usuario?.perfil
    );

    const [selectedItem, setSelectedItem] = useState(null);

    const [fila, setFila] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [equipamentoFilter, setEquipamentoFilter] = useState("");

    async function carregarDados(showLoading = false) {
        try {
            if (showLoading) {
                setLoading(true);
            }

            const [filaData, equipamentosData] = await Promise.all([
                filaImpressaoService.listar(),
                equipamentosService.listar(),
            ]);

            setFila(
                Array.isArray(filaData)
                    ? filaData
                    : []
            );

            setEquipamentos(
                Array.isArray(equipamentosData)
                    ? equipamentosData
                    : []
            );

        } catch (error) {
            console.error(
                "Erro ao carregar fila de impressão:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                "Erro ao carregar fila de impressão."
            );

        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        carregarDados(true);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            carregarDados(false);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const filaFiltrada = useMemo(() => {
        const searchLower =
            search.trim().toLowerCase();

        return fila.filter((item) => {
            const matchSearch =
                !searchLower ||
                item.equipamentoNome
                    ?.toLowerCase()
                    .includes(searchLower) ||
                item.layoutNome
                    ?.toLowerCase()
                    .includes(searchLower) ||
                item.payloadMontado
                    ?.toLowerCase()
                    .includes(searchLower);

            const matchStatus =
                !statusFilter ||
                item.status === statusFilter;

            const matchEquipamento =
                !equipamentoFilter ||
                String(item.equipamentoId) ===
                equipamentoFilter;

            return (
                matchSearch &&
                matchStatus &&
                matchEquipamento
            );
        });

    }, [
        fila,
        search,
        statusFilter,
        equipamentoFilter,
    ]);

    const total = fila.length;

    const pendentes = fila.filter(
        (item) =>
            item.status === "PENDENTE"
    ).length;

    const emProcessamento = fila.filter(
        (item) =>
            item.status === "ENVIANDO" ||
            item.status === "ENVIADO_FIFO" ||
            item.status === "PRONTO_IMPRESSAO"
    ).length;

    const impressos = fila.filter(
        (item) =>
            item.status === "IMPRESSO"
    ).length;

    const erros = fila.filter(
        (item) =>
            item.status === "ERRO"
    ).length;

    async function handleCancelar(item) {
        try {
            await filaImpressaoService.cancelar(
                item.id
            );

            toast.success(
                "Item cancelado com sucesso."
            );

            await carregarDados(false);

        } catch (error) {
            console.error(
                "Erro ao cancelar item:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                "Não foi possível cancelar o item."
            );
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <PageHeader
                    title="Fila de Impressão"
                    description="Acompanhamento dos dados enviados às codificadoras"
                >
                    <button
                        type="button"
                        onClick={() => navigate("/fila-impressao/nova")}
                        className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Nova Impressão
                    </button>
                </PageHeader>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-6">
                    <SummaryCard
                        title="Total"
                        value={total}
                        subtitle="Registros da fila"
                        icon={
                            <Printer
                                size={26}
                                className="text-blue-600"
                            />
                        }
                        className="border-blue-200 bg-blue-50"
                    />

                    <SummaryCard
                        title="Pendentes"
                        value={pendentes}
                        subtitle="Aguardando envio"
                        icon={
                            <Clock3
                                size={26}
                                className="text-amber-600"
                            />
                        }
                        className="border-amber-200 bg-amber-50"
                    />

                    <SummaryCard
                        title="Em Processamento"
                        value={emProcessamento}
                        subtitle="Na esteira de impressão"
                        icon={
                            <Printer
                                size={26}
                                className="text-violet-600"
                            />
                        }
                        className="border-violet-200 bg-violet-50"
                    />

                    <SummaryCard
                        title="Impressos"
                        value={impressos}
                        subtitle="Confirmados"
                        icon={
                            <CheckCircle2
                                size={26}
                                className="text-green-600"
                            />
                        }
                        className="border-green-200 bg-green-50"
                    />

                    <SummaryCard
                        title="Erros"
                        value={erros}
                        subtitle="Precisam de atenção"
                        icon={
                            <CircleAlert
                                size={26}
                                className="text-red-600"
                            />
                        }
                        className="border-red-200 bg-red-50"
                    />
                </section>

                <ContentCard
                    title="Registros da Fila"
                    subtitle="Atualização automática a cada 3 segundos"
                >
                    <div className="mb-6">
                        <FilaImpressaoFilters
                            search={search}
                            onSearchChange={setSearch}
                            equipamentoFilter={equipamentoFilter}
                            onEquipamentoChange={setEquipamentoFilter}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            equipamentos={equipamentos}
                        />
                    </div>

                    <FilaImpressaoTable
                        fila={filaFiltrada}
                        loading={loading}
                        canCancel={podeCancelar}
                        onSelect={setSelectedItem}
                        onCancel={handleCancelar}
                    />
                </ContentCard>
            </main>
            {selectedItem && (
                <FilaImpressaoDetalhesModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
}

export default FilaImpressaoPage;
