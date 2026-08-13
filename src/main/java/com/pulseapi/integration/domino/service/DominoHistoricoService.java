package com.pulseapi.integration.domino.service;

import com.pulseapi.entity.Equipamento;
import com.pulseapi.entity.HistoricoComunicacaoDomino;
import com.pulseapi.entity.ResultadoComunicacaoDomino;
import com.pulseapi.integration.domino.DominoLogger;
import com.pulseapi.repository.HistoricoComunicacaoDominoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import com.pulseapi.integration.domino.dto.DominoHistoricoResponseDTO;
import java.util.List;

@Service
public class DominoHistoricoService {

    private final HistoricoComunicacaoDominoRepository historicoRepository;

    public DominoHistoricoService(
            HistoricoComunicacaoDominoRepository historicoRepository
    ) {
        this.historicoRepository = historicoRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarSucesso(
            Equipamento equipamento,
            String nomeComando,
            byte[] comando,
            byte[] resposta
    ) {
        ResultadoComunicacaoDomino resultado =
                identificarResultado(resposta);

        HistoricoComunicacaoDomino historico =
                HistoricoComunicacaoDomino.builder()
                        .equipamento(equipamento)
                        .nomeComando(nomeComando)
                        .envioHex(DominoLogger.bytesParaHex(comando))
                        .envioAscii(DominoLogger.bytesParaAscii(comando))
                        .respostaHex(DominoLogger.bytesParaHex(resposta))
                        .respostaAscii(DominoLogger.bytesParaAscii(resposta))
                        .resultado(resultado)
                        .build();

        historicoRepository.save(historico);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarErro(
            Equipamento equipamento,
            String nomeComando,
            byte[] comando,
            String mensagemErro
    ) {
        HistoricoComunicacaoDomino historico =
                HistoricoComunicacaoDomino.builder()
                        .equipamento(equipamento)
                        .nomeComando(nomeComando)
                        .envioHex(
                                comando == null
                                        ? null
                                        : DominoLogger.bytesParaHex(comando)
                        )
                        .envioAscii(
                                comando == null
                                        ? null
                                        : DominoLogger.bytesParaAscii(comando)
                        )
                        .resultado(ResultadoComunicacaoDomino.ERRO)
                        .mensagemErro(limitarMensagem(mensagemErro))
                        .build();

        historicoRepository.save(historico);
    }

    private ResultadoComunicacaoDomino identificarResultado(
            byte[] resposta
    ) {
        if (resposta == null || resposta.length == 0) {
            return ResultadoComunicacaoDomino.ERRO;
        }

        int primeiroByte = resposta[0] & 0xFF;

        if (primeiroByte == 0x06) {
            return ResultadoComunicacaoDomino.ACK;
        }

        if (primeiroByte == 0x15) {
            return ResultadoComunicacaoDomino.NAK;
        }

        return ResultadoComunicacaoDomino.SUCESSO;
    }

    private String limitarMensagem(String mensagem) {
        if (mensagem == null) {
            return null;
        }

        return mensagem.length() <= 1000
                ? mensagem
                : mensagem.substring(0, 1000);
    }

    @Transactional(readOnly = true)
    public List<DominoHistoricoResponseDTO> listarPorEquipamento(
            Long equipamentoId
    ) {
        return historicoRepository
                .findByEquipamentoIdOrderByCriadoEmDesc(equipamentoId)
                .stream()
                .map(historico -> new DominoHistoricoResponseDTO(
                        historico.getId(),
                        historico.getEquipamento().getId(),
                        historico.getNomeComando(),
                        historico.getEnvioAscii(),
                        historico.getEnvioHex(),
                        historico.getRespostaAscii(),
                        historico.getRespostaHex(),
                        historico.getResultado(),
                        historico.getMensagemErro(),
                        historico.getCriadoEm()
                ))
                .toList();
    }
}