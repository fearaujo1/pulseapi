import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Topbar from "../components/layout/Topbar.jsx";
import { equipamentosService } from "../services/equipamentosService.js";
import { ocorrenciaService } from "../services/ocorrenciaService.js";
import PageHeader from "../components/common/PageHeader.jsx";
import EventoHelpPopover from "../components/events/EventoHelpPopover.jsx";
import RegistrarOcorrenciaForm from "../components/events/RegistrarOcorrenciaForm.jsx";

const initialForm = { titulo: "", descricao: "", tipo: "FALHA_EQUIPAMENTO", equipamentoId: "" };

function RegistrarOcorrenciaPage() {
    const [formData, setFormData] = useState(initialForm);
    const [equipamentos, setEquipamentos] = useState([]);
    const [loadingEquipamentos, setLoadingEquipamentos] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        async function carregar() {
            try {
                setLoadingEquipamentos(true);
                const data = await equipamentosService.listar();
                setEquipamentos(Array.isArray(data) ? data : []);
            } catch (error) {
                mostrarErro(error, "Não foi possível carregar os equipamentos.");
                setEquipamentos([]);
            } finally { setLoadingEquipamentos(false); }
        }
        carregar();
    }, []);

    function handleChange(event) { const { name, value } = event.target; setFormData((anterior) => ({ ...anterior, [name]: value })); }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!formData.equipamentoId) return toast.error("Selecione um equipamento.");
        try {
            setSubmitLoading(true);
            await ocorrenciaService.criar({ ...formData, equipamentoId: Number(formData.equipamentoId) });
            toast.success("Ocorrência registrada com sucesso!");
            setFormData(initialForm);
        } catch (error) { mostrarErro(error, "Não foi possível registrar a ocorrência."); }
        finally { setSubmitLoading(false); }
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />
            <main className="mx-auto w-full max-w-[1800px] px-4 py-5 md:px-6 lg:px-8">
                <PageHeader title="Registrar ocorrência" description="Registre rapidamente uma falha ou parada operacional"><EventoHelpPopover isOpen={showHelp} onToggle={() => setShowHelp((anterior) => !anterior)} /></PageHeader>
                <section className="flex justify-center"><RegistrarOcorrenciaForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} equipamentos={equipamentos} loadingEquipamentos={loadingEquipamentos} submitLoading={submitLoading} /></section>
            </main>
        </div>
    );
}

function mostrarErro(error, fallback) { console.error(fallback, error); toast.error(error.response?.data?.detail || error.response?.data?.message || fallback); }
export default RegistrarOcorrenciaPage;
