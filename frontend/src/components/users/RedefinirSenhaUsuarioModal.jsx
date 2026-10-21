import { useEffect, useState } from "react";
import {
    Eye,
    EyeOff,
    KeyRound,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    Button,
    IconButton,
} from "../common/Button.jsx";

import PasswordRequirements from "../auth/PasswordRequirements.jsx";

function RedefinirSenhaUsuarioModal({
                                        isOpen,
                                        usuario,
                                        loading = false,
                                        onClose,
                                        onSubmit,
                                    }) {
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setNovaSenha("");
        setConfirmarSenha("");
        setMostrarNovaSenha(false);
        setMostrarConfirmacao(false);
    }, [isOpen, usuario?.id]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        function fecharComEscape(event) {
            if (event.key === "Escape" && !loading) {
                onClose();
            }
        }

        document.addEventListener("keydown", fecharComEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", fecharComEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, loading, onClose]);

    if (!isOpen) {
        return null;
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!novaSenha || !confirmarSenha) {
            toast.error("Preencha a nova senha e a confirmação.");
            return;
        }

        if (!senhaForte(novaSenha)) {
            toast.error("A senha não atende aos critérios de segurança.");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            toast.error("A senha e a confirmação não conferem.");
            return;
        }

        onSubmit({ novaSenha, confirmarSenha });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
                <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <KeyRound size={19} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Redefinir senha
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Nova senha para <strong className="text-slate-700">{usuario?.nome || "o usuário"}</strong>.
                            </p>
                        </div>
                    </div>

                    <IconButton
                        icon={X}
                        onClick={onClose}
                        disabled={loading}
                        title="Fechar modal"
                    />
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 px-6 py-5">
                        <PasswordField
                            label="Nova senha"
                            value={novaSenha}
                            onChange={setNovaSenha}
                            visible={mostrarNovaSenha}
                            onToggle={() => setMostrarNovaSenha((valor) => !valor)}
                            disabled={loading}
                        />

                        <PasswordField
                            label="Confirmar nova senha"
                            value={confirmarSenha}
                            onChange={setConfirmarSenha}
                            visible={mostrarConfirmacao}
                            onToggle={() => setMostrarConfirmacao((valor) => !valor)}
                            disabled={loading}
                        />

                        <PasswordRequirements />

                        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                            <Button
                                variant="secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                loading={loading}
                                loadingText="Redefinindo..."
                                className="min-w-36"
                            >
                                Redefinir senha
                            </Button>
                        </footer>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PasswordField({ label, value, onChange, visible, onToggle, disabled }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label} <span className="text-red-500">*</span>
            </span>
            <div className="flex h-10 items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10">
                <KeyRound size={15} className="shrink-0 text-slate-400" />
                <input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    disabled={disabled}
                    autoComplete="new-password"
                    className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none"
                    required
                />
                <button
                    type="button"
                    onClick={onToggle}
                    disabled={disabled}
                    className="text-slate-400 transition hover:text-slate-700"
                    aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </label>
    );
}

function senhaForte(senha) {
    return (
        senha.length >= 8 &&
        /[A-Z]/.test(senha) &&
        /[a-z]/.test(senha) &&
        /\d/.test(senha) &&
        /[^A-Za-z0-9]/.test(senha)
    );
}

export default RedefinirSenhaUsuarioModal;
