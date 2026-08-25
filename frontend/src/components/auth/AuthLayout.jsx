import { Factory } from "lucide-react";

function AuthLayout({
                        title,
                        description,
                        children,
                        maxWidthClass = "max-w-xl",
                    }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
            <div className="mb-10 flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 shadow-sm">
                    <Factory
                        size={42}
                        className="text-white"
                    />
                </div>

                <h1 className="text-3xl font-bold text-slate-950">
                    {title}
                </h1>

                {description && (
                    <p className="mt-3 text-slate-600">
                        {description}
                    </p>
                )}
            </div>

            <div
                className={`w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl ${maxWidthClass}`}
            >
                {children}
            </div>

            <p className="mt-8 max-w-xl text-center text-slate-600">
                © 2026 PulseAPI - Smart Production Manager. Todos os direitos
                reservados.
            </p>
        </div>
    );
}

export default AuthLayout;