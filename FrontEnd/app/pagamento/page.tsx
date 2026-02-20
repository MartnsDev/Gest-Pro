"use client";

import { useState } from "react";
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
  ArrowRight,
} from "lucide-react";
import a from "@/app/styles/auth.module.css";
import p from "./pagamento.module.css";

type Plan = "mensal" | "trimestral" | "anual";
type PaymentMethod = "pix" | "cartao" | "boleto";

const plans: Record<
  Plan,
  {
    name: string;
    price: number;
    period: string;
    discount: number;
    badge: string | null;
    months: number;
  }
> = {
  mensal: {
    name: "Mensal",
    price: 49.9,
    period: "mês",
    discount: 0,
    badge: null,
    months: 1,
  },
  trimestral: {
    name: "Trimestral",
    price: 39.9,
    period: "mês",
    discount: 20,
    badge: "Economize 20%",
    months: 3,
  },
  anual: {
    name: "Anual",
    price: 29.9,
    period: "mês",
    discount: 40,
    badge: "Mais popular",
    months: 12,
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

function FieldGroup({
  label,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
}) {
  return (
    <div className={p.fieldGroup}>
      <label className={p.fieldLabel} htmlFor={id}>
        {label}
      </label>
      <input id={id} className={p.fieldInput} {...props} />
    </div>
  );
}

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
  const [cardData, setCardData] = useState({
    numero: "",
    validade: "",
    cvv: "",
    nomeTitular: "",
  });

  const currentPlan = plans[selectedPlan];
  const totalPrice = currentPlan.price * currentPlan.months;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsProcessing(false);
    setIsSuccess(true);
  };

  /* ── Success screen ── */
  if (isSuccess) {
    return (
      <div className={a.authPage}>
        <div className={a.blob1} />
        <div className={a.blob2} />
        <div className={a.card}>
          <div className={a.cardTopBar} />
          <div className={a.cardBody}>
            <div className={a.successBox}>
              <div
                className={`${a.successIcon} ${a.successIconGreen}`}
                style={{ width: 80, height: 80 }}
              >
                <Check
                  size={38}
                  strokeWidth={2.5}
                  style={{ color: "#059669" }}
                />
              </div>
              <p className={a.successTitle} style={{ fontSize: "1.3rem" }}>
                Pagamento confirmado!
              </p>
              <p className={a.successDesc} style={{ maxWidth: 300 }}>
                Bem-vindo ao GestPro! Sua assinatura do plano{" "}
                <strong>{currentPlan.name}</strong> está ativa.
              </p>
              <button
                className={a.btnPrimary}
                onClick={() => (window.location.href = "/dashboard")}
              >
                Acessar plataforma <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <p className={a.pageFooter}>
          Sua loja organizada, suas vendas garantidas
        </p>
      </div>
    );
  }

  return (
    <div className={p.page}>
      <div className={p.blob1} />
      <div className={p.blob2} />

      {/* Header */}
      <header className={p.header}>
        <div className={p.brandRow}>
          <span className={p.brandDark}>Gest</span>
          <span className={p.brandGreen}>Pro</span>
        </div>
        <p className={p.headerSub}>
          Transforme a gestão da sua loja com tecnologia de ponta
        </p>
      </header>

      <div className={p.grid}>
        {/* ── Left: Plans + Features ── */}
        <div className={p.leftCol}>
          {/* plan selection */}
          <div className={p.card}>
            <div className={p.cardHead}>
              <Sparkles size={18} style={{ color: "#10b981" }} />
              <h2 className={p.cardTitle}>Escolha seu plano</h2>
            </div>
            <div className={p.planList}>
              {(Object.keys(plans) as Plan[]).map((key) => {
                const plan = plans[key];
                const selected = selectedPlan === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPlan(key)}
                    className={`${p.planCard} ${selected ? p.planCardSelected : ""}`}
                  >
                    {plan.badge && (
                      <span
                        className={`${p.planBadge} ${key === "anual" ? p.planBadgeGreen : p.planBadgeBlue}`}
                      >
                        {plan.badge}
                      </span>
                    )}
                    <div className={p.planRow}>
                      <div>
                        <p className={p.planName}>{plan.name}</p>
                        <div className={p.planPriceRow}>
                          <span className={p.planCurrency}>R$</span>
                          <span className={p.planAmount}>
                            {plan.price.toFixed(2)}
                          </span>
                          <span className={p.planPeriod}>/{plan.period}</span>
                        </div>
                        {plan.discount > 0 && (
                          <p className={p.planSavings}>
                            Economize {plan.discount}%
                          </p>
                        )}
                      </div>
                      <div
                        className={`${p.planRadio} ${selected ? p.planRadioSelected : ""}`}
                      >
                        {selected && <Check size={13} strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* features */}
          <div className={p.card}>
            <h3 className={p.cardTitle} style={{ marginBottom: 20 }}>
              Recursos inclusos
            </h3>
            <div className={p.featureList}>
              {features.map((f) => (
                <div key={f.text} className={p.featureItem}>
                  <div className={p.featureIcon}>
                    <f.icon size={18} />
                  </div>
                  <span className={p.featureText}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Payment Form ── */}
        <div className={p.card}>
          <h2 className={p.cardTitle}>Finalizar assinatura</h2>
          <p className={p.cardSub}>Complete seus dados para começar</p>

          <form onSubmit={handleSubmit} className={p.payForm}>
            {/* personal info */}
            <div className={p.formSection}>
              <FieldGroup
                label="Nome completo"
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="Seu nome"
                required
              />
              <FieldGroup
                label="E-mail"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="seu@email.com"
                required
              />
              <div className={p.formRow}>
                <FieldGroup
                  label="Telefone"
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                  required
                />
                <FieldGroup
                  label="CPF"
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({ ...formData, cpf: e.target.value })
                  }
                  placeholder="000.000.000-00"
                  required
                />
              </div>
            </div>

            {/* payment method */}
            <div className={p.formSection}>
              <p className={p.fieldLabel}>Forma de pagamento</p>
              <div className={p.methodGrid}>
                {(["pix", "cartao", "boleto"] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`${p.methodBtn} ${paymentMethod === m ? p.methodBtnActive : ""}`}
                  >
                    {m === "pix" ? "PIX" : m === "cartao" ? "Cartão" : "Boleto"}
                  </button>
                ))}
              </div>
            </div>

            {/* payment details */}
            {paymentMethod === "pix" && (
              <div className={p.infoBoxGreen}>
                <p className={p.infoTitle}>Pagamento via PIX</p>
                <p className={p.infoDesc}>
                  Após confirmar, você receberá o QR Code para pagamento
                  instantâneo.
                </p>
              </div>
            )}
            {paymentMethod === "cartao" && (
              <div className={p.formSection}>
                <FieldGroup
                  label="Número do cartão"
                  id="cardNumber"
                  value={cardData.numero}
                  onChange={(e) =>
                    setCardData({ ...cardData, numero: e.target.value })
                  }
                  placeholder="0000 0000 0000 0000"
                />
                <FieldGroup
                  label="Nome no cartão"
                  id="nomeTitular"
                  value={cardData.nomeTitular}
                  onChange={(e) =>
                    setCardData({ ...cardData, nomeTitular: e.target.value })
                  }
                  placeholder="Como aparece no cartão"
                />
                <div className={p.formRow}>
                  <FieldGroup
                    label="Validade"
                    id="validade"
                    value={cardData.validade}
                    onChange={(e) =>
                      setCardData({ ...cardData, validade: e.target.value })
                    }
                    placeholder="MM/AA"
                  />
                  <FieldGroup
                    label="CVV"
                    id="cvv"
                    value={cardData.cvv}
                    onChange={(e) =>
                      setCardData({ ...cardData, cvv: e.target.value })
                    }
                    placeholder="123"
                  />
                </div>
              </div>
            )}
            {paymentMethod === "boleto" && (
              <div className={p.infoBoxYellow}>
                <p className={p.infoTitle}>Pagamento via Boleto</p>
                <p className={p.infoDesc}>
                  O boleto será gerado após a confirmação. Vencimento em 3 dias
                  úteis.
                </p>
              </div>
            )}

            {/* summary */}
            <div className={p.summary}>
              <div className={p.summaryRow}>
                <span className={p.summaryLabel}>Plano {currentPlan.name}</span>
                <span className={p.summaryVal}>
                  R$ {currentPlan.price.toFixed(2)}/{currentPlan.period}
                </span>
              </div>
              {selectedPlan !== "mensal" && (
                <div className={p.summaryRow}>
                  <span className={p.summaryLabel}>
                    {currentPlan.months} meses
                  </span>
                  <span className={p.summaryVal}>
                    R$ {totalPrice.toFixed(2)}
                  </span>
                </div>
              )}
              <div className={p.summaryTotal}>
                <span>Total</span>
                <span className={p.summaryTotalAmount}>
                  R$ {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={isProcessing}
              className={a.btnPrimary}
              style={{ height: 54, fontSize: 16, marginTop: 0 }}
            >
              {isProcessing ? (
                <>
                  <span className={a.spinner} /> Processando...
                </>
              ) : (
                <>
                  <CreditCard size={18} /> Confirmar pagamento
                </>
              )}
            </button>

            <p className={p.payNote}>
              Pagamento 100% seguro. Cancele quando quiser.
            </p>
          </form>
        </div>
      </div>

      <p className={p.footer}>Sua loja organizada, suas vendas garantidas</p>
    </div>
  );
}
