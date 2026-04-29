package com.pulseapi.exception;


// O recurso que o usuário pediu não existe - evita o 404 Not Found
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

// RuntimeException - não precisa tratar obrigatoriamente e ocorre em tempo de execução
