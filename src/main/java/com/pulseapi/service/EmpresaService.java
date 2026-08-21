package com.pulseapi.service;

import com.pulseapi.entity.Empresa;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.EmpresaRepository;
import org.springframework.stereotype.Service;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public EmpresaService(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    public Empresa buscarEmpresaAtual() {
        return empresaRepository
                .findAll()
                .stream()
                .findFirst()
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Nenhuma empresa configurada no sistema."
                        )
                );
    }


    public Empresa atualizarEmpresa(Long id, Empresa dados) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Empresa não encontrada com ID: " + id
                ));

        if (dados.getCnpj() != null && !dados.getCnpj().equals(empresa.getCnpj())
                && empresaRepository.existsByCnpj(dados.getCnpj())
        ) {
            throw new BusinessException(
                    "Já existe uma empresa cadastrada com este CNPJ."
            );
        }

        if (dados.getEmail() != null && !dados.getEmail().equals(empresa.getEmail())
                && empresaRepository.existsByEmail(dados.getEmail())
        ) {
            throw new BusinessException(
                    "Já existe uma empresa cadastrada com este e-mail."
            );
        }

        empresa.setRazaoSocial(dados.getRazaoSocial());
        empresa.setNomeFantasia(dados.getNomeFantasia());
        empresa.setCnpj(dados.getCnpj());
        empresa.setEmail(dados.getEmail());
        empresa.setTelefone(dados.getTelefone());

        return empresaRepository.save(empresa);
    }

}
