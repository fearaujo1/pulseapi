package com.pulseapi.integration.domino.exception;

public class DominoCommunicationException  extends RuntimeException {

    public DominoCommunicationException(String message) {
        super(message);
    }

    public DominoCommunicationException(String message, Throwable cause) {
        super(message, cause);
    }

    // Essa exceção será lançada quando:
    // o simulador estiver desligado
    // IP estiver incorreto
    // porta estiver fechada
    // ocorrer timeout
    // a resposta for inválida
}
