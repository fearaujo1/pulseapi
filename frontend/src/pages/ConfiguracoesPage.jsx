import { useEffect, useState } from "react";
import { Bell, Building2 } from "lucide-react";
import toast from "react-hot-toast";

import Topbar from "../components/layout/Topbar.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal.jsx";
import ConfiguracaoMenu from "../components/configurations/ConfiguracaoMenu.jsx";
import GeralTab from "../components/configurations/GeralTab.jsx";
import TurnoModal from "../components/configurations/TurnoModal.jsx";
import NotificacoesTab from "../components/configurations/NotificacoesTab.jsx";
import { configuracaoService } from "../services/configuracaoService.js";

const tabs = [
    { id: "geral", label: "Geral", icon: Building2 },
    { id: "notificacoes", label: "Notificações", icon: Bell },
];

function ConfiguracoesPage() {
    const [activeTab, setActiveTab] = useState("geral");
    const [loading, setLoading] = useState(true);
    const [savingEmpresa, setSavingEmpresa] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    const [empresa, setEmpresa] = useState(null);
    const [configGeral, setConfigGeral] = useState({ controleAcessoTurnoAtivo: false, toleranciaTurnoMinutos: 60 });
    const [turnos, setTurnos] = useState([]);
    const [turnoModalOpen, setTurnoModalOpen] = useState(false);
    const [turnoEditando, setTurnoEditando] = useState(null);
    const [turnoToDelete, setTurnoToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [configuracoesNotificacao, setConfiguracoesNotificacao] = useState([]);
    const [savingNotificacoes, setSavingNotificacoes] = useState(false);

    useEffect(() => { carregarDados(); }, []);

    async function carregarDados() {
        try {
            setLoading(true);
            const [empresaData, configData, turnosData, notificacoesData] = await Promise.all([
                configuracaoService.buscarEmpresa(),
                configuracaoService.buscarConfiguracaoGeral(),
                configuracaoService.listarTurnos(),
                configuracaoService.listarConfiguracoesNotificacao(),
            ]);
            setEmpresa(empresaData);
            setConfigGeral({
                controleAcessoTurnoAtivo: configData.controleAcessoTurnoAtivo,
                toleranciaTurnoMinutos: configData.toleranciaTurnoMinutos,
            });
            setTurnos(Array.isArray(turnosData) ? turnosData : []);
            setConfiguracoesNotificacao(Array.isArray(notificacoesData) ? notificacoesData : []);
        } catch (error) {
            mostrarErro(error, "Não foi possível carregar as configurações.");
        } finally {
            setLoading(false);
        }
    }

    function atualizarCampoEmpresa(campo, valor) {
        setEmpresa((previous) => ({ ...previous, [campo]: valor }));
    }

    async function salvarEmpresa() {
        if (!empresa?.id) return;
        try {
            setSavingEmpresa(true);
            const atualizado = await configuracaoService.atualizarEmpresa(empresa.id, {
                razaoSocial: empresa.razaoSocial,
                nomeFantasia: empresa.nomeFantasia,
                cnpj: empresa.cnpj,
                email: empresa.email,
                telefone: empresa.telefone,
            });
            setEmpresa(atualizado);
            toast.success("Dados da empresa atualizados.");
        } catch (error) {
            mostrarErro(error, "Não foi possível atualizar a empresa.");
        } finally {
            setSavingEmpresa(false);
        }
    }

    async function salvarConfiguracaoGeral() {
        try {
            setSavingConfig(true);
            const atualizado = await configuracaoService.atualizarConfiguracaoGeral({
                controleAcessoTurnoAtivo: configGeral.controleAcessoTurnoAtivo,
                toleranciaTurnoMinutos: Number(configGeral.toleranciaTurnoMinutos),
            });
            setConfigGeral(atualizado);
            toast.success("Controle de acesso atualizado.");
        } catch (error) {
            mostrarErro(error, "Não foi possível salvar a configuração.");
        } finally {
            setSavingConfig(false);
        }
    }

    function abrirNovoTurno() { setTurnoEditando(null); setTurnoModalOpen(true); }
    function abrirEdicaoTurno(turno) { setTurnoEditando(turno); setTurnoModalOpen(true); }
    function fecharTurnoModal() { setTurnoModalOpen(false); setTurnoEditando(null); }

    async function salvarTurno(payload) {
        try {
            if (turnoEditando) {
                const atualizado = await configuracaoService.atualizarTurno(turnoEditando.id, payload);
                setTurnos((previous) => previous.map((turno) => turno.id === atualizado.id ? atualizado : turno));
                toast.success("Turno atualizado.");
            } else {
                const novo = await configuracaoService.criarTurno(payload);
                setTurnos((previous) => [...previous, novo]);
                toast.success("Turno criado.");
            }
            fecharTurnoModal();
        } catch (error) {
            mostrarErro(error, "Não foi possível salvar o turno.");
            throw error;
        }
    }

    async function confirmarExclusaoTurno() {
        if (!turnoToDelete?.id) return;
        try {
            setDeleteLoading(true);
            await configuracaoService.excluirTurno(turnoToDelete.id);
            setTurnos((previous) => previous.filter((turno) => turno.id !== turnoToDelete.id));
            setTurnoToDelete(null);
            toast.success("Turno excluído.");
        } catch (error) {
            mostrarErro(error, "Não foi possível excluir o turno.");
        } finally {
            setDeleteLoading(false);
        }
    }

    function alterarConfiguracaoNotificacao(tipo, campo, valor) {
        setConfiguracoesNotificacao((previous) => previous.map((item) => item.tipo === tipo ? { ...item, [campo]: valor } : item));
    }

    async function salvarConfiguracoesNotificacao() {
        try {
            setSavingNotificacoes(true);

            const atualizadas = await Promise.all(
                configuracoesNotificacao.map((configuracao) =>
                    configuracaoService.atualizarConfiguracaoNotificacao(
                        configuracao.tipo,
                        {
                            notificacaoSistemaAtiva: Boolean(
                                configuracao.notificacaoSistemaAtiva
                            ),
                            notificacaoEmailAtiva: Boolean(
                                configuracao.notificacaoEmailAtiva
                            ),
                        }
                    )
                )
            );

            setConfiguracoesNotificacao(atualizadas);
            toast.success("Configurações de notificação atualizadas.");
        } catch (error) {
            mostrarErro(error, "Não foi possível salvar as configurações.");
            await carregarDados();
        } finally {
            setSavingNotificacoes(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />
            <main className="mx-auto w-full max-w-[1800px] px-4 py-5 md:px-6 lg:px-8">
                <PageHeader title="Configurações" description="Gerencie os dados da empresa, acesso por turnos e notificações" />

                {loading ? (
                    <ConfiguracoesSkeleton />
                ) : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
                        <ConfiguracaoMenu tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                        <section className="min-w-0">
                            {activeTab === "geral" && (
                                <GeralTab
                                    empresa={empresa}
                                    atualizarCampoEmpresa={atualizarCampoEmpresa}
                                    salvarEmpresa={salvarEmpresa}
                                    savingEmpresa={savingEmpresa}
                                    configGeral={configGeral}
                                    setConfigGeral={setConfigGeral}
                                    salvarConfiguracaoGeral={salvarConfiguracaoGeral}
                                    savingConfig={savingConfig}
                                    turnos={turnos}
                                    novoTurno={abrirNovoTurno}
                                    editarTurno={abrirEdicaoTurno}
                                    excluirTurno={setTurnoToDelete}
                                />
                            )}
                            {activeTab === "notificacoes" && (
                                <NotificacoesTab
                                    configuracoes={configuracoesNotificacao}
                                    saving={savingNotificacoes}
                                    onChange={alterarConfiguracaoNotificacao}
                                    onSave={salvarConfiguracoesNotificacao}
                                />
                            )}
                        </section>
                    </div>
                )}
            </main>

            <ConfirmDeleteModal
                isOpen={Boolean(turnoToDelete)}
                onClose={() => !deleteLoading && setTurnoToDelete(null)}
                onConfirm={confirmarExclusaoTurno}
                loading={deleteLoading}
                title="Excluir turno"
                description="Confirme a exclusão deste turno."
                warningMessage="O turno será removido permanentemente do sistema."
                itemLabel="Turno selecionado"
                itemName={turnoToDelete?.nome}
                details={[{ label: "Início", value: turnoToDelete?.horaInicio }, { label: "Fim", value: turnoToDelete?.horaFim }]}
                confirmText="Excluir turno"
            />

            {turnoModalOpen && <TurnoModal key={turnoEditando?.id ?? "novo"} turno={turnoEditando} onClose={fecharTurnoModal} onSave={salvarTurno} />}
        </div>
    );
}

function ConfiguracoesSkeleton() {
    return <div className="grid animate-pulse grid-cols-1 gap-5 xl:grid-cols-[210px_minmax(0,1fr)]"><div className="h-28 rounded-2xl bg-slate-200" /><div className="space-y-5"><div className="h-72 rounded-2xl bg-slate-200" /><div className="h-48 rounded-2xl bg-slate-200" /></div></div>;
}

function mostrarErro(error, fallback) {
    console.error(fallback, error);
    toast.error(error.response?.data?.detail || error.response?.data?.message || fallback);
}

export default ConfiguracoesPage;
