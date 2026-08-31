import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Factory,
    Network,
    Plus,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext.jsx";
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

function PlantasLinhasPage() {
    const { usuario } = useAuth();

    const canManage = [
        "ADMIN",
        "GESTOR",
    ].includes(usuario?.perfil);

    const [plantas, setPlantas] = useState([]);
    const [linhas, setLinhas] = useState([]);

    const [
        plantaSelecionada,
        setPlantaSelecionada,
    ] = useState(null);

    const [loadingPlantas, setLoadingPlantas] =
        useState(true);

    const [loadingLinhas, setLoadingLinhas] =
        useState(false);

    const [plantaModalOpen, setPlantaModalOpen] =
        useState(false);

    const [linhaModalOpen, setLinhaModalOpen] =
        useState(false);

    const [plantaEmEdicao, setPlantaEmEdicao] =
        useState(null);

    const [linhaEmEdicao, setLinhaEmEdicao] =
        useState(null);

    const [submitLoading, setSubmitLoading] =
        useState(false);

    const [deleteLoading, setDeleteLoading] =
        useState(false);

    const [itemParaExcluir, setItemParaExcluir] =
        useState(null);

    useEffect(() => {
        carregarPlantas();
    }, []);

    useEffect(() => {
        if (!plantaSelecionada?.id) {
            setLinhas([]);
            return;
        }

        carregarLinhas(plantaSelecionada.id);
    }, [plantaSelecionada?.id]);

    async function carregarPlantas(
        plantaIdPreferida = null
    ) {
        try {
            setLoadingPlantas(true);

            const data = await plantaService.listar();
            const lista = Array.isArray(data)
                ? data
                : [];

            setPlantas(lista);

            const idDesejado =
                plantaIdPreferida ??
                plantaSelecionada?.id;

            const proximaSelecao =
                lista.find(
                    (planta) =>
                        planta.id === idDesejado
                ) ??
                lista[0] ??
                null;

            setPlantaSelecionada(
                proximaSelecao
            );
        } catch (error) {
            console.error(
                "Erro ao carregar plantas:",
                error
            );

            setPlantas([]);
            setPlantaSelecionada(null);
            toast.error(
                "Erro ao carregar plantas."
            );
        } finally {
            setLoadingPlantas(false);
        }
    }

    async function carregarLinhas(plantaId) {
        try {
            setLoadingLinhas(true);

            const data =
                await linhaService
                    .listarPorPlanta(plantaId);

            setLinhas(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                "Erro ao carregar linhas:",
                error
            );

            setLinhas([]);
            toast.error(
                "Erro ao carregar linhas."
            );
        } finally {
            setLoadingLinhas(false);
        }
    }

    function abrirNovaPlanta() {
        setPlantaEmEdicao(null);
        setPlantaModalOpen(true);
    }

    function abrirEdicaoPlanta(planta) {
        setPlantaEmEdicao(planta);
        setPlantaModalOpen(true);
    }

    function abrirNovaLinha() {
        if (!plantaSelecionada) {
            toast.error(
                "Selecione uma planta."
            );
            return;
        }

        setLinhaEmEdicao(null);
        setLinhaModalOpen(true);
    }

    function abrirEdicaoLinha(linha) {
        setLinhaEmEdicao(linha);
        setLinhaModalOpen(true);
    }

    async function salvarPlanta(formData) {
        try {
            setSubmitLoading(true);

            let salva;

            if (plantaEmEdicao) {
                salva =
                    await plantaService.atualizar(
                        plantaEmEdicao.id,
                        formData
                    );

                toast.success(
                    "Planta atualizada com sucesso!"
                );
            } else {
                salva =
                    await plantaService.cadastrar(
                        formData
                    );

                toast.success(
                    "Planta criada com sucesso!"
                );
            }

            setPlantaModalOpen(false);
            setPlantaEmEdicao(null);

            await carregarPlantas(salva.id);
        } catch (error) {
            mostrarErro(
                error,
                "Erro ao salvar planta."
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    async function salvarLinha(formData) {
        try {
            setSubmitLoading(true);

            if (linhaEmEdicao) {
                await linhaService.atualizar(
                    linhaEmEdicao.id,
                    formData
                );

                toast.success(
                    "Linha atualizada com sucesso!"
                );
            } else {
                await linhaService.cadastrar(
                    formData
                );

                toast.success(
                    "Linha criada com sucesso!"
                );
            }

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

    function solicitarExclusaoPlanta(planta) {
        setItemParaExcluir({
            tipo: "PLANTA",
            item: planta,
        });
    }

    function solicitarExclusaoLinha(linha) {
        setItemParaExcluir({
            tipo: "LINHA",
            item: linha,
        });
    }

    async function confirmarExclusao() {
        if (!itemParaExcluir?.item?.id) {
            return;
        }

        try {
            setDeleteLoading(true);

            if (
                itemParaExcluir.tipo === "PLANTA"
            ) {
                await plantaService.deletar(
                    itemParaExcluir.item.id
                );

                setPlantaSelecionada(null);

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
                itemParaExcluir.tipo === "PLANTA"
                    ? "Não foi possível excluir a planta."
                    : "Não foi possível excluir a linha."
            );
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <PageHeader
                    title="Plantas e Linhas"
                    description="Organização dos centros de produção e suas linhas industriais"
                />

                <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <SummaryCard
                        title="Plantas"
                        value={plantas.length}
                        subtitle="Centros de produção cadastrados"
                        icon={
                            <Factory
                                size={26}
                                className="text-blue-600"
                            />
                        }
                        className="border-blue-200 bg-blue-50"
                    />

                    <SummaryCard
                        title="Linhas da Planta"
                        value={linhas.length}
                        subtitle={
                            plantaSelecionada
                                ? plantaSelecionada.nome
                                : "Nenhuma planta selecionada"
                        }
                        icon={
                            <Network
                                size={26}
                                className="text-emerald-600"
                            />
                        }
                        className="border-emerald-200 bg-emerald-50"
                    />
                </section>

                <div className="space-y-6">
                    <ContentCard
                        title="Plantas"
                        headerActions={
                            canManage && (
                                <button
                                    type="button"
                                    onClick={
                                        abrirNovaPlanta
                                    }
                                    className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    <Plus size={16} />
                                    Nova Planta
                                </button>
                            )
                        }
                    >
                        {loadingPlantas ? (
                            <LoadingState text="Carregando plantas..." />
                        ) : (
                            <PlantaTable
                                plantas={plantas}
                                plantaSelecionada={
                                    plantaSelecionada
                                }
                                onSelect={
                                    setPlantaSelecionada
                                }
                                onEdit={
                                    abrirEdicaoPlanta
                                }
                                onDelete={
                                    solicitarExclusaoPlanta
                                }
                                canManage={canManage}
                            />
                        )}
                    </ContentCard>

                    <ContentCard
                        title={
                            plantaSelecionada
                                ? `Linhas — ${plantaSelecionada.nome}`
                                : "Linhas"
                        }
                        headerActions={
                            canManage && (
                                <button
                                    type="button"
                                    onClick={
                                        abrirNovaLinha
                                    }
                                    disabled={
                                        !plantaSelecionada
                                    }
                                    className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Plus size={16} />
                                    Nova Linha
                                </button>
                            )
                        }
                    >
                        <LinhaTable
                            linhas={linhas}
                            plantaSelecionada={
                                plantaSelecionada
                            }
                            onEdit={
                                abrirEdicaoLinha
                            }
                            onDelete={
                                solicitarExclusaoLinha
                            }
                            canManage={canManage}
                            loading={loadingLinhas}
                        />
                    </ContentCard>
                </div>
            </main>

            {plantaModalOpen && (
                <PlantaFormModal
                    key={
                        plantaEmEdicao?.id ??
                        "nova-planta"
                    }
                    isOpen={plantaModalOpen}
                    initialData={plantaEmEdicao}
                    loading={submitLoading}
                    onSubmit={salvarPlanta}
                    onClose={() => {
                        setPlantaModalOpen(false);
                        setPlantaEmEdicao(null);
                    }}
                />
            )}

            {linhaModalOpen &&
                plantaSelecionada && (
                    <LinhaFormModal
                        key={
                            linhaEmEdicao?.id ??
                            "nova-linha"
                        }
                        isOpen={linhaModalOpen}
                        planta={
                            plantaSelecionada
                        }
                        initialData={
                            linhaEmEdicao
                        }
                        loading={submitLoading}
                        onSubmit={salvarLinha}
                        onClose={() => {
                            setLinhaModalOpen(
                                false
                            );
                            setLinhaEmEdicao(
                                null
                            );
                        }}
                    />
                )}

            <ConfirmDeleteModal
                isOpen={Boolean(itemParaExcluir)}
                onClose={() =>
                    setItemParaExcluir(null)
                }
                onConfirm={confirmarExclusao}
                loading={deleteLoading}
                title={
                    itemParaExcluir?.tipo ===
                    "PLANTA"
                        ? "Excluir Planta"
                        : "Excluir Linha"
                }
                description={
                    itemParaExcluir?.tipo ===
                    "PLANTA"
                        ? "Confirme a exclusão desta planta."
                        : "Confirme a exclusão desta linha."
                }
                warningMessage={
                    itemParaExcluir?.tipo ===
                    "PLANTA"
                        ? "Plantas que possuem linhas não podem ser excluídas."
                        : "Linhas que possuem equipamentos não podem ser excluídas."
                }
                itemLabel={
                    itemParaExcluir?.tipo ===
                    "PLANTA"
                        ? "Planta selecionada"
                        : "Linha selecionada"
                }
                itemName={
                    itemParaExcluir?.item?.nome
                }
                details={[
                    {
                        label: "Código",
                        value:
                        itemParaExcluir?.item
                            ?.codigo,
                    },
                    {
                        label: "Status",
                        value:
                        itemParaExcluir?.item
                            ?.status,
                    },
                ]}
                confirmText="Confirmar Exclusão"
            />
        </div>
    );
}

function LoadingState({ text }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            {text}
        </div>
    );
}

function mostrarErro(error, fallback) {
    console.error(fallback, error);
    console.error(
        "Resposta:",
        error.response?.data
    );

    toast.error(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        fallback
    );
}

export default PlantasLinhasPage;