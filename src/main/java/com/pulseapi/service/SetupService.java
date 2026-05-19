package com.pulseapi.service;

import com.pulseapi.dto.setup.SetupInicialRequestDTO;
import com.pulseapi.dto.setup.SetupStatusResponseDTO;
import com.pulseapi.entity.Empresa;
import com.pulseapi.entity.Perfil;
import com.pulseapi.entity.StatusUsuario;
import com.pulseapi.entity.Usuario;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.repository.EmpresaRepository;
import com.pulseapi.repository.PerfilRepository;
import com.pulseapi.repository.UsuarioRepository;
import com.pulseapi.util.SenhaValidator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SetupService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;

    public SetupService(EmpresaRepository empresaRepository,
                        PerfilRepository perfilRepository,
                        UsuarioRepository usuarioRepository,
                        PasswordEncoder passwordEncoder) {
        this.empresaRepository = empresaRepository;
        this.perfilRepository = perfilRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public SetupStatusResponseDTO verificarStatus() {
        boolean configurado = empresaRepository.count() > 0;
        return new SetupStatusResponseDTO(configurado);
    }

    public void configurarInicialmente(SetupInicialRequestDTO dto) {
        if (empresaRepository.count() > 0) {
            throw new BusinessException("O sistema já foi configurado");
        }

        criarPerfisPadrao();

        Perfil perfilAdmin = perfilRepository.findByNome("ADMIN")
                .orElseThrow(() -> new BusinessException("Perfil ADMIN não encontrado"));

        SenhaValidator.validarSenhaForte(dto.getAdmin().getSenha());

        Empresa empresa = Empresa.builder()
                .razaoSocial(dto.getEmpresa().getRazaoSocial())
                .nomeFantasia(dto.getEmpresa().getNomeFantasia())
                .cnpj(dto.getEmpresa().getCnpj())
                .email(dto.getEmpresa().getEmail())
                .telefone(dto.getEmpresa().getTelefone())
                .build();

        Empresa empresaSalva = empresaRepository.save(empresa);

        Usuario admin = Usuario.builder()
                .nome(dto.getAdmin().getNome())
                .email(dto.getAdmin().getEmail())
                .telefone(dto.getAdmin().getTelefone())
                .senhaHash(passwordEncoder.encode(dto.getAdmin().getSenha()))
                .perfil(perfilAdmin)
                .empresa(empresaSalva)
                .status(StatusUsuario.ATIVO)
                .primeiroAcesso(true)
                .build();

        usuarioRepository.save(admin);
    }

    private void criarPerfisPadrao() {
        criarPerfilSeNaoExistir("ADMIN", "Administrador do Sistema");
        criarPerfilSeNaoExistir("GESTOR", "Gestor da produção");
        criarPerfilSeNaoExistir("SUPERVISOR", "Supervisor da produção");
        criarPerfilSeNaoExistir("OPERADOR", "Operador da produção");
    }

    private void criarPerfilSeNaoExistir(String nome, String descricao) {
        if (!perfilRepository.existsByNome(nome)) {
            Perfil perfil = Perfil.builder()
                    .nome(nome)
                    .descricao(descricao)
                    .build();

            perfilRepository.save(perfil);
        }
    }
}
