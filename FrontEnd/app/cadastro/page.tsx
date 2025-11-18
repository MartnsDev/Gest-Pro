"use client";

import { useState } from "react";
import { Mail, Lock, User, Check, ArrowLeft, X } from "lucide-react";
import { FormInput } from "@/components/auth/FormInput";
import { PhotoUpload } from "@/components/auth/PhotoUpload";
import { cadastrar } from "@/lib/api";
import { Button } from "@/components/ui/button";
import styles from "@/app/styles/auth.module.css";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem!");
      return;
    }

    if (senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await cadastrar(nome, email, senha, foto || undefined);
      setShowModal(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao realizar cadastro"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      {/* Cabeçalho */}
      <div className={styles.authHeader}>
        <h1 className={styles.authHeaderTitle}>CRIE SUA CONTA GRÁTIS!</h1>
      </div>

      {/* Conteúdo centralizado */}
      <div className={styles.authContent}>
        <div className={styles.authContentInner}>
          {/* Card do Formulário */}
          <div className={styles.authCard}>
            <div className={styles.authCardInner}>
              {/* Voltar */}
              <a href="/" className={styles.backLink}>
                <ArrowLeft className="w-4 h-4" />
                Voltar para login
              </a>

              {error && <div className={styles.errorMessage}>{error}</div>}

              <form onSubmit={handleSubmit} className={styles.authForm}>
                <PhotoUpload
                  preview={fotoPreview}
                  onChange={handleFotoChange}
                  disabled={loading}
                />
                <FormInput
                  type="text"
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  icon={User}
                  required
                  disabled={loading}
                />
                <FormInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  required
                  disabled={loading}
                />
                <FormInput
                  type="password"
                  placeholder="Senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  icon={Lock}
                  required
                  disabled={loading}
                />
                <FormInput
                  type="password"
                  placeholder="Confirmar senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  icon={Lock}
                  required
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.btnPrimary}
                >
                  {loading ? "Cadastrando..." : "Cadastrar"}
                  <Check className="w-5 h-5" strokeWidth={3} />
                </button>

                <div className="text-center mt-4">
                  <p className="text-xs md:text-sm text-gray-600">
                    Já tem uma conta?{" "}
                    <a href="/" className={styles.authLink}>
                      Fazer login
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className={styles.authFooter}>
        <p className={styles.authFooterText}>
          Sua loja organizada, suas vendas garantidas
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          <div className="bg-white rounded-xl p-8 w-11/12 max-w-sm text-center relative z-10">
            <Button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold mb-4">Confirme seu email</h2>
            <p className="text-gray-600 mb-6">
              Enviamos um link de confirmação para seu e-mail. Por favor,
              verifique sua caixa de entrada e clique no link para ativar sua
              conta.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className={`${styles.btnPrimary} px-6 py-2`}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
