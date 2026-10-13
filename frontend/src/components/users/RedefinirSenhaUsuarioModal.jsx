import {
    useEffect,
    useState,
} from "react";

import {
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    X,
} from "lucide-react";

import toast from "react-hot-toast";

import PasswordRequirements
    from "../auth/PasswordRequirements.jsx";

function RedefinirSenhaUsuarioModal({
                                        isOpen,
                                        usuario,
                                        loading = false,
                                        onClose,
                                        onSubmit,
                                    }) {
    const [novaSenha, setNovaSenha] =
        useState("");

    const [confirmarSenha, setConfirmarSenha] =
        useState("");

    const [
        mostrarNovaSenha,
        setMostrarNovaSenha,
    ] = useState(false);

    const [
        mostrarConfirmacao,
        setMostrarConfirmacao,
    ] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        function fecharComEscape(event) {
            if (
                event.key === "Escape" &&
                !loading
            ) {
                onClose();
            }
        }

        window.addEventListener(
            "keydown",
            fecharComEscape
        );

        return () => {
            window.removeEventListener(
                "keydown",
                fecharComEscape
            );
        };
    }, [isOpen, loading, onClose]);

    if (!isOpen) {
        return null;
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

    function limparFormulario() {
        setNovaSenha("");
        setConfirmarSenha("");
        setMostrarNovaSenha(false);
        setMostrarConfirmacao(false);
    }

    function fecharModal() {
        if (loading) {
            return;
        }

        limparFormulario();
        onClose();
    }

    function handleBackdropClick(event) {
        if (event.target === event.currentTarget) {
            fecharModal();
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!novaSenha || !confirmarSenha) {
            toast.error(
                "Preencha a nova senha e a confirmação."
            );

            return;
        }

        if (!senhaForte(novaSenha)) {
            toast.error(
                "A senha não atende aos critérios de segurança."
            );

            return;
        }

        if (novaSenha !== confirmarSenha) {
            toast.error(
                "A senha e a confirmação não conferem."
            );

            return;
        }

        onSubmit({
            novaSenha,
            confirmarSenha,
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
            onMouseDown={handleBackdropClick}
            role="presentation"
        >
            <div
                className="w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-redefinir-senha"
            >
                <header className="flex items-start justify-between border-b border-slate-100 px-7 py-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <KeyRound size={21} />
                        </div>

                        <div>
                            <h2
                                id="titulo-redefinir-senha"
                                className="text-lg font-bold text-slate-900"
                            >
                                Redefinir senha
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Defina uma nova senha para{" "}
                                <span className="font-semibold text-slate-700">
                                    {usuario?.nome ||
                                        "o usuário"}
                                </span>
                                .
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={fecharModal}
                        disabled={loading}
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Fechar"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 px-7 py-6"
                >
                    <PasswordField
                        id="nova-senha"
                        label="Nova senha"
                        value={novaSenha}
                        onChange={setNovaSenha}
                        visible={mostrarNovaSenha}
                        onToggleVisibility={() =>
                            setMostrarNovaSenha(
                                (valorAtual) =>
                                    !valorAtual
                            )
                        }
                        disabled={loading}
                        autoComplete="new-password"
                    />

                    <PasswordField
                        id="confirmar-nova-senha"
                        label="Confirmar nova senha"
                        value={confirmarSenha}
                        onChange={setConfirmarSenha}
                        visible={mostrarConfirmacao}
                        onToggleVisibility={() =>
                            setMostrarConfirmacao(
                                (valorAtual) =>
                                    !valorAtual
                            )
                        }
                        disabled={loading}
                        autoComplete="new-password"
                    />

                    <PasswordRequirements />

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                        <button
                            type="button"
                            onClick={fecharModal}
                            disabled={loading}
                            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && (
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />
                            )}

                            {loading
                                ? "Redefinindo..."
                                : "Redefinir senha"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PasswordField({
                           id,
                           label,
                           value,
                           onChange,
                           visible,
                           onToggleVisibility,
                           disabled,
                           autoComplete,
                       }) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-sm font-semibold text-slate-800"
            >
                {label} *
            </label>

            <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white">
                <KeyRound
                    size={17}
                    className="shrink-0 text-slate-400"
                />

                <input
                    id={id}
                    type={
                        visible
                            ? "text"
                            : "password"
                    }
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    disabled={disabled}
                    autoComplete={autoComplete}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    required
                />

                <button
                    type="button"
                    onClick={onToggleVisibility}
                    disabled={disabled}
                    className="text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                        visible
                            ? `Ocultar ${label.toLowerCase()}`
                            : `Mostrar ${label.toLowerCase()}`
                    }
                    title={
                        visible
                            ? "Ocultar senha"
                            : "Mostrar senha"
                    }
                >
                    {visible ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}
                </button>
            </div>
        </div>
    );
}

export default RedefinirSenhaUsuarioModal;