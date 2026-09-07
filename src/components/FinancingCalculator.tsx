import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Percent, 
  ShieldCheck, 
  Info, 
  Check, 
  ArrowRight, 
  MessageCircle, 
  FileText, 
  HelpCircle,
  PiggyBank,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FinancingSimulation {
  propertyPrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanAmount: number;
  termYears: number;
  termMonths: number;
  annualInterestRate: number;
  amortizationSystem: 'SAC' | 'PRICE';
  firstInstallment: number;
  lastInstallment?: number;
  monthlyInstallment: number;
  totalInterest: number;
  totalPaid: number;
  minIncome: number;
}

interface FinancingCalculatorProps {
  propertyPrice: number;
  propertyCode?: string;
  propertyTitle?: string;
  onApplySimulation?: (simulation: FinancingSimulation) => void;
}

export default function FinancingCalculator({
  propertyPrice,
  propertyCode,
  propertyTitle,
  onApplySimulation
}: FinancingCalculatorProps) {
  // Input states
  const [price, setPrice] = useState<number>(propertyPrice || 1000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [termYears, setTermYears] = useState<number>(30); // 360 months
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(10.2); // 10.2% a.a.
  const [amortizationSystem, setAmortizationSystem] = useState<'SAC' | 'PRICE'>('SAC');
  const [useFGTS, setUseFGTS] = useState<boolean>(false);
  const [fgtsAmount, setFgtsAmount] = useState<number>(0);
  const [showDocumentationDetails, setShowDocumentationDetails] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Sync if prop changes
  React.useEffect(() => {
    if (propertyPrice && propertyPrice > 0) {
      setPrice(propertyPrice);
    }
  }, [propertyPrice]);

  // Derived values
  const baseDownPayment = useMemo(() => {
    return (price * downPaymentPercent) / 100;
  }, [price, downPaymentPercent]);

  const totalDownPayment = useMemo(() => {
    return baseDownPayment + (useFGTS ? fgtsAmount : 0);
  }, [baseDownPayment, useFGTS, fgtsAmount]);

  const loanAmount = useMemo(() => {
    return Math.max(0, price - totalDownPayment);
  }, [price, totalDownPayment]);

  const termMonths = useMemo(() => {
    return termYears * 12;
  }, [termYears]);

  // Calculation results
  const simulation: FinancingSimulation = useMemo(() => {
    const n = termMonths;
    const monthlyRate = annualInterestRate / 100 / 12; // Nominal monthly rate
    const P = loanAmount;

    if (P <= 0 || n <= 0) {
      return {
        propertyPrice: price,
        downPayment: totalDownPayment,
        downPaymentPercent,
        loanAmount: 0,
        termYears,
        termMonths: n,
        annualInterestRate,
        amortizationSystem,
        firstInstallment: 0,
        lastInstallment: 0,
        monthlyInstallment: 0,
        totalInterest: 0,
        totalPaid: totalDownPayment,
        minIncome: 0,
      };
    }

    if (amortizationSystem === 'SAC') {
      const amortization = P / n;
      const firstInterest = P * monthlyRate;
      const firstInstallment = amortization + firstInterest;

      const lastInterest = amortization * monthlyRate;
      const lastInstallment = amortization + lastInterest;

      const totalInterest = (n * (firstInterest + lastInterest)) / 2;
      const totalPaid = P + totalInterest;
      const minIncome = firstInstallment / 0.30; // Max 30% commitment

      return {
        propertyPrice: price,
        downPayment: totalDownPayment,
        downPaymentPercent,
        loanAmount: P,
        termYears,
        termMonths: n,
        annualInterestRate,
        amortizationSystem: 'SAC',
        firstInstallment,
        lastInstallment,
        monthlyInstallment: firstInstallment,
        totalInterest,
        totalPaid,
        minIncome,
      };
    } else {
      // PRICE table
      let monthlyInstallment = 0;
      if (monthlyRate > 0) {
        monthlyInstallment = P * ((monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1));
      } else {
        monthlyInstallment = P / n;
      }

      const totalPaid = monthlyInstallment * n;
      const totalInterest = totalPaid - P;
      const minIncome = monthlyInstallment / 0.30;

      return {
        propertyPrice: price,
        downPayment: totalDownPayment,
        downPaymentPercent,
        loanAmount: P,
        termYears,
        termMonths: n,
        annualInterestRate,
        amortizationSystem: 'PRICE',
        firstInstallment: monthlyInstallment,
        lastInstallment: monthlyInstallment,
        monthlyInstallment,
        totalInterest,
        totalPaid,
        minIncome,
      };
    }
  }, [price, totalDownPayment, downPaymentPercent, loanAmount, termMonths, termYears, annualInterestRate, amortizationSystem]);

  // Estimated Closing/Documentation Costs (ITBI + Cartório)
  const documentationCosts = useMemo(() => {
    const itbi = price * 0.025; // ~2.5% ITBI
    const registry = price * 0.01; // ~1.0% Cartório de Registro e Escritura
    return {
      itbi,
      registry,
      total: itbi + registry,
    };
  }, [price]);

  // Formatting helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCustomDownPaymentChange = (amount: number) => {
    const safeAmount = Math.max(0, Math.min(price, amount));
    const newPercent = Math.round((safeAmount / price) * 100);
    setDownPaymentPercent(newPercent);
  };

  const handleApplyToContact = () => {
    if (onApplySimulation) {
      onApplySimulation(simulation);
    }
    // Smooth scroll to contact form
    const contactSection = document.getElementById('contact-form-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getWhatsAppMessage = () => {
    const text = `Olá! Gostaria de consultar condições de financiamento para o imóvel ${propertyCode || ''} - ${propertyTitle || 'Elite Imóveis'}:
- Valor do Imóvel: ${formatCurrency(price)}
- Entrada simulada: ${formatCurrency(totalDownPayment)} (${downPaymentPercent}%)
- Financiamento: ${formatCurrency(simulation.loanAmount)} em ${termYears} anos (${termMonths} meses)
- Tabela: ${amortizationSystem} (${amortizationSystem === 'SAC' ? `1ª Parcela: ${formatCurrency(simulation.firstInstallment)}` : `Parcela Fixa: ${formatCurrency(simulation.monthlyInstallment)}`})
- Renda recomendada: ${formatCurrency(simulation.minIncome)}`;

    return encodeURIComponent(text);
  };

  const copySimulationDetails = () => {
    const summary = `Simulação de Financiamento - ${propertyTitle || 'Elite Imóveis'} (${propertyCode || 'Imóvel'})
Valor do Imóvel: ${formatCurrency(price)}
Entrada: ${formatCurrency(totalDownPayment)} (${downPaymentPercent}%)
Valor Financiado: ${formatCurrency(simulation.loanAmount)}
Prazo: ${termYears} anos (${termMonths} parcelas)
Sistema: Tabela ${amortizationSystem}
${amortizationSystem === 'SAC' ? `Primeira Parcela: ${formatCurrency(simulation.firstInstallment)}\nÚltima Parcela: ${formatCurrency(simulation.lastInstallment || 0)}` : `Parcela Mensal Fixa: ${formatCurrency(simulation.monthlyInstallment)}`}
Renda Mínima Familiar: ${formatCurrency(simulation.minIncome)}
Taxa Estimada: ${annualInterestRate}% a.a.`;

    navigator.clipboard.writeText(summary);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  return (
    <div id="financing-calculator-section" className="bg-white rounded-[40px] border border-slate-200/80 shadow-2xl p-6 sm:p-10 mb-16 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-accent font-black uppercase tracking-[0.25em] text-[10px] mb-2">
            <Calculator size={16} />
            Simulador de Crédito Imobiliário
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
            Planeje seu Financiamento
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Simule parcelas mensais, compare os sistemas SAC e PRICE e confira a renda sugerida pelos principais bancos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setAmortizationSystem('SAC')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                amortizationSystem === 'SAC'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-600 hover:text-primary'
              }`}
            >
              Tabela SAC
            </button>
            <button
              type="button"
              onClick={() => setAmortizationSystem('PRICE')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                amortizationSystem === 'PRICE'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-600 hover:text-primary'
              }`}
            >
              Tabela PRICE
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Controls Column (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Valor de Entrada */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <Wallet size={16} className="text-accent" />
                Valor da Entrada
              </label>
              <div className="flex items-center gap-1.5 font-black text-primary text-base sm:text-lg">
                <span>{formatCurrency(totalDownPayment)}</span>
                <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                  {downPaymentPercent}%
                </span>
              </div>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
            />

            {/* Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[20, 30, 40, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all ${
                    downPaymentPercent === pct
                      ? 'bg-accent text-white border-accent shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-primary'
                  }`}
                >
                  {pct}% ({formatCurrency((price * pct) / 100)})
                </button>
              ))}
            </div>

            {/* FGTS toggle */}
            <div className="pt-3">
              <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={useFGTS}
                  onChange={(e) => setUseFGTS(e.target.checked)}
                  className="w-4 h-4 rounded text-accent border-slate-300 focus:ring-accent"
                />
                <span className="flex items-center gap-1.5">
                  <PiggyBank size={15} className="text-emerald-600" />
                  Incluir saldo de FGTS na entrada
                </span>
              </label>

              <AnimatePresence>
                {useFGTS && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className="text-xs text-emerald-900 font-medium">
                        Saldo estimado disponível de FGTS:
                      </span>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-bold text-emerald-800">R$</span>
                        <input
                          type="number"
                          step={1000}
                          min={0}
                          value={fgtsAmount || ''}
                          onChange={(e) => setFgtsAmount(Math.max(0, Number(e.target.value)))}
                          placeholder="Ex: 50.000"
                          className="bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 w-full sm:w-36"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Prazo de Pagamento */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <Calendar size={16} className="text-accent" />
                Prazo do Financiamento
              </label>
              <div className="font-black text-primary text-base sm:text-lg">
                {termYears} anos <span className="text-xs text-slate-400 font-semibold">({termMonths} meses)</span>
              </div>
            </div>

            <input
              type="range"
              min={5}
              max={35}
              step={5}
              value={termYears}
              onChange={(e) => setTermYears(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
            />

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[15, 20, 25, 30, 35].map((years) => (
                <button
                  key={years}
                  type="button"
                  onClick={() => setTermYears(years)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all ${
                    termYears === years
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-primary'
                  }`}
                >
                  {years} anos
                </button>
              ))}
            </div>
          </div>

          {/* Taxa de Juros Anual */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <Percent size={16} className="text-accent" />
                Taxa de Juros Anual Estimada
              </label>
              <div className="font-black text-primary text-base sm:text-lg">
                {annualInterestRate.toFixed(1)}% <span className="text-xs text-slate-400 font-semibold">a.a.</span>
              </div>
            </div>

            <input
              type="range"
              min={8.0}
              max={13.5}
              step={0.1}
              value={annualInterestRate}
              onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
            />

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { label: 'Bonificada', rate: 9.4 },
                { label: 'Média Mercado', rate: 10.2 },
                { label: 'Taxa Balcão', rate: 11.0 }
              ].map((item) => (
                <button
                  key={item.rate}
                  type="button"
                  onClick={() => setAnnualInterestRate(item.rate)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    annualInterestRate === item.rate
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label} ({item.rate}%)
                </button>
              ))}
            </div>
          </div>

          {/* Explanation Banner SAC vs PRICE */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3 text-xs text-slate-600">
            <Info size={18} className="text-accent shrink-0 mt-0.5" />
            <div>
              {amortizationSystem === 'SAC' ? (
                <p>
                  <strong>Sistema SAC:</strong> A amortização da dívida é constante. Suas parcelas começam maiores e{' '}
                  <span className="text-primary font-bold">diminuem a cada mês</span>. É o modelo mais escolhido pelos bancos no Brasil por gerar menor custo total de juros ao final.
                </p>
              ) : (
                <p>
                  <strong>Tabela PRICE:</strong> As parcelas são{' '}
                  <span className="text-primary font-bold">fixas do início ao fim</span>. O valor inicial é menor que na SAC, facilitando a aprovação do crédito com base na renda.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Results Card Column (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-primary text-white rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

            {/* Main Installment Result */}
            <div>
              <span className="text-[10px] uppercase font-black tracking-[0.25em] text-accent block mb-1">
                {amortizationSystem === 'SAC' ? 'Primeira Parcela Estimada' : 'Parcela Mensal Fixa'}
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-2">
                {formatCurrency(simulation.firstInstallment)}
                <span className="text-xs font-normal text-slate-400">/mês</span>
              </div>

              {amortizationSystem === 'SAC' && simulation.lastInstallment && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-2">
                  <TrendingDown size={14} />
                  <span>Última parcela cai para {formatCurrency(simulation.lastInstallment)}</span>
                </div>
              )}
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Valor Financiado
                </span>
                <span className="text-sm sm:text-base font-black text-white">
                  {formatCurrency(simulation.loanAmount)}
                </span>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Renda Recomendada
                </span>
                <span className="text-sm sm:text-base font-black text-accent">
                  {formatCurrency(simulation.minIncome)}
                </span>
              </div>
            </div>

            {/* Composition breakdown bar */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Composição do Custo</span>
                <span className="text-white font-black">{formatCurrency(simulation.totalPaid + totalDownPayment)}</span>
              </div>

              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${Math.round((totalDownPayment / (simulation.totalPaid + totalDownPayment)) * 100)}%` }} 
                  className="bg-accent h-full" 
                  title={`Entrada: ${formatCurrency(totalDownPayment)}`}
                />
                <div 
                  style={{ width: `${Math.round((simulation.loanAmount / (simulation.totalPaid + totalDownPayment)) * 100)}%` }} 
                  className="bg-blue-400 h-full" 
                  title={`Financiamento: ${formatCurrency(simulation.loanAmount)}`}
                />
                <div 
                  style={{ width: `${Math.round((simulation.totalInterest / (simulation.totalPaid + totalDownPayment)) * 100)}%` }} 
                  className="bg-slate-500 h-full" 
                  title={`Juros Estimados: ${formatCurrency(simulation.totalInterest)}`}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent inline-block" /> Entrada ({formatCurrency(totalDownPayment)})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Principal ({formatCurrency(simulation.loanAmount)})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" /> Juros ({formatCurrency(simulation.totalInterest)})
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-3 space-y-3">
              <button
                type="button"
                onClick={handleApplyToContact}
                className="w-full btn-accent py-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2"
              >
                Solicitar Análise de Crédito
                <ArrowRight size={16} />
              </button>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/?text=${getWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-white/10"
                >
                  <MessageCircle size={16} className="text-emerald-400" />
                  Enviar no WhatsApp
                </a>

                <button
                  type="button"
                  onClick={copySimulationDetails}
                  className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs flex items-center justify-center transition-colors border border-white/10"
                  title="Copiar resumo da simulação"
                >
                  {copiedSuccess ? <Check size={16} className="text-emerald-400" /> : <FileText size={16} />}
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed text-center">
              * Valores referenciais baseados nas taxas atuais de mercado. Sujeito à análise cadastral e aprovação pelo agente financeiro.
            </div>
          </div>
        </div>
      </div>

      {/* Accordion: Custos Cartorários e ITBI Estimados */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowDocumentationDetails(!showDocumentationDetails)}
          className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-600 hover:text-primary transition-colors py-2"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-accent" />
            Custos de Documentação e Registro Estimados (ITBI e Cartório): 
            <span className="text-primary font-black ml-1">{formatCurrency(documentationCosts.total)}</span>
          </span>
          <span className="text-accent font-black uppercase text-[10px] tracking-widest">
            {showDocumentationDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
          </span>
        </button>

        <AnimatePresence>
          {showDocumentationDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <h4 className="font-bold text-primary mb-1">ITBI Municipal (~2.5%)</h4>
                  <p className="text-slate-500 leading-relaxed mb-2">
                    Imposto de Transmissão de Bens Imóveis pago à prefeitura da cidade onde o imóvel está localizado.
                  </p>
                  <span className="font-black text-slate-800">{formatCurrency(documentationCosts.itbi)}</span>
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1">Escritura e Registro Cartorário (~1%)</h4>
                  <p className="text-slate-500 leading-relaxed mb-2">
                    Emolumentos de registro na matrícula no Cartório de Registro de Imóveis (RGI) competente.
                  </p>
                  <span className="font-black text-slate-800">{formatCurrency(documentationCosts.registry)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
