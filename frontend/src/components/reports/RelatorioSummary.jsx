import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    CircleAlert,
    FileText,
    HardDrive,
    Printer,
} from "lucide-react";

import SummaryCard from "../common/SummaryCard.jsx";

function RelatorioSummary({ tipo, resultado }) {
    return <SummaryCard items={criarItensResumo(tipo, resultado)} />;
}

function criarItensResumo(tipo, resultado) {
    if (tipo === "GERAL") {
        return [
            item("Produções", resultado.producoes?.total, "criadas no período", BarChart3, "bg-blue-50 text-blue-600"),
            item("Itens planejados", resultado.producoes?.quantidadeTotalPlanejada, "nas produções", FileText, "bg-violet-50 text-violet-600"),
            item("Impressões", resultado.impressoes?.total, "registros no período", Printer, "bg-emerald-50 text-emerald-600"),
            item("Ocorrências", resultado.ocorrencias?.total, "eventos registrados", CircleAlert, "bg-amber-50 text-amber-600"),
        ];
    }

    if (tipo === "IMPRESSOES") {
        return [
            item("Total", resultado.total, "registros encontrados", Printer, "bg-blue-50 text-blue-600"),
            item("Pendentes", resultado.pendentes, "aguardando processamento", FileText, "bg-amber-50 text-amber-600"),
            item("Impressos", resultado.impressos, "concluídos", CheckCircle2, "bg-emerald-50 text-emerald-600"),
            item("Erros", resultado.erros, "falhas registradas", AlertTriangle, "bg-red-50 text-red-600"),
        ];
    }

    if (tipo === "OCORRENCIAS") {
        return [
            item("Total", resultado.total, "registros encontrados", FileText, "bg-blue-50 text-blue-600"),
            item("Abertas", resultado.abertas, "aguardando análise", CircleAlert, "bg-red-50 text-red-600"),
            item("Em atendimento", resultado.emAtendimento, "em tratamento", BarChart3, "bg-amber-50 text-amber-600"),
            item("Resolvidas", resultado.resolvidas, "ocorrências encerradas", CheckCircle2, "bg-emerald-50 text-emerald-600"),
        ];
    }

    return [
        item("Total", resultado.total, "equipamentos cadastrados", HardDrive, "bg-blue-50 text-blue-600"),
        item("Ativos", resultado.ativos, "disponíveis no sistema", CheckCircle2, "bg-emerald-50 text-emerald-600"),
        item("Em manutenção", resultado.emManutencao, "indisponíveis", AlertTriangle, "bg-amber-50 text-amber-600"),
        item("Sem conexão", resultado.semConexao, "sem comunicação", CircleAlert, "bg-red-50 text-red-600"),
    ];
}

function item(label, value, detail, icon, color) {
    return {
        label,
        value: value ?? 0,
        detail,
        icon,
        color,
    };
}

export default RelatorioSummary;
