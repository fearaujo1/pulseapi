package com.pulseapi.integration.domino.dto;
// Pasta para devolver resposta organizada no controller.

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class DominoRawResponseDTO {

    private boolean ack;
    private boolean nak;
    private String hex;
    private String ascii;

    public DominoRawResponseDTO() {}

    public DominoRawResponseDTO(boolean ack, boolean nak, String hex, String ascii) {
        this.ack = ack;
        this.nak = nak;
        this.hex = hex;
        this.ascii = ascii;
    }

}
