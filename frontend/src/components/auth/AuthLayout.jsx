import {
    Activity,
    DatabaseZap,
    LockKeyhole,
    RadioTower,
} from "lucide-react";

const LOGO_PULSEAPI = "/branding/png/pulseapi-horizontal-white.png";

const capabilities = [
    {
        icon: Activity,
        title: "Produção em tempo real",
        description: "Acompanhe ordens, filas e equipamentos em uma única visão.",
    },
    {
        icon: RadioTower,
        title: "Integração industrial",
        description: "Comunicação contínua com os equipamentos da linha.",
    },
    {
        icon: DatabaseZap,
        title: "Dados rastreáveis",
        description: "Histórico operacional centralizado para análise e decisão.",
    },
];

function AuthLayout({
                        eyebrow,
                        title,
                        description,
                        children,
                        maxWidthClass = "max-w-[420px]",
                    }) {
    return (
        <main className="min-h-screen bg-[#f4f6f8] lg:grid lg:grid-cols-[minmax(400px,44%)_1fr]">
            <section className="relative hidden min-h-screen overflow-hidden bg-[#0b1220] lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10 xl:px-16 xl:py-12">
                <div
                    aria-hidden="true"
                    className="absolute -left-40 bottom-[-17rem] h-[36rem] w-[36rem] rounded-full border border-blue-500/10"
                />
                <div
                    aria-hidden="true"
                    className="absolute -left-24 bottom-[-12rem] h-[28rem] w-[28rem] rounded-full border border-cyan-400/10"
                />
                <div
                    aria-hidden="true"
                    className="absolute right-[-10rem] top-[-12rem] h-[30rem] w-[30rem] rounded-full bg-blue-600/[0.08] blur-3xl"
                />

                <div className="relative z-10">
                    <img
                        src={LOGO_PULSEAPI}
                        alt="PulseAPI — Smart Production Manager"
                        className="h-auto w-[250px] object-contain object-left"
                    />
                </div>

                <div className="relative z-10 max-w-xl py-12">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                        Gestão industrial conectada
                    </p>

                    <h1 className="mt-4 max-w-lg text-[38px] font-semibold leading-[1.12] tracking-[-0.035em] text-white xl:text-[44px]">
                        Controle a produção com clareza e precisão.
                    </h1>

                    <p className="mt-5 max-w-lg text-[15px] leading-7 text-slate-400">
                        Operações, equipamentos e dados reunidos em um ambiente
                        seguro para apoiar as decisões da sua equipe.
                    </p>

                    <div className="mt-10 grid max-w-lg gap-5">
                        {capabilities.map((capability) => {
                            const Icon = capability.icon;

                            return (
                                <div
                                    key={capability.title}
                                    className="flex items-start gap-4"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-blue-400">
                                        <Icon size={17} />
                                    </div>

                                    <div>
                                        <h2 className="text-[13px] font-semibold text-slate-100">
                                            {capability.title}
                                        </h2>
                                        <p className="mt-1 text-[12px] leading-5 text-slate-500">
                                            {capability.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <p className="relative z-10 text-[11px] text-slate-600">
                    © 2026 PulseAPI. Todos os direitos reservados.
                </p>
            </section>

            <section className="flex min-h-screen flex-col bg-white lg:bg-[#f8fafc]">
                <div className="flex h-[84px] items-center bg-[#0b1220] px-6 lg:hidden">
                    <img
                        src={LOGO_PULSEAPI}
                        alt="PulseAPI — Smart Production Manager"
                        className="h-auto w-[210px] object-contain object-left"
                    />
                </div>

                <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className={`w-full ${maxWidthClass}`}>
                        <div className="mb-8">
                            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <LockKeyhole size={19} />
                            </div>

                            {eyebrow && (
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                                    {eyebrow}
                                </p>
                            )}

                            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-[28px]">
                                {title}
                            </h2>

                            {description && (
                                <p className="mt-2 max-w-md text-[13px] leading-6 text-slate-500">
                                    {description}
                                </p>
                            )}
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-7">
                            {children}
                        </div>

                        <p className="mt-5 text-center text-[11px] text-slate-400 lg:text-left">
                            Acesso restrito a usuários autorizados.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default AuthLayout;
