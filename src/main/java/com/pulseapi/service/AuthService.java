package com.pulseapi.service;

import com.pulseapi.dto.auth.LoginRequestDTO;
import com.pulseapi.dto.auth.LoginResponseDTO;
import com.pulseapi.entity.configuracao.ConfiguracaoSistema;
import com.pulseapi.entity.usuario.Turno;
import com.pulseapi.entity.usuario.Usuario;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.repository.UsuarioRepository;
import com.pulseapi.security.TokenService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.Set;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;
    private final ConfiguracaoSistemaService configuracaoSistemaService;

    public AuthService(
            AuthenticationManager authenticationManager,
            TokenService tokenService,
            UsuarioRepository usuarioRepository,
            ConfiguracaoSistemaService configuracaoSistemaService
    ) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
        this.configuracaoSistemaService = configuracaoSistemaService;
    }

    public LoginResponseDTO login(LoginRequestDTO dto) {

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        dto.getEmail(),
                        dto.getSenha()
                );

        Authentication authentication =
                authenticationManager.authenticate(authToken);

        Usuario usuarioAutenticado =
                (Usuario) authentication.getPrincipal();

        Usuario usuario =
                usuarioRepository
                        .findComTurnosByEmail(
                                usuarioAutenticado.getEmail()
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Usuário não encontrado."
                                )
                        );

        validarAcessoPorTurno(usuario);

        String token =
                tokenService.gerarToken(usuario);

        String mensagem =
                usuario.getPrimeiroAcesso()
                        ? "Primeiro acesso. Usuário deve alterar a senha."
                        : "Login realizado com sucesso.";

        return new LoginResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().getNome(),
                token,
                mensagem
        );
    }


    // =========================================================
    // CONTROLE DE ACESSO POR TURNO
    // =========================================================

    private void validarAcessoPorTurno(
            Usuario usuario
    ) {

        /*
         * Apenas OPERADOR sofre restrição.
         */
        if (
                !"OPERADOR".equalsIgnoreCase(
                        usuario.getPerfil().getNome()
                )
        ) {
            return;
        }

        ConfiguracaoSistema configuracao =
                configuracaoSistemaService.buscarEntity();

        /*
         * Controle desligado:
         * login liberado normalmente.
         */
        if (
                !Boolean.TRUE.equals(
                        configuracao.getControleAcessoTurnoAtivo()
                )
        ) {
            return;
        }

        /*
         * Consideramos apenas turnos ativos.
         */
        Set<Turno> turnosAtivos =
                usuario.getTurnos()
                        .stream()
                        .filter(turno ->
                                Boolean.TRUE.equals(
                                        turno.getAtivo()
                                )
                        )
                        .collect(
                                java.util.stream.Collectors.toSet()
                        );

        /*
         * Controle ligado + OPERADOR sem turno ativo:
         * login bloqueado.
         */
        if (turnosAtivos.isEmpty()) {
            throw new BusinessException(
                    "Seu usuário não possui um turno ativo configurado. Entre em contato com o administrador."
            );
        }

        int tolerancia =
                configuracao.getToleranciaTurnoMinutos();

        LocalTime agora =
                LocalTime.now();

        boolean acessoPermitido =
                turnosAtivos
                        .stream()
                        .anyMatch(turno ->
                                estaDentroDoTurno(
                                        agora,
                                        turno,
                                        tolerancia
                                )
                        );

        if (!acessoPermitido) {
            throw new BusinessException(
                    "Acesso não permitido neste horário. Consulte o horário do seu turno."
            );
        }
    }


    // =========================================================
    // VERIFICA HORÁRIO
    // =========================================================

    private boolean estaDentroDoTurno(
            LocalTime agora,
            Turno turno,
            int toleranciaMinutos
    ) {

        int inicio =
                turno.getHoraInicio()
                        .getHour() * 60
                        +
                        turno.getHoraInicio()
                                .getMinute();

        int fim =
                turno.getHoraFim()
                        .getHour() * 60
                        +
                        turno.getHoraFim()
                                .getMinute();

        int atual =
                agora.getHour() * 60
                        +
                        agora.getMinute();

        /*
         * Calcula a duração real do turno em minutos.
         */
        int duracaoTurno;

        if (fim >= inicio) {
            duracaoTurno =
                    fim - inicio;
        } else {
            duracaoTurno =
                    (24 * 60 - inicio)
                            + fim;
        }

        int duracaoPermitida =
                duracaoTurno
                        + (toleranciaMinutos * 2);

        if (duracaoPermitida >= 24 * 60) {
            return true;
        }

        int inicioPermitido =
                inicio - toleranciaMinutos;

        while (inicioPermitido < 0) {
            inicioPermitido += 24 * 60;
        }

        inicioPermitido =
                inicioPermitido % (24 * 60);

        int fimPermitido =
                inicioPermitido
                        + duracaoPermitida;

        int atualAjustado =
                atual;

        if (atualAjustado < inicioPermitido) {
            atualAjustado += 24 * 60;
        }

        return atualAjustado >= inicioPermitido
                &&
                atualAjustado <= fimPermitido;
    }
}