package com.pulseapi.util;

import com.pulseapi.exception.BusinessException;

public class SenhaValidator {

    private SenhaValidator() {}

    public static void validarSenhaForte(String senha) {
        if (senha == null || senha.length() < 8) {
            throw new BusinessException("A senha deve ter no mínimo 8 caracteres");
        }

        if (!senha.matches(".*[A-Z].*")) {
            throw new BusinessException("A deve conter pelo menos uma letra maiúscula");
        }

        if (!senha.matches(".*[a-z].*")) {
            throw new BusinessException("A senha deve conter pelo menos uma letra minúscula.");
        }

        if (!senha.matches(".*\\d.*")) {
            throw new BusinessException("A senha deve conter pelo menos um número.");
        }

        if (!senha.matches(".*[@#$%^&+=!?.*_-].*")) {
            throw new BusinessException("A senha deve conter pelo menos um caractere especial.");
        }
    }
}
