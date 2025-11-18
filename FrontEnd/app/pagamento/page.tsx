"use client";

import type React from "react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  BarChart3,
  FileText,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Plan = "mensal" | "trimestral" | "anual";
type PaymentMethod = "pix" | "cartao" | "boleto";

const plans = {
  mensal: {
    name: "Mensal",
    price: 49.9,
    period: "mês",
    discount: 0,
    badge: null,
  },
  trimestral: {
    name: "Trimestral",
    price: 39.9,
    period: "mês",
    discount: 20,
    badge: "Economize 20%",
  },
  anual: {
    name: "Anual",
    price: 29.9,
    period: "mês",
    discount: 40,
    badge: "Mais Popular",
  },
};

const features = [
  { icon: Package, text: "Controle completo de estoque" },
  { icon: ShoppingCart, text: "Gestão de vendas e PDV" },
  { icon: Users, text: "Cadastro ilimitado de clientes" },
  { icon: BarChart3, text: "Relatórios e dashboards" },
  { icon: FileText, text: "Emissão de notas fiscais" },
  { icon: TrendingUp, text: "Análise de performance" },
];

export default function PagamentoPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("anual");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setIsSuccess(true);
  };

  const currentPlan = plans[selectedPlan];
  const totalPrice =
    selectedPlan === "trimestral"
      ? currentPlan.price * 3
      : selectedPlan === "anual"
      ? currentPlan.price * 12
      : currentPlan.price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.img
              src="/logo-gestpro.png"
              alt="GestPro"
              className="h-20 md:h-24 lg:h-28"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl text-white/90 max-w-2xl mx-auto font-medium"
          >
            Transforme a gestão da sua loja com tecnologia de ponta
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Plans & Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Plan Selection */}
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Escolha seu plano
                </h2>
              </div>

              <div className="grid gap-4">
                {(Object.keys(plans) as Plan[]).map((planKey) => {
                  const plan = plans[planKey];
                  const isSelected = selectedPlan === planKey;

                  return (
                    <motion.button
                      key={planKey}
                      onClick={() => setSelectedPlan(planKey)}
                      className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "border-border hover:border-primary/50 bg-card"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.badge && (
                        <span className="absolute -top-3 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                          {plan.badge}
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-1">
                            {plan.name}
                          </h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-primary">
                              R$ {plan.price.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground">
                              /{plan.period}
                            </span>
                          </div>
                          {plan.discount > 0 && (
                            <p className="text-sm text-primary font-semibold mt-1">
                              Economize {plan.discount}%
                            </p>
                          )}
                        </div>

                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>

            {/* Features */}
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <h3 className="text-xl font-bold text-foreground mb-6">
                Recursos inclusos
              </h3>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Right Column - Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        Finalizar assinatura
                      </h2>
                      <p className="text-muted-foreground">
                        Complete seus dados para começar
                      </p>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nome">Nome completo</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) =>
                            setFormData({ ...formData, nome: e.target.value })
                          }
                          placeholder="Seu nome"
                          required
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="seu@email.com"
                          required
                          className="mt-1.5"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="telefone">Telefone</Label>
                          <Input
                            id="telefone"
                            value={formData.telefone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                telefone: e.target.value,
                              })
                            }
                            placeholder="(00) 00000-0000"
                            required
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            value={formData.cpf}
                            onChange={(e) =>
                              setFormData({ ...formData, cpf: e.target.value })
                            }
                            placeholder="000.000.000-00"
                            required
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <Label className="mb-3 block">Forma de pagamento</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {(["pix", "cartao", "boleto"] as PaymentMethod[]).map(
                          (method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setPaymentMethod(method)}
                              className={`p-4 rounded-xl border-2 transition-all font-semibold ${
                                paymentMethod === method
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-border hover:border-primary/50 text-muted-foreground"
                              }`}
                            >
                              {method === "pix"
                                ? "PIX"
                                : method === "cartao"
                                ? "Cartão"
                                : "Boleto"}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Payment Details */}
                    <AnimatePresence mode="wait">
                      {paymentMethod === "pix" && (
                        <motion.div
                          key="pix"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-primary/5 rounded-xl border border-primary/20"
                        >
                          <p className="text-sm text-foreground font-medium mb-2">
                            Pagamento via PIX
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Após confirmar, você receberá o QR Code para
                            pagamento instantâneo
                          </p>
                        </motion.div>
                      )}

                      {paymentMethod === "cartao" && (
                        <motion.div
                          key="cartao"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          <div>
                            <Label htmlFor="cardNumber">Número do cartão</Label>
                            <Input
                              id="cardNumber"
                              placeholder="0000 0000 0000 0000"
                              className="mt-1.5"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="expiry">Validade</Label>
                              <Input
                                id="expiry"
                                placeholder="MM/AA"
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                className="mt-1.5"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {paymentMethod === "boleto" && (
                        <motion.div
                          key="boleto"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-amber-50 rounded-xl border border-amber-200"
                        >
                          <p className="text-sm text-foreground font-medium mb-2">
                            Pagamento via Boleto
                          </p>
                          <p className="text-xs text-muted-foreground">
                            O boleto será gerado após a confirmação. Vencimento
                            em 3 dias úteis.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Summary */}
                    <div className="p-6 bg-muted/50 rounded-xl space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Plano {currentPlan.name}
                        </span>
                        <span className="font-semibold text-foreground">
                          R$ {currentPlan.price.toFixed(2)}/{currentPlan.period}
                        </span>
                      </div>
                      {selectedPlan !== "mensal" && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {selectedPlan === "trimestral"
                              ? "3 meses"
                              : "12 meses"}
                          </span>
                          <span className="font-semibold text-foreground">
                            R$ {totalPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-border flex justify-between">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          R$ {totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                    >
                      {isProcessing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        >
                          <CreditCard className="w-6 h-6" />
                        </motion.div>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Confirmar pagamento
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Pagamento 100% seguro. Cancele quando quiser.
                    </p>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Check className="w-12 h-12 text-primary" />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-foreground mb-3">
                      Pagamento confirmado!
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Bem-vindo ao GestPro! Sua assinatura está ativa.
                    </p>

                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Acessar plataforma
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
