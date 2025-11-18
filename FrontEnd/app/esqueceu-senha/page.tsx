"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Mail, Lock, Check, ArrowLeft, KeyRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EsqueceuSenhaPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [timer, setTimer] = useState(0);
  const [toastMsg, setToastMsg] = useState(""); // mensagem do toast
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const BACKEND_URL = "http://localhost:8080/api/auth";

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3500); // some em 3.5s
  };

  const handleEnviarCodigo = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/esqueceu-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStep(2);
        setTimer(60);
        showToast("Código enviado para seu email!", "success");
      } else if (response.status === 404) {
        showToast(
          "Email não encontrado. Verifique e tente novamente.",
          "error"
        );
      } else {
        showToast(
          "Erro ao enviar código. Tente novamente mais tarde.",
          "error"
        );
      }
    } catch (error) {
      console.error("Erro ao enviar código:", error);
      showToast("Erro ao conectar com o servidor.", "error");
    }
  };

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      showToast("As senhas não coincidem!", "error");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo, novaSenha }),
      });

      if (response.ok) {
        showToast("Senha redefinida com sucesso!", "success");
        setTimeout(() => (window.location.href = "/"), 1500);
      } else if (response.status === 400) {
        showToast("Código inválido ou expirado. Tente novamente.", "error");
      } else {
        showToast(
          "Erro ao redefinir senha. Tente novamente mais tarde.",
          "error"
        );
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      showToast("Erro ao conectar com o servidor.", "error");
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-r from-[#0f2847] via-[#1a4d5c] to-[#16a085] flex flex-col">
      {/* Toast centralizado */}
      {toastMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className={`flex items-center gap-3 p-5 rounded-2xl shadow-lg pointer-events-auto transition-all duration-300
            ${
              toastType === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <Check className="w-6 h-6" />
            <span className="text-sm md:text-base">{toastMsg}</span>
            <Button onClick={() => setToastMsg("")} className="ml-2">
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </Button>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="w-full text-center pt-8 md:pt-12 z-20">
        <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-bold tracking-wider px-4">
          {step === 1 ? "RECUPERAR SENHA" : "REDEFINIR SENHA"}
        </h1>
      </div>

      {/* Container Principal */}
      <div
        className={`flex-1 flex items-center justify-center px-4 md:px-8 ${
          toastMsg ? "pointer-events-none filter blur-sm" : ""
        }`}
      >
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 w-full max-w-[440px]">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para login
          </a>

          <div className="flex items-center justify-center mb-6 md:mb-8">
            <Image
              src="/logo-gestpro.png"
              alt="GestPro"
              width={180}
              height={54}
              className="object-contain w-40 md:w-48 lg:w-52 h-auto"
            />
          </div>

          {step === 1 && (
            <form onSubmit={handleEnviarCodigo} className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-4">
                Digite seu email para receber o código de recuperação
              </p>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-700 placeholder:text-gray-400 text-sm md:text-base"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#10b981]/30 text-sm md:text-base"
              >
                Enviar Código <Check className="w-5 h-5" strokeWidth={3} />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleRedefinirSenha} className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-4">
                Digite o código enviado para <strong>{email}</strong> e sua nova
                senha
              </p>

              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Código de verificação"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-700 placeholder:text-gray-400 text-sm md:text-base"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-700 placeholder:text-gray-400 text-sm md:text-base"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-gray-700 placeholder:text-gray-400 text-sm md:text-base"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#10b981]/30 text-sm md:text-base"
              >
                Redefinir Senha <Check className="w-5 h-5" strokeWidth={3} />
              </button>

              <button
                type="button"
                onClick={() => handleEnviarCodigo()}
                disabled={timer > 0}
                className={`w-full text-[#10b981] font-medium text-sm ${
                  timer > 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-[#059669]"
                }`}
              >
                {timer > 0
                  ? `Reenviar em ${timer}s`
                  : "Não recebeu o código? Reenviar"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="w-full text-center pb-8 md:pb-12 z-20">
        <p className="text-white text-base md:text-lg lg:text-xl font-medium px-4">
          Sua loja organizada, suas vendas garantidas
        </p>
      </div>
    </div>
  );
}
