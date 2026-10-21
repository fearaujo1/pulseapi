import { useCallback, useEffect, useState } from "react";
import { Factory, Network, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext.jsx";
import { ACOES, podeExecutar, } from "../config/accessControl.js";
import { plantaService } from "../services/plantaService.js";
import { linhaService } from "../services/linhaService.js";
import Topbar from "../components/layout/Topbar.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import ContentCard from "../components/common/ContentCard.jsx";
import SummaryCard from "../components/common/SummaryCard.jsx";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal.jsx";
import PlantaTable from "../components/plants/PlantaTable.jsx";
import PlantaFormModal from "../components/plants/PlantaFormModal.jsx";
import LinhaTable from "../components/lines/LinhaTable.jsx";
import LinhaFormModal from "../components/lines/LinhaFormModal.jsx";
import LinhaResponsaveisModal from "../components/lines/LinhaResponsaveisModal.jsx";
import Pagination from "../components/common/Pagination.jsx";
import usePagination from "../hooks/usePagination.js";

function PlantasLinhasPage() {
    const { usuario } = useAuth();
    const perfil = usuario?.perfil;
    const podeCriar = podeExecutar(perfil, ACOES.ESTRUTURA_CRIAR);
    const podeEditar = podeExecutar(perfil, ACOES.ESTRUTURA_EDITAR);
    const podeExcluir = podeExecutar(perfil, ACOES.ESTRUTURA_EXCLUIR);
    const podeGerenciarResponsaveis = podeExecutar(perfil, ACOES.LINHA_GERENCIAR_RESPONSAVEIS);
    const [plantas, setPlantas] = useState([]);
    const [linhas, setLinhas] = useState([]);
    const [plantaSelecionada, setPlantaSelecionada] = useState(null);
    const [loadingPlantas, setLoadingPlantas] = useState(true);
    const [loadingLinhas, setLoadingLinhas] = useState(false);
    const [plantaModalOpen, setPlantaModalOpen] = useState(false);
    const [linhaModalOpen, setLinhaModalOpen] = useState(false);
    const [responsaveisModalOpen, setResponsaveisModalOpen] = useState(false);
    const [plantaEmEdicao, setPlantaEmEdicao] = useState(null);
    const [linhaEmEdicao, setLinhaEmEdicao] = useState(null);
    const [linhaResponsaveis, setLinhaResponsaveis] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [itemParaExcluir, setItemParaExcluir] = useState(null);

    const {
        currentPage: paginaPlantas,
        totalPages: totalPaginasPlantas,
        paginatedItems: plantasPaginadas,
        setCurrentPage: setPaginaPlantas,
        resetPage: resetPaginaPlantas,
    } = usePagination(plantas, 6);

    const {
        currentPage: paginaLinhas,
        totalPages: totalPaginasLinhas,
        paginatedItems: linhasPaginadas,
        setCurrentPage: setPaginaLinhas,
        resetPage: resetPaginaLinhas,
    } = usePagination(linhas, 8);

    const carregarPlantas = useCallback(
        async (idPreferido = null) => {
            try {
                setLoadingPlantas(true);
                const data = await plantaService.listar();
                const lista = Array.isArray(data) ? data : [];
                setPlantas(lista);
                setPlantaSelecionada(
                    (atual) =>
                        lista.find(
                            (planta) =>
                                planta.id === (idPreferido ?? atual?.id)
                        ) ??
                        lista[0] ??
                        null
                );
            } catch (error) {
                mostrarErro(error, "Não foi possível carregar as plantas.");
                setPlantas([]);
                setPlantaSelecionada(null);
            } finally {
                setLoadingPlantas(false);
            }
        },
        []
    );

    const carregarLinhas = useCallback(
        async (plantaId) => {
            if (!plantaId) {
                setLinhas([]);
                return;
            }

            try {
                setLoadingLinhas(true);
                const data = await linhaService.listarPorPlanta(plantaId);
                setLinhas(Array.isArray(data) ? data : []);
            } catch (error) {
                mostrarErro(error, "Não foi possível carregar as linhas.");
                setLinhas([]);
            } finally {
                setLoadingLinhas(false);
            }
        },
        []
    );

    useEffect(() => {carregarPlantas();}, [carregarPlantas]);
    useEffect(() => {carregarLinhas(plantaSelecionada?.id);}, [plantaSelecionada?.id, carregarLinhas,]);

    function negar() {
        toast.error("Você não possui permissão para realizar esta operação.");
    }

    function novaPlanta() {
        if (!podeCriar) {
            negar();
            return;
        }
        setPlantaEmEdicao(null);
        setPlantaModalOpen(true);
    }

    function novaLinha() {
        if (!podeCriar) {
            negar();
            return;
        }
        if (!plantaSelecionada) {toast.error("Selecione uma planta.");
            return;
        }

        setLinhaEmEdicao(null);
        setLinhaModalOpen(true);
    }

    function editarPlanta(planta) {
        setPlantaEmEdicao(planta);
        setPlantaModalOpen(true);
    }

    function editarLinha(linha) {
        setLinhaEmEdicao(linha);
        setLinhaModalOpen(true);
    }

    function excluirPlanta(planta) {
        setItemParaExcluir({
            tipo: "PLANTA",
            item: planta,
        });
    }

    function excluirLinha(linha) {
        setItemParaExcluir({
            tipo: "LINHA",
            item: linha,
        });
    }

    function selecionarPlanta(planta) {
        setPlantaSelecionada(planta);
        resetPaginaLinhas();
    }

    function gerenciarResponsaveis(
        linha
    ) {
        setLinhaResponsaveis(linha);
        setResponsaveisModalOpen(true);
    }

    function fecharModalPlanta() {
        if (submitLoading) {
            return;
        }

        setPlantaModalOpen(false);
        setPlantaEmEdicao(null);
    }

    function fecharModalLinha() {
        if (submitLoading) {
            return;
        }

        setLinhaModalOpen(false);
        setLinhaEmEdicao(null);
    }

    function fecharModalResponsaveis() {
        setResponsaveisModalOpen(false);
        setLinhaResponsaveis(null);
    }

    async function salvarPlanta(dados) {
        if (
            plantaEmEdicao
                ? !podeEditar
                : !podeCriar
        ) {
            negar();
            return;
        }

        try {
            setSubmitLoading(true);

            const plantaSalva =
                plantaEmEdicao
                    ? await plantaService
                        .atualizar(
                            plantaEmEdicao.id,
                            dados
                        )
                    : await plantaService
                        .cadastrar(dados);

            toast.success(
                plantaEmEdicao
                    ? "Planta atualizada com sucesso!"
                    : "Planta criada com sucesso!"
            );

            setPlantaModalOpen(false);
            setPlantaEmEdicao(null);

            if (!plantaEmEdicao) {
                resetPaginaPlantas();
            }

            await carregarPlantas(
                plantaSalva.id
            );
        } catch (error) {
            mostrarErro(
                error,
                "Erro ao salvar planta."
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    async function salvarLinha(dados) {
        if (
            linhaEmEdicao
                ? !podeEditar
                : !podeCriar
        ) {
            negar();
            return;
        }

        try {
            setSubmitLoading(true);

            if (linhaEmEdicao) {
                await linhaService.atualizar(
                    linhaEmEdicao.id,
                    dados
                );
            } else {
                await linhaService.cadastrar(
                    dados
                );
            }

            toast.success(
                linhaEmEdicao
                    ? "Linha atualizada com sucesso!"
                    : "Linha criada com sucesso!"
            );

            setLinhaModalOpen(false);
            setLinhaEmEdicao(null);

            await carregarLinhas(
                plantaSelecionada.id
            );
        } catch (error) {
            mostrarErro(
                error,
                "Erro ao salvar linha."
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    async function confirmarExclusao() {
        if (!itemParaExcluir?.item?.id) {
            return;
        }

        try {
            setDeleteLoading(true);

            if (
                itemParaExcluir.tipo ===
                "PLANTA"
            ) {
                await plantaService.deletar(
                    itemParaExcluir.item.id
                );

                await carregarPlantas();

                toast.success(
                    "Planta excluída com sucesso!"
                );
            } else {
                await linhaService.deletar(
                    itemParaExcluir.item.id
                );

                await carregarLinhas(
                    plantaSelecionada.id
                );

                toast.success(
                    "Linha excluída com sucesso!"
                );
            }

            setItemParaExcluir(null);
        } catch (error) {
            mostrarErro(
                error,
                "Não foi possível excluir o registro."
            );
        } finally {
            setDeleteLoading(false);
        }
    }

    const indicadores = [
        {label: "Plantas", value: plantas.length, detail: "centros cadastrados", icon: Factory, color: "bg-blue-50 text-blue-600",},
        {label: "Linhas", value: linhas.length, detail: plantaSelecionada?.nome || "nenhuma planta", icon: Network, color: "bg-emerald-50 text-emerald-600",},
    ];

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="mx-auto w-full max-w-450 px-4 py-5 md:px-6 lg:px-8">
                <PageHeader
                    title="Plantas e linhas"
                    description="Organize os centros de produção e suas linhas industriais"
                />

                <SummaryCard
                    items={indicadores}
                />

                <div className="flex flex-col gap-5">
                    <ContentCard
                        title="Plantas"
                        subtitle={
                            plantaSelecionada
                                ? `Selecionada: ${plantaSelecionada.nome}`
                                : "Selecione uma planta"
                        }
                        headerActions={
                            podeCriar && (
                                <SmallButton onClick={novaPlanta}>
                                    <Plus size={14}/>
                                    Nova planta
                                </SmallButton>
                            )
                        }
                    >
                        <PlantaTable
                            plantas={plantasPaginadas}
                            plantaSelecionada={plantaSelecionada}
                            loading={loadingPlantas}
                            onSelect={selecionarPlanta}
                            onEdit={editarPlanta}
                            onDelete={excluirPlanta}
                            canEdit={podeEditar}
                            canDelete={podeExcluir}
                        />

                        {!loadingPlantas && totalPaginasPlantas > 1 && (
                            <Pagination
                                currentPage={paginaPlantas}
                                totalPages={totalPaginasPlantas}
                                onPageChange={setPaginaPlantas}
                            />
                        )}
                    </ContentCard>

                    <ContentCard
                        title="Linhas da planta"
                        subtitle={plantaSelecionada?.nome || "Nenhuma planta selecionada"}
                        headerActions={
                            podeCriar && (
                                <SmallButton
                                    onClick={novaLinha}
                                    disabled={!plantaSelecionada}
                                >
                                    <Plus size={14}/>
                                    Nova linha
                                </SmallButton>
                            )
                        }
                    >
                        <LinhaTable
                            linhas={linhasPaginadas}
                            plantaSelecionada={plantaSelecionada}
                            loading={loadingLinhas}
                            onEdit={editarLinha}
                            onDelete={excluirLinha}
                            onManageResponsaveis={gerenciarResponsaveis}
                            canEdit={podeEditar}
                            canDelete={podeExcluir}
                            canManageResponsaveis={podeGerenciarResponsaveis}
                        />

                        {!loadingLinhas &&
                            plantaSelecionada &&
                            totalPaginasLinhas > 1 && (
                                <Pagination
                                    currentPage={paginaLinhas}
                                    totalPages={totalPaginasLinhas}
                                    onPageChange={setPaginaLinhas}
                                />
                            )}
                    </ContentCard>
                </div>
            </main>

            <PlantaFormModal
                key={plantaEmEdicao?.id ?? "nova-planta"}
                isOpen={plantaModalOpen}
                initialData={plantaEmEdicao}
                loading={submitLoading}
                onSubmit={salvarPlanta}
                onClose={fecharModalPlanta}
            />

            {plantaSelecionada && (
                <LinhaFormModal
                    key={linhaEmEdicao?.id ?? "nova-linha"}
                    isOpen={linhaModalOpen}
                    planta={plantaSelecionada}
                    initialData={linhaEmEdicao}
                    loading={submitLoading}
                    onSubmit={salvarLinha}
                    onClose={fecharModalLinha}
                />
            )}

            {linhaResponsaveis && (
                <LinhaResponsaveisModal
                    isOpen={responsaveisModalOpen}
                    linha={linhaResponsaveis}
                    onClose={fecharModalResponsaveis}
                />
            )}

            <ConfirmDeleteModal
                isOpen={Boolean(itemParaExcluir)}
                onClose={() => {
                    if (!deleteLoading) {setItemParaExcluir(null);}
                }}
                onConfirm={confirmarExclusao}
                loading={deleteLoading}
                title={
                    itemParaExcluir?.tipo ===
                    "PLANTA"
                        ? "Excluir planta"
                        : "Excluir linha"
                }
                description="Confirme a exclusão deste registro."
                warningMessage={
                    itemParaExcluir?.tipo ===
                    "PLANTA"
                        ? "Plantas que possuem linhas não podem ser excluídas."
                        : "Linhas que possuem equipamentos não podem ser excluídas."
                }
                itemLabel="Registro selecionado"
                itemName={
                    itemParaExcluir?.item
                        ?.nome
                }
                details={[
                    {label: "Código", value: itemParaExcluir ?.item ?.codigo,},
                    {label: "Status", value: itemParaExcluir ?.item ?.status,},
                ]}
                confirmText="Confirmar exclusão"
            />
        </div>
    );
}

function SmallButton({
                         children,
                         className = "",
                         ...props
                     }) {
    return (
        <button
            type="button"
            {...props}
            className={`
                inline-flex h-9 items-center
                justify-center gap-1.5
                rounded-lg bg-blue-600 px-3
                text-[11px] font-semibold
                text-white transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${className}
            `}
        >
            {children}
        </button>
    );
}

function mostrarErro(error, fallback) {
    console.error(fallback, error);
    toast.error(error.response?.data?.detail || error.response?.data?.message || fallback);
}

export default PlantasLinhasPage;