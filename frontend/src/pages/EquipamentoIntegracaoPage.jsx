import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    CircleAlert,
    Cpu,
    Database,
    Hash,
    Layers3,
    RefreshCw,
    Server,
    Wifi,
} from "lucide-react";
import toast from "react-hot-toast";

import Topbar from "../components/layout/Topbar";
import { equipamentosService } from "../services/equipamentosService";
import { dominoService } from "../services/dominoService";

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
                    `${falhas} consulta(s) à codificadora não responderam.`
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
        carregarDados(true);
    }, [carregarDados]);

    function formatarNumero(valor) {
        if (valor === null || valor === undefined) {
            return "-";
        }

        const numero = Number(valor);

        if (Number.isNaN(numero)) {
            return valor;
        }

        return numero.toLocaleString("pt-BR");
    }

    const quantidadeFifo =
        fifo?.quantidadeItens ??
        fifo?.quantidade ??
        null;

    const contadorAtual =
        contador?.contador ??
        contador?.quantidade ??
        contador?.valor ??
        null;

    const nomeLayout =
        layoutOnline?.nomeLayout ??
        layoutOnline?.layout ??
        layoutOnline?.nome ??
        "-";

    const conectado =
        status !== null ||
        identidade !== null;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <Topbar />

                <main className="p-4 md:p-6">
                    <div className="animate-pulse">
                        <div className="h-10 w-72 bg-slate-200 rounded-xl mb-3" />
                        <div className="h-5 w-96 max-w-full bg-slate-200 rounded-lg mb-8" />

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-36 bg-white border border-slate-200 rounded-[24px]"
                                />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
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

                {/* IDENTIFICAÇÃO DO EQUIPAMENTO */}
                <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <Cpu
                                    size={28}
                                    className="text-blue-600"
                                />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-950">
                                    {equipamento?.nome || "Equipamento"}
                                </h2>

                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                                    <span>
                                        {equipamento?.codigo || "-"}
                                    </span>

                                    <span>•</span>

                                    <span>
                                        {equipamento?.ip || "-"}:
                                        {equipamento?.porta || "-"}
                                    </span>

                                    {equipamento?.protocolo && (
                                        <>
                                            <span>•</span>
                                            <span>
                                                {equipamento.protocolo}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div
                            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                                conectado
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                            }`}
                        >
                            {conectado ? (
                                <CheckCircle2 size={17} />
                            ) : (
                                <CircleAlert size={17} />
                            )}

                            {conectado
                                ? "Comunicação disponível"
                                : "Sem comunicação"}
                        </div>
                    </div>
                </section>

                {/* CARDS OPERACIONAIS */}
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

                    <InfoCard
                        titulo="Status"
                        valor={
                            status
                                ? `Código ${status.codigoStatus}`
                                : "Indisponível"
                        }
                        detalhe={
                            status
                                ? `Jato ${status.jato} • ${status.horarioAlteracao}`
                                : "Sem resposta"
                        }
                        icon={<Wifi size={24} />}
                    />

                    <InfoCard
                        titulo="Layout Online"
                        valor={nomeLayout}
                        detalhe="Layout ativo na codificadora"
                        icon={<Layers3 size={24} />}
                    />

                    <InfoCard
                        titulo="FIFO"
                        valor={
                            quantidadeFifo !== null
                                ? `${quantidadeFifo} item(ns)`
                                : "Indisponível"
                        }
                        detalhe="Itens aguardando consumo"
                        icon={<Database size={24} />}
                    />

                    <InfoCard
                        titulo="Contador"
                        valor={formatarNumero(contadorAtual)}
                        detalhe="Contador de produtos"
                        icon={<Hash size={24} />}
                    />
                </section>

                {/* INFORMAÇÕES TÉCNICAS */}
                <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Server
                            size={22}
                            className="text-blue-600"
                        />

                        <div>
                            <h2 className="text-xl font-bold text-slate-950">
                                Informações da Codificadora
                            </h2>

                            <p className="text-sm text-slate-500">
                                Identificação e configuração retornadas pelo equipamento
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-6">
                        <TechnicalField
                            label="Tipo"
                            value={identidade?.tipoDescricao}
                        />

                        <TechnicalField
                            label="Código do Tipo"
                            value={identidade?.tipoCodigo}
                        />

                        <TechnicalField
                            label="Software"
                            value={identidade?.softwarePartNumber}
                        />

                        <TechnicalField
                            label="Software Issue"
                            value={identidade?.softwareIssue}
                        />

                        <TechnicalField
                            label="Codenet ID"
                            value={identidade?.codenetId}
                        />

                        <TechnicalField
                            label="Quantidade de Jatos"
                            value={configuracao?.quantidadeJatos}
                        />

                        <TechnicalField
                            label="Máximo de Layouts"
                            value={configuracao?.maximoLayouts}
                        />

                        <TechnicalField
                            label="Baud Rate"
                            value={configuracao?.baudRateSerial}
                        />

                        <TechnicalField
                            label="Controle de Fluxo"
                            value={configuracao?.controleFluxoSerial}
                        />

                        <TechnicalField
                            label="Formato Código de Barras"
                            value={configuracao?.formatoCodigoBarras}
                        />

                        <TechnicalField
                            label="Tamanho Máximo Layout"
                            value={configuracao?.tamanhoMaximoLayout}
                        />
                    </div>
                </section>
            </main>
        </div>
    );
}

function InfoCard({
                      titulo,
                      valor,
                      detalhe,
                      icon,
                  }) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {titulo}
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-950">
                        {valor}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        {detalhe}
                    </p>
                </div>

                <div className="h-11 w-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function TechnicalField({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-[15px] font-semibold text-slate-800">
                {value ?? "-"}
            </p>
        </div>
    );
}

export default EquipamentoIntegracaoPage;