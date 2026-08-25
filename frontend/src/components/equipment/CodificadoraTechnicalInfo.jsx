import { Server } from "lucide-react";

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

function CodificadoraTechnicalInfo({
                                       identidade,
                                       configuracao,
                                   }) {
    const fields = [
        {
            label: "Tipo",
            value: identidade?.tipoDescricao,
        },
        {
            label: "Código do Tipo",
            value: identidade?.tipoCodigo,
        },
        {
            label: "Software",
            value: identidade?.softwarePartNumber,
        },
        {
            label: "Software Issue",
            value: identidade?.softwareIssue,
        },
        {
            label: "Codenet ID",
            value: identidade?.codenetId,
        },
        {
            label: "Quantidade de Jatos",
            value: configuracao?.quantidadeJatos,
        },
        {
            label: "Máximo de Layouts",
            value: configuracao?.maximoLayouts,
        },
        {
            label: "Baud Rate",
            value: configuracao?.baudRateSerial,
        },
        {
            label: "Controle de Fluxo",
            value: configuracao?.controleFluxoSerial,
        },
        {
            label: "Formato Código de Barras",
            value: configuracao?.formatoCodigoBarras,
        },
        {
            label: "Tamanho Máximo Layout",
            value: configuracao?.tamanhoMaximoLayout,
        },
    ];

    return (
        <section className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
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

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
                {fields.map((field) => (
                    <TechnicalField
                        key={field.label}
                        label={field.label}
                        value={field.value}
                    />
                ))}
            </div>
        </section>
    );
}

export default CodificadoraTechnicalInfo;