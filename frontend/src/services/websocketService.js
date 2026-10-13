import { Client } from "@stomp/stompjs";

const WEBSOCKET_URL = "ws://localhost:8080/ws";

export const websocketService = {
    conectarDashboard({
                          token,
                          onAtualizacao,
                          onConectado,
                          onDesconectado,
                          onErro,
                      }) {
        if (!token) {
            return null;
        }

        const client = new Client({
            brokerURL: WEBSOCKET_URL,

            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },

            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            debug: () => {
                /*
                 * Deixe vazio em produção.
                 * Para depuração:
                 *
                 * console.log("[STOMP]", mensagem);
                 */
            },

            onConnect: () => {
                onConectado?.();

                client.subscribe(
                    "/topic/dashboard",
                    (mensagem) => {
                        try {
                            const evento =
                                JSON.parse(mensagem.body);

                            onAtualizacao?.(evento);
                        } catch (error) {
                            console.error(
                                "Não foi possível interpretar a atualização do Dashboard:",
                                error
                            );
                        }
                    }
                );
            },

            onDisconnect: () => {
                onDesconectado?.();
            },

            onWebSocketClose: () => {
                onDesconectado?.();
            },

            onStompError: (frame) => {
                const erro =
                    frame.headers?.message ||
                    frame.body ||
                    "Erro na conexão em tempo real.";

                console.error(
                    "Erro STOMP:",
                    erro
                );

                onErro?.(erro);
            },

            onWebSocketError: (error) => {
                console.error(
                    "Erro no WebSocket:",
                    error
                );

                onErro?.(
                    "Não foi possível estabelecer a conexão em tempo real."
                );
            },
        });

        client.activate();

        return client;
    },

    async desconectar(client) {
        if (!client) {
            return;
        }

        try {
            await client.deactivate();
        } catch (error) {
            console.error(
                "Erro ao desconectar o WebSocket:",
                error
            );
        }
    },
};