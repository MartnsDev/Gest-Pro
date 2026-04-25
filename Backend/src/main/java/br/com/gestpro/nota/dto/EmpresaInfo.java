package br.com.gestpro.nota.dto;

import br.com.gestpro.nota.RegimeTributario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpresaInfo {
    private Long id;
    private String razaoSocial;
    private String nomeFantasia;
    private String cnpj;
    private String inscricaoEstadual;
    private String inscricaoMunicipal;
    private String cnae;
    private RegimeTributario regimeTributario;
    private String logradouro;
    private String numero;
    private String complemento;
    private String bairro;
    private String municipio;
    private String codigoIbge;
    private String uf;
    private String cep;
    private String telefone;
    private String email;
}