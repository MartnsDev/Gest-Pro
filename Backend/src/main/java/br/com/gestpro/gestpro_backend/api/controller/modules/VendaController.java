package br.com.gestpro.gestpro_backend.api.controller.modules;

import br.com.gestpro.gestpro_backend.api.dto.modules.vendas.RegistrarVendaDTO;
import br.com.gestpro.gestpro_backend.api.dto.modules.vendas.VendaResponseDTO;
import br.com.gestpro.gestpro_backend.domain.model.modules.venda.Venda;
import br.com.gestpro.gestpro_backend.domain.service.modulesService.venda.VendaServiceInterface;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {

    private final VendaServiceInterface vendaService;

    public VendaController(VendaServiceInterface vendaService) {
        this.vendaService = vendaService;
    }

    @PostMapping("/registrar")
    public ResponseEntity<VendaResponseDTO> registrarVenda(@RequestBody RegistrarVendaDTO dto) {
        Venda venda = vendaService.registrarVenda(dto);
        return ResponseEntity.ok(new VendaResponseDTO(venda));
    }

    @GetMapping("/caixa/{idCaixa}")
    public ResponseEntity<List<VendaResponseDTO>> listarPorCaixa(@PathVariable Long idCaixa) {
        List<VendaResponseDTO> vendas = vendaService.listarPorCaixa(idCaixa)
                .stream()
                .map(VendaResponseDTO::new)
                .toList();
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendaResponseDTO> buscarPorId(@PathVariable Long id) {
        Venda venda = vendaService.buscarPorId(id);
        return ResponseEntity.ok(new VendaResponseDTO(venda));
    }
}
