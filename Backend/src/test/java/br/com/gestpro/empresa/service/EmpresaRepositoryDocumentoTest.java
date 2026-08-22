package br.com.gestpro.empresa.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.plano.TipoPlano;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
@ActiveProfiles("test")
class EmpresaRepositoryDocumentoTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Test
    void contaDocumentoFormatadoSemConverterNumeroParaBoolean() {
        Usuario dono = new Usuario();
        dono.setNome("Responsável");
        dono.setEmail("responsavel@example.com");
        dono.setSenha("hash");
        dono.setTipoPlano(TipoPlano.PRO);
        entityManager.persist(dono);

        Empresa empresa = new Empresa();
        empresa.setNomeFantasia("Empresa de teste");
        empresa.setCnpj("529.982.247-25");
        empresa.setDono(dono);
        empresa.setPlano(TipoPlano.PRO);
        empresa.setAtivo(true);
        entityManager.persistAndFlush(empresa);

        assertEquals(1L, empresaRepository.countByDocumentoNormalizado("52998224725"));
        assertEquals(0L, empresaRepository.countByDocumentoNormalizadoAndIdNot("52998224725", empresa.getId()));
        assertEquals(0L, empresaRepository.countByDocumentoNormalizado("11111111111"));
    }
}
