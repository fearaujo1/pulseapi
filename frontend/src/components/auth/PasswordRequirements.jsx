import { CheckCircle2 } from "lucide-react";

function PasswordRequirements() {
    return (
        <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-3">
            <div className="flex items-start gap-2.5">
                <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                    <p className="text-[12px] font-semibold text-blue-800">
                        Critérios da senha
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-blue-700/80">
                        Use ao menos 8 caracteres, incluindo letra maiúscula,
                        letra minúscula, número e caractere especial.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PasswordRequirements;
