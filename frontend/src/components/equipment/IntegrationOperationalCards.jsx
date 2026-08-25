import {
    Database,
    Hash,
    Layers3,
    Wifi,
} from "lucide-react";

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

function InfoCard({
    title,
    value,
    detail,
    icon,
}) {
    return (
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-950">
                        {value}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        {detail}
                    </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function IntegrationOperationalCards({
    status,
    layoutOnline,
    fifo,
    contador,
}) {
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

    return (
        <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
                title="Status"
                value={
                    status
                        ? `Código ${status.codigoStatus}`
                        : "Indisponível"
                }
                detail={
                    status
                        ? `Jato ${status.jato} • ${status.horarioAlteracao}`
                        : "Sem resposta"
                }
                icon={<Wifi size={24} />}
            />

            <InfoCard
                title="Layout Online"
                value={nomeLayout}
                detail="Layout ativo na codificadora"
                icon={<Layers3 size={24} />}
            />
            <InfoCard
                title="FIFO"
                value={
                    quantidadeFifo !== null
                        ? `${quantidadeFifo} item(ns)`
                        : "Indisponível"
                }
                detail="Itens aguardando consumo"
                icon={<Database size={24} />}
            />
            <InfoCard
                title="Contador"
                value={formatarNumero(contadorAtual)}
                detail="Contador de produtos"
                icon={<Hash size={24} />}
            />
        </section>
    );
}

export default IntegrationOperationalCards;