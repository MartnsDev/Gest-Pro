"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function ConfirmarEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<
    "sucesso" | "erro" | "invalido" | "processando"
  >("processando");

  useEffect(() => {
    const param = searchParams.get("status");
    if (param === "sucesso") setStatus("sucesso");
    else if (param === "erro") setStatus("erro");
    else setStatus("invalido");

    const timer = setTimeout(() => router.push("http://localhost:3000"), 5000);
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  const mensagens = {
    sucesso: "E-mail confirmado com sucesso! Redirecionando para login...",
    erro: "Não foi possível confirmar o e-mail. Redirecionando para login...",
    invalido: "Token inválido. Redirecionando para login...",
    processando: "Processando confirmação...",
  };

  const cores = {
    sucesso: "text-green-600",
    erro: "text-red-600",
    invalido: "text-yellow-600",
    processando: "text-gray-600",
  };

  const icones = {
    sucesso: (
      <CheckCircle
        size={60}
        className="mx-auto mb-4 text-green-600 animate-bounce"
      />
    ),
    erro: (
      <XCircle size={60} className="mx-auto mb-4 text-red-600 animate-pulse" />
    ),
    invalido: (
      <AlertCircle
        size={60}
        className="mx-auto mb-4 text-yellow-600 animate-pulse"
      />
    ),
    processando: null,
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-sm w-full">
        {icones[status]}
        <h1 className={`text-2xl font-bold mb-4 ${cores[status]}`}>
          Confirmação de E-mail
        </h1>
        <p className="text-gray-700">{mensagens[status]}</p>
      </div>
    </div>
  );
}
