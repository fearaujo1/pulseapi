import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Topbar from "../components/layout/Topbar";
import { equipamentosService } from "../services/equipamentosService";
import { ocorrenciaService } from "../services/ocorrenciaService.js";
import PageHeader from "../components/common/PageHeader";
import EventoHelpPopover from "../components/events/EventoHelpPopover";
import RegistrarOcorrenciaForm from "../components/events/RegistrarOcorrenciaForm";

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

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]:
                name === "equipamentoId" && value
                    ? Number(value)
                    : value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

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

            toast.success("Ocorrência registrada com sucesso!");
            setFormData(initialForm);
        } catch (error) {
            console.error("Erro ao registrar ocorrência:", error);
            console.error("Resposta:", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao registrar ocorrência."
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <PageHeader
                    title="Registrar Ocorrência"
                    description="Registre rapidamente uma ocorrência ou parada de produção"
                >
                    <EventoHelpPopover
                        isOpen={showHelp}
                        onToggle={() =>
                            setShowHelp((previous) => !previous)
                        }
                    />
                </PageHeader>

                <section className="flex justify-center">
                    <RegistrarOcorrenciaForm
                        formData={formData}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        equipamentos={equipamentos}
                        loadingEquipamentos={loadingEquipamentos}
                        submitLoading={submitLoading}
                    />
                </section>
            </main>
        </div>
    );
}

export default RegistrarOcorrenciaPage;