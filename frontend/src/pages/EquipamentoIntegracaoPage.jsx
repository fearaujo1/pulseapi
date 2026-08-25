import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Topbar from "../components/layout/Topbar";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { equipamentosService } from "../services/equipamentosService";
import { dominoService } from "../services/dominoService";
import EquipmentIntegrationCard from "../components/equipment/EquipmentIntegrationCard";
import IntegrationOperationalCards from "../components/equipment/IntegrationOperationalCards";
import CodificadoraTechnicalInfo from "../components/equipment/CodificadoraTechnicalInfo";
import IntegrationSkeleton from "../components/equipment/IntegrationSkeleton";

function EquipamentoIntegracaoPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [equipamento, setEquipamento] = useState(null);
    const [status, setStatus] = useState(null);
    const [identidade, setIdentidade] = useState(null);
    const [configuracao, setConfiguracao] = useState(null);
    const [fifo, setFifo] = useState(null);
    const [layoutOnline, setLayoutOnline] = useState(null);
    const [contador, setContador] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const initialLoadStarted = useRef(false);

    const carregarDados = useCallback(async (mostrarLoading = false) => {
        try {
            if (mostrarLoading) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const equipamentoData =
                await equipamentosService.buscarPorId(id);

            setEquipamento(equipamentoData);

            const [
                statusResult,
                identidadeResult,
                configuracaoResult,
                fifoResult,
                layoutResult,
                contadorResult,
            ] = await Promise.allSettled([
                dominoService.consultarStatus(id),
                dominoService.consultarIdentidade(id),
                dominoService.consultarConfiguracao(id),
                dominoService.consultarQuantidadeFifo(id),
                dominoService.consultarLayoutOnline(id),
                dominoService.consultarContadorProdutos(id),
            ]);

            setStatus(
                statusResult.status === "fulfilled"
                    ? statusResult.value
                    : null
            );

            setIdentidade(
                identidadeResult.status === "fulfilled"
                    ? identidadeResult.value
                    : null
            );

            setConfiguracao(
                configuracaoResult.status === "fulfilled"
                    ? configuracaoResult.value
                    : null
            );

            setFifo(
                fifoResult.status === "fulfilled"
                    ? fifoResult.value
                    : null
            );

            setLayoutOnline(
                layoutResult.status === "fulfilled"
                    ? layoutResult.value
                    : null
            );

            setContador(
                contadorResult.status === "fulfilled"
                    ? contadorResult.value
                    : null
            );

            const consultasPrincipais = [
                statusResult,
                identidadeResult,
                configuracaoResult,
                fifoResult,
                layoutResult,
                contadorResult,
            ];

            const falhas = consultasPrincipais.filter(
                (result) => result.status === "rejected"
            ).length;

            if (falhas > 0) {
                toast.error(
                    `${falhas} consulta(s) à codificadora não responderam.`,
                    {
                        id: `domino-consultas-falhas-${id}`,
                    }
                );
            }

        } catch (error) {
            console.error(
                "Erro ao carregar integração Domino:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                "Erro ao carregar dados da integração."
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        if (initialLoadStarted.current) {
            return;
        }

        initialLoadStarted.current = true;
        carregarDados(true);
    }, [carregarDados]);

    const conectado =
        status !== null ||
        identidade !== null;

    if (loading) {
        return (
            <main className="p-4 md:p-6">
                <IntegrationSkeleton />
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">

                {/* CABEÇALHO */}
                <section className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div>
                        <button
                            onClick={() => navigate("/equipamentos")}
                            className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
                        >
                            <ArrowLeft size={17} />
                            Voltar para equipamentos
                        </button>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-950">
                            Integração Domino
                        </h1>

                        <p className="mt-1 text-[16px] text-slate-600">
                            Monitoramento e comunicação com a codificadora industrial
                        </p>
                    </div>

                    <button
                        onClick={() => carregarDados(false)}
                        disabled={refreshing}
                        className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm transition"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />

                        {refreshing
                            ? "Atualizando..."
                            : "Atualizar"}
                    </button>
                </section>

                <EquipmentIntegrationCard
                    equipamento={equipamento}
                    conectado={conectado}
                />

                <IntegrationOperationalCards
                    status={status}
                    layoutOnline={layoutOnline}
                    fifo={fifo}
                    contador={contador}
                />

                <CodificadoraTechnicalInfo
                    identidade={identidade}
                    configuracao={configuracao}
                />
            </main>
        </div>
    );
}

export default EquipamentoIntegracaoPage;