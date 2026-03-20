// lib/services/clientes.ts
import { http } from "../http-client";

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  totalCompras: number;
  dataCadastro?: string;
}

export interface CreateClienteDTO {
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
}

export type UpdateClienteDTO = Partial<CreateClienteDTO>;

export const clientesService = {
  listar: () => http.get<Cliente[]>("/api/clientes"),
  buscarPorId: (id: number) => http.get<Cliente>(`/api/clientes/${id}`),
  criar: (data: CreateClienteDTO) => http.post<Cliente>("/api/clientes", data),
  atualizar: (id: number, data: UpdateClienteDTO) =>
    http.put<Cliente>(`/api/clientes/${id}`, data),
  excluir: (id: number) => http.delete<void>(`/api/clientes/${id}`),
};
