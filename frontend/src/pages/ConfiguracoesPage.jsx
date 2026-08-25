import { useEffect, useState } from "react";
import {
    Building2,
    Bell,
    Cable,
    DatabaseBackup,
    Palette,
    ScrollText,
} from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "../components/layout/Topbar";
import { configuracaoService } from "../services/configuracaoService";
import PageHeader from "../components/common/PageHeader";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import ConfiguracaoMenu from "../components/configurations/ConfiguracaoMenu";
import GeralTab from "../components/configurations/GeralTab";
import TurnoModal from "../components/configurations/TurnoModal";
import EmBreveTab from "../components/configurations/EmBreveTab";

const tabs = [
    {
        id: "geral",
        label: "Geral",
        icon: Building2,
    },
    {
        id: "notificacoes",
        label: "Notificações",
        icon: Bell,
    },
    {
        id: "integracoes",
        label: "Integrações",
        icon: Cable,
    },
    {
        id: "backup",
        label: "Backup",
        icon: DatabaseBackup,
    },
    {
        id: "aparencia",
        label: "Aparência",
        icon: Palette,
    },
    {
        id: "logs",
        label: "Logs",
        icon: ScrollText,
    },
];

function ConfiguracoesPage() {
    const [activeTab, setActiveTab] = useState("geral");
    const [loading, setLoading] = useState(true);
    const [savingEmpresa, setSavingEmpresa] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    const [empresa, setEmpresa] = useState(null);

    const [turnoToDelete, setTurnoToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [configGeral, setConfigGeral] =
        useState({
            controleAcessoTurnoAtivo: false,
            toleranciaTurnoMinutos: 60,
        });

    const [turnos, setTurnos] =
        useState([]);

    const [turnoModalOpen, setTurnoModalOpen] =
        useState(false);

    const [turnoEditando, setTurnoEditando] =
        useState(null);

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        try {
            setLoading(true);

            const [
                empresaData,
                configData,
                turnosData,
            ] = await Promise.all([
                configuracaoService.buscarEmpresa(),
                configuracaoService.buscarConfiguracaoGeral(),
                configuracaoService.listarTurnos(),
            ]);

            setEmpresa(empresaData);

            setConfigGeral({
                controleAcessoTurnoAtivo:
                configData.controleAcessoTurnoAtivo,

                toleranciaTurnoMinutos:
                configData.toleranciaTurnoMinutos,
            });

            setTurnos(
                Array.isArray(turnosData)
                    ? turnosData
                    : []
            );

        } catch (error) {
            console.error(
                "Erro ao carregar configurações:",
                error
            );

            toast.error(
                "Não foi possível carregar as configurações."
            );

        } finally {
            setLoading(false);
        }
    }


    // =====================================================
    // EMPRESA
    // =====================================================

    function atualizarCampoEmpresa(
        campo,
        valor
    ) {
        setEmpresa((prev) => ({
            ...prev,
            [campo]: valor,
        }));
    }

    async function salvarEmpresa() {
        try {
            setSavingEmpresa(true);

            const atualizado =
                await configuracaoService
                    .atualizarEmpresa(
                        empresa.id,
                        {
                            razaoSocial:
                            empresa.razaoSocial,

                            nomeFantasia:
                            empresa.nomeFantasia,

                            cnpj:
                            empresa.cnpj,

                            email:
                            empresa.email,

                            telefone:
                            empresa.telefone,
                        }
                    );

            setEmpresa(atualizado);

            toast.success(
                "Dados da empresa atualizados."
            );

        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                "Não foi possível atualizar a empresa."
            );

        } finally {
            setSavingEmpresa(false);
        }
    }


    // =====================================================
    // CONFIGURAÇÃO DE TURNO
    // =====================================================

    async function salvarConfiguracaoGeral() {
        try {
            setSavingConfig(true);

            const atualizado =
                await configuracaoService
                    .atualizarConfiguracaoGeral({
                        controleAcessoTurnoAtivo:
                        configGeral.controleAcessoTurnoAtivo,

                        toleranciaTurnoMinutos:
                            Number(
                                configGeral.toleranciaTurnoMinutos
                            ),
                    });

            setConfigGeral({
                controleAcessoTurnoAtivo:
                atualizado.controleAcessoTurnoAtivo,

                toleranciaTurnoMinutos:
                atualizado.toleranciaTurnoMinutos,
            });

            toast.success(
                "Controle de acesso atualizado."
            );

        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                "Não foi possível salvar a configuração."
            );

        } finally {
            setSavingConfig(false);
        }
    }


    // =====================================================
    // TURNOS
    // =====================================================

    function novoTurno() {
        setTurnoEditando(null);
        setTurnoModalOpen(true);
    }

    function editarTurno(turno) {
        setTurnoEditando(turno);
        setTurnoModalOpen(true);
    }

    function excluirTurno(turno) {
        setTurnoToDelete(turno);
    }

    async function confirmarExclusaoTurno() {
        if (!turnoToDelete?.id) return;

        try {
            setDeleteLoading(true);

            await configuracaoService.excluirTurno(
                turnoToDelete.id
            );

            setTurnos((previous) =>
                previous.filter(
                    (turno) => turno.id !== turnoToDelete.id
                )
            );

            setTurnoToDelete(null);

            toast.success("Turno excluído.");
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                "Não foi possível excluir o turno."
            );
        } finally {
            setDeleteLoading(false);
        }
    }

    async function salvarTurno(payload) {
        try {
            if (turnoEditando) {
                const atualizado =
                    await configuracaoService
                        .atualizarTurno(
                            turnoEditando.id,
                            payload
                        );

                setTurnos((prev) =>
                    prev.map((turno) =>
                        turno.id === atualizado.id
                            ? atualizado
                            : turno
                    )
                );

                toast.success(
                    "Turno atualizado."
                );

            } else {
                const novo =
                    await configuracaoService
                        .criarTurno(payload);

                setTurnos((prev) => [
                    ...prev,
                    novo,
                ]);

                toast.success(
                    "Turno criado."
                );
            }

            setTurnoModalOpen(false);
            setTurnoEditando(null);

        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                "Não foi possível salvar o turno."
            );
        }
    }


    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <Topbar />

                <main className="p-4 md:p-6">
                    <p className="text-slate-500">
                        Carregando configurações...
                    </p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">

            <Topbar />

            <main className="p-4 md:p-6">

                {/* CABEÇALHO */}

                <PageHeader
                    title="Configurações"
                    description="Gerencie as configurações gerais do Smart Production Manager"
                />


                {/* CONTAINER */}

                <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr] gap-6">

                    {/* MENU LATERAL */}

                    <ConfiguracaoMenu
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />


                    {/* CONTEÚDO */}

                    <section>

                        {activeTab === "geral" && (
                            <GeralTab
                                empresa={empresa}
                                atualizarCampoEmpresa={
                                    atualizarCampoEmpresa
                                }
                                salvarEmpresa={
                                    salvarEmpresa
                                }
                                savingEmpresa={
                                    savingEmpresa
                                }

                                configGeral={
                                    configGeral
                                }
                                setConfigGeral={
                                    setConfigGeral
                                }
                                salvarConfiguracaoGeral={
                                    salvarConfiguracaoGeral
                                }
                                savingConfig={
                                    savingConfig
                                }

                                turnos={turnos}
                                novoTurno={novoTurno}
                                editarTurno={
                                    editarTurno
                                }
                                excluirTurno={
                                    excluirTurno
                                }
                            />
                        )}

                        {activeTab !== "geral" && (
                            <EmBreveTab
                                tab={tabs.find(
                                    (tab) =>
                                        tab.id ===
                                        activeTab
                                )}
                            />
                        )}

                    </section>

                </div>

                <ConfirmDeleteModal
                    isOpen={Boolean(turnoToDelete)}
                    onClose={() => setTurnoToDelete(null)}
                    onConfirm={confirmarExclusaoTurno}
                    loading={deleteLoading}
                    title="Excluir Turno"
                    description="Confirme a exclusão deste turno."
                    warningMessage="O turno será removido permanentemente do sistema."
                    itemLabel="Turno selecionado"
                    itemName={turnoToDelete?.nome}
                    details={[
                        {
                            label: "Início",
                            value: turnoToDelete?.horaInicio,
                        },
                        {
                            label: "Fim",
                            value: turnoToDelete?.horaFim,
                        },
                    ]}
                    confirmText="Excluir Turno"
                />
            </main>

            {turnoModalOpen && (
                <TurnoModal
                    turno={turnoEditando}
                    onClose={() => {
                        setTurnoModalOpen(false);
                        setTurnoEditando(null);
                    }}
                    onSave={salvarTurno}
                />
            )}
        </div>
    );
}

export default ConfiguracoesPage;