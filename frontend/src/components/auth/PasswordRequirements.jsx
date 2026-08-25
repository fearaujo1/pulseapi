import { CheckCircle2 } from "lucide-react";

function PasswordRequirements() {
    return (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
                <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                    <p className="font-semibold text-blue-700">
                        Critérios da senha
                    </p>

                    <p className="mt-1 text-blue-700/90">
                        Mínimo de 8 caracteres, letra maiúscula, letra
                        minúscula, número e caractere especial.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PasswordRequirements;