package com.pulseapi.integration.domino.parser;

import java.util.Map;
import java.util.Set;

public class DominoStatusMap {

    public static boolean conhecido(String codigo) {
        return codigo != null && STATUS.containsKey(codigo);
    }

    private static final Map<String, String> STATUS =
            Map.ofEntries(
                    Map.entry("000", "Impressora pronta"),
                    Map.entry("100", "Falha geral da impressora"),

                    Map.entry("004", "Circuito de carga recuperado"),
                    Map.entry("104", "Falha no circuito de carga"),

                    Map.entry("005", "Nível de solvente normal"),
                    Map.entry("205", "Nível de solvente baixo"),
                    Map.entry("206", "Reservatório de solvente vazio"),

                    Map.entry("007", "Nível de tinta normal"),
                    Map.entry("107", "Nível de tinta baixo"),

                    Map.entry("008", "24 horas para expiração do reservatório"),
                    Map.entry("009", "2 horas para expiração do reservatório"),

                    Map.entry("010", "Purga do cabeçote desativada"),
                    Map.entry("110", "Purga do cabeçote ativada"),

                    Map.entry("011", "Taxa de impressão normal"),
                    Map.entry("111", "Taxa de impressão muito alta"),

                    Map.entry("115", "Segundo conjunto de caracteres ausente"),
                    Map.entry("116", "Segundo conjunto de caracteres incompatível"),
                    Map.entry("117", "Pulsos de impressão perdidos por alta velocidade"),

                    Map.entry("018", "Bolsa de tinta normal"),
                    Map.entry("118", "Bolsa de tinta vazia"),

                    Map.entry("020", "Monitor de tinta normal"),
                    Map.entry("221", "Viscosidade fora da faixa normal"),
                    Map.entry("222", "Tempo limite do viscosímetro excedido"),
                    Map.entry("223", "Reservatório de tinta incompatível"),
                    Map.entry("224", "Reservatório de tinta vazio"),
                    Map.entry("225", "Reservatório de tinta expirado"),

                    Map.entry("026", "Fonte EHT recuperada"),
                    Map.entry("226", "Falha na fonte EHT"),

                    Map.entry("027", "Eletrodo de carga normal"),
                    Map.entry("227", "Tinta detectada no eletrodo de carga"),

                    Map.entry("028", "Bloqueio de fase recuperado"),
                    Map.entry("228", "Bloqueio de fase perdido"),

                    Map.entry("029", "Circuito de carga recuperado"),
                    Map.entry("229", "Circuito de carga desarmado"),

                    Map.entry("030", "Modulação recuperada"),
                    Map.entry("230", "Falha de modulação"),

                    Map.entry("031", "Alinhamento do jato normal"),
                    Map.entry("231", "Jato desalinhado"),

                    Map.entry("232", "Temperatura fora da faixa normal"),
                    Map.entry("233", "Pressão fora da faixa normal"),

                    Map.entry("999", "Alerta indefinido")
            );


    private static final Map<String, Set<String>> FAMILIAS_NORMALIZADAS =
            Map.ofEntries(
                    Map.entry("000", Set.of("00")),
                    Map.entry("004", Set.of("04")),
                    Map.entry("005", Set.of("05", "06")),
                    Map.entry("007", Set.of("07")),
                    Map.entry("010", Set.of("10")),
                    Map.entry("011", Set.of("11", "17")),
                    Map.entry("018", Set.of("18")),

                    /*
                     * O código 020 indica que o monitor de tinta
                     * voltou ao estado normal.
                     */
                    Map.entry(
                            "020",
                            Set.of(
                                    "21", "22", "23", "24", "25",
                                    "26", "27", "28", "29", "30",
                                    "31", "32", "33"
                            )
                    ),

                    Map.entry("026", Set.of("26")),
                    Map.entry("027", Set.of("27")),
                    Map.entry("028", Set.of("28")),
                    Map.entry("029", Set.of("29")),
                    Map.entry("030", Set.of("30")),
                    Map.entry("031", Set.of("31"))
            );


    private DominoStatusMap() {
    }


    public static String descricao(
            String codigo
    ) {

        return STATUS.getOrDefault(
                codigo,
                "Status Domino não mapeado"
        );
    }


    public static String severidade(
            String codigo
    ) {

        if (
                codigo == null ||
                        codigo.length() != 3
        ) {
            return "DESCONHECIDA";
        }

        return switch (
                codigo.charAt(0)
                ) {

            case '0' ->
                    "NORMALIZACAO";

            case '1' ->
                    "ATENCAO";

            case '2' ->
                    "CRITICA";

            case '9' ->
                    "INDEFINIDA";

            default ->
                    "DESCONHECIDA";
        };
    }

    public static Set<String> familiasNormalizadas(
            String codigo
    ) {
        return FAMILIAS_NORMALIZADAS.getOrDefault(
                codigo,
                Set.of()
        );
    }
}