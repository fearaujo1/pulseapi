import FormField from "../common/FormField";
import { inputClass } from "../common/formStyles";

function CampoImpressaoDinamico({
                                    campo,
                                    value,
                                    onChange,
                                }) {
    const inputTypes = {
        DATA: "date",
        HORA: "time",
        NUMERO: "number",
        TEXTO: "text",
    };

    const type = inputTypes[campo.tipoDado] || "text";

    return (
        <FormField
            label={campo.rotulo}
            required={campo.obrigatorio}
        >
            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(campo.chave, event.target.value)
                }
                maxLength={
                    campo.tipoDado === "TEXTO"
                        ? campo.comprimento || undefined
                        : undefined
                }
                placeholder={campo.valorPadrao || campo.chave}
                className={inputClass}
            />

            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-400">
                <span>Chave: {campo.chave}</span>

                {campo.formato && (
                    <span>• Formato: {campo.formato}</span>
                )}

                {campo.comprimento && (
                    <span>• Máx.: {campo.comprimento}</span>
                )}
            </div>
        </FormField>
    );
}

export default CampoImpressaoDinamico;