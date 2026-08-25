import { CheckCircle2, CircleAlert, Cpu } from "lucide-react";

function EquipmentIntegrationCard({
    equipamento,
    conectado = false,
}) {
    return (
        <section className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-com gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
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
                            <span>{equipamento?.codigo || "-"}</span>

                            <span>•</span>

                            <span>
                                {equipamento?.ip || "-"}
                                {equipamento?.porta || "-"}
                            </span>

                            {equipamento?.protocolo && (
                                <>
                                    <span>•</span>
                                    <span>{equipamento.protocolo}</span>
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
                    {conectado
                        ? "Comunicação disponível"
                        : "Sem comunicação"
                    }
                </div>
            </div>
        </section>
    );
}

export default EquipmentIntegrationCard;