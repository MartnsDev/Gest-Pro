package br.com.gestpro.nota.dto;

import java.math.BigDecimal;

public record ItemCalc(NotaFiscalDTOs.CriarItemNotaDTO dto, BigDecimal total) {}