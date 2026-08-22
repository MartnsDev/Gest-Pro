package br.com.gestpro.empresa.service;

import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class DocumentoFiscalValidationTest {

    private final VerificarCNPJ verificarCNPJ = new VerificarCNPJ(mock(WebClient.class));
    private final VerificarCPF verificarCPF = new VerificarCPF();

    @Test
    void aceitaCnpjValidoComOuSemMascara() {
        assertTrue(verificarCNPJ.isCnpjValido("11.222.333/0001-81"));
        assertTrue(verificarCNPJ.isCnpjValido("11222333000181"));
    }

    @Test
    void rejeitaCnpjComDigitoIncorretoOuRepetido() {
        assertFalse(verificarCNPJ.isCnpjValido("11.222.333/0001-82"));
        assertFalse(verificarCNPJ.isCnpjValido("00.000.000/0000-00"));
        assertFalse(verificarCNPJ.isCnpjValido(""));
    }

    @Test
    void aceitaCpfValidoComOuSemMascara() {
        assertDoesNotThrow(() -> verificarCPF.consultarCpf("529.982.247-25"));
        assertDoesNotThrow(() -> verificarCPF.consultarCpf("52998224725"));
    }

    @Test
    void rejeitaCpfComDigitoIncorretoOuRepetido() {
        assertThrows(ResponseStatusException.class, () -> verificarCPF.consultarCpf("52998224724"));
        assertThrows(ResponseStatusException.class, () -> verificarCPF.consultarCpf("11111111111"));
    }
}
