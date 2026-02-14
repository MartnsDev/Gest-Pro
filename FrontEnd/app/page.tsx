"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Check } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormInput } from "@/components/auth/FormInput";
import { login, loginComGoogle } from "@/lib/api";
import styles from "@/app/styles/auth.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [planoExpirado, setPlanoExpirado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlanoExpirado(false);

    try {
      const user = await login(email, password);

      // 🔥 Se backend mandar INATIVO → redireciona
      if (user.statusAcesso === "INATIVO") {
        setPlanoExpirado(true);
        router.push("/pagamento");
        return;
      }

      // 🔥 Se vier data de expiração
      if (user.expiracaoPlano) {
        const expirado = new Date(user.expiracaoPlano) < new Date();
        if (expirado) {
          setPlanoExpirado(true);
          router.push("/pagamento");
          return;
        }
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="GARANTA 7 DIAS GRÁTIS!"
      subtitle="Sua loja organizada, suas vendas garantidas"
    >
      {error && <div className={styles.errorMessage}>{error}</div>}

      {planoExpirado && (
        <div className={styles.errorMessage}>
          Seu plano expirou.
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => router.push("/pagamento")}
              className={styles.btnPrimary}
            >
              Renovar Plano
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.authForm}>
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          required
          disabled={loading}
        />

        <div className="text-right">
          <a
            href="/esqueceu-senha"
            className="text-xs md:text-sm text-gray-500 hover:text-gray-700"
          >
            Esqueceu a senha?
          </a>
        </div>

        <button type="submit" disabled={loading} className={styles.btnPrimary}>
          {loading ? "Entrando..." : "Entrar"}{" "}
          <Check className="w-5 h-5" strokeWidth={3} />
        </button>

        <button
          type="button"
          onClick={loginComGoogle}
          disabled={loading}
          className={styles.btnSecondary}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Login com Google
        </button>

        <div className="text-center mt-4">
          <p className="text-xs md:text-sm text-gray-600">
            Não tem uma conta?{" "}
            <a href="/cadastro" className={styles.authLink}>
              Cadastre-se
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
