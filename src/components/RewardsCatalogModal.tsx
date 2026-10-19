'use client';

import React, { useState } from 'react';
import { User } from '@/lib/types';
import {
  Reward,
  ULTRACEM_REWARDS,
  canRedeemReward,
  generateRedemptionCode,
  RedeemedRewardReceipt,
} from '@/lib/gamification';
import {
  X,
  Trophy,
  Gift,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Info,
} from 'lucide-react';

export interface RewardsCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onRedeemReward?: (reward: Reward, receipt: RedeemedRewardReceipt) => void;
}

export const RewardsCatalogModal: React.FC<RewardsCatalogModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRedeemReward,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedRewardToRedeem, setSelectedRewardToRedeem] = useState<Reward | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<RedeemedRewardReceipt | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  if (!isOpen) return null;

  const categories = [
    'Todas',
    'Dotación & Seguridad',
    'Herramientas de Precisión',
    'Bienestar Familiar',
    'Experiencias & Convención',
  ];

  const filteredRewards =
    selectedCategory === 'Todas'
      ? ULTRACEM_REWARDS
      : ULTRACEM_REWARDS.filter((r) => r.category === selectedCategory);

  const handleConfirmRedeem = () => {
    if (!selectedRewardToRedeem) return;
    if (!canRedeemReward(currentUser.ultra_points, selectedRewardToRedeem.pointsRequired)) return;

    setIsRedeeming(true);

    setTimeout(() => {
      const code = generateRedemptionCode();
      const receipt: RedeemedRewardReceipt = {
        redemptionCode: code,
        rewardId: selectedRewardToRedeem.id,
        rewardTitle: selectedRewardToRedeem.title,
        userId: currentUser.id,
        userName: currentUser.name,
        pointsDeducted: selectedRewardToRedeem.pointsRequired,
        remainingPoints: currentUser.ultra_points - selectedRewardToRedeem.pointsRequired,
        redeemedAt: new Date().toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      if (onRedeemReward) {
        onRedeemReward(selectedRewardToRedeem, receipt);
      }

      setIsRedeeming(false);
      setActiveReceipt(receipt);
      setSelectedRewardToRedeem(null);
    }, 400);
  };

  const handleCopyCode = () => {
    if (activeReceipt) {
      navigator.clipboard.writeText(activeReceipt.redemptionCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#E0E6ED] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rewards-modal-title"
      >
        {/* ===================================================================== */}
        {/* HEADER CORPORATIVO ULTRACEM (#003E78) */}
        {/* ===================================================================== */}
        <div className="bg-[#003E78] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm border-b border-[#002B54]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[5px] bg-white/10 flex items-center justify-center border border-white/20">
              <Gift className="w-5 h-5 text-[#FFCA00]" />
            </div>
            <div>
              <h2 id="rewards-modal-title" className="font-bold text-base sm:text-lg tracking-wide text-white">
                Catálogo Oficial de Incentivos y Recompensas
              </h2>
              <p className="text-xs text-blue-200">
                Programa de Reconocimiento Comercial · Ultracem S.A.S.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User points balance pill */}
            <div className="hidden sm:flex items-center gap-2 bg-[#002B54] border border-[#FFCA00] px-3.5 py-1.5 rounded-[5px]">
              <Trophy className="w-4 h-4 text-[#FFCA00]" />
              <div className="text-right">
                <p className="text-[10px] text-blue-200 uppercase font-semibold leading-none">Tu Saldo</p>
                <p className="text-[#FFCA00] font-bold text-xs sm:text-sm leading-tight">
                  {currentUser.ultra_points.toLocaleString()} pts
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveReceipt(null);
                setSelectedRewardToRedeem(null);
                onClose();
              }}
              className="text-white/80 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Cerrar catálogo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* BODY (SCROLLABLE) */}
        {/* ===================================================================== */}
        <div className="p-5 overflow-y-auto space-y-6 text-slate-700">
          {/* RECEIPT VIEW (VOUCHER DE REDENCIÓN) */}
          {activeReceipt ? (
            <div className="max-w-xl mx-auto py-4 space-y-5 animate-in fade-in-50 duration-200">
              <div className="p-6 bg-gradient-to-br from-emerald-50 via-white to-blue-50/40 rounded-xl border-2 border-[#38A169] shadow-sm text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#38A169] flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="inline-block px-3 py-0.5 rounded-[5px] bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider mb-1">
                    Redención Aprobada y Confirmada
                  </span>
                  <h3 className="text-lg font-bold text-[#003E78]">¡Felicitaciones, {activeReceipt.userName}!</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Has canjeado exitosamente: <strong>{activeReceipt.rewardTitle}</strong>
                  </p>
                </div>

                {/* Voucher Code Box */}
                <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Código de Redención Corporativo
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-xl sm:text-2xl font-black text-[#003E78] tracking-widest">
                      {activeReceipt.redemptionCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-[5px] border border-slate-300 hover:border-[#1E83EC] text-slate-600 hover:text-[#1E83EC] transition-colors"
                      title="Copiar código"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {isCopied && (
                    <p className="text-[11px] text-emerald-600 font-semibold">¡Código copiado al portapapeles!</p>
                  )}
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-2 gap-3 text-left text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Puntos Deducidos</span>
                    <p className="font-bold text-[#003E78]">-{activeReceipt.pointsDeducted.toLocaleString()} pts</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Nuevo Saldo Disponible</span>
                    <p className="font-bold text-[#38A169]">{activeReceipt.remainingPoints.toLocaleString()} pts</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Fecha y Hora</span>
                    <p className="font-medium text-slate-700">{activeReceipt.redeemedAt}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-left p-3 rounded-[5px] bg-blue-50/70 border border-blue-200 text-xs text-slate-600">
                  <Info className="w-4 h-4 text-[#1E83EC] shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Presenta este código al supervisor de zona o en la Dirección Comercial de Ultracem. El bono o dotación física será coordinado en tu próxima visita al centro de distribución regional.
                  </p>
                </div>

                <button
                  onClick={() => setActiveReceipt(null)}
                  className="w-full py-2.5 rounded-[5px] bg-[#003E78] hover:bg-[#002B54] text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Volver al Catálogo de Recompensas
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TOP USER BALANCE CARD (MOBILE & DESKTOP) */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#003E78] to-[#1E83EC] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[5px] bg-[#FFCA00] text-[#003E78] font-black text-[10px] uppercase tracking-wider">
                      Fuerza Comercial Ultracem
                    </span>
                    <span className="text-xs text-blue-200">Zona {currentUser.zone}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">{currentUser.name}</h3>
                  <p className="text-xs text-blue-100 max-w-lg">
                    Acumula Puntos Ultra con cada despacho verificado (+125 pts) y aprovecha el <strong>Bono 2X (+250 pts)</strong> reactivando clientes inactivos.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3.5 rounded-lg flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
                  <div className="w-10 h-10 rounded-[5px] bg-[#FFCA00] flex items-center justify-center text-[#003E78] font-bold">
                    <Trophy className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-200 uppercase font-semibold">Saldo Disponible</p>
                    <p className="text-xl sm:text-2xl font-black text-[#FFCA00] tracking-wide">
                      {currentUser.ultra_points.toLocaleString()} <span className="text-xs font-semibold text-white">pts</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* RECTANGULAR CATEGORY FILTER PILLS (rounded-[5px]) */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#003E78] uppercase tracking-wider">
                  Filtrar por Categoría:
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-[5px] transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#003E78] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* REWARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRewards.map((reward) => {
                  const hasEnough = canRedeemReward(currentUser.ultra_points, reward.pointsRequired);
                  const progressPct = Math.min(
                    100,
                    Math.round((currentUser.ultra_points / reward.pointsRequired) * 100)
                  );
                  const missingPoints = Math.max(0, reward.pointsRequired - currentUser.ultra_points);

                  return (
                    <div
                      key={reward.id}
                      className={`card-ultracem overflow-hidden border flex flex-col justify-between transition-all hover:shadow-md ${
                        hasEnough ? 'border-[#38A169]/50 bg-white' : 'border-[#E0E6ED] bg-white'
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="px-2 py-0.5 rounded-[5px] bg-blue-50 text-[#003E78] text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                            {reward.category}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[5px] bg-[#003E78] text-[#FFCA00] text-xs font-black tracking-wide shadow-2xs">
                            <Trophy className="w-3.5 h-3.5 text-[#FFCA00]" />
                            {reward.pointsRequired.toLocaleString()} pts
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-[#003E78] leading-snug">
                            {reward.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {reward.description}
                          </p>
                        </div>

                        {/* Specifications list */}
                        <div className="bg-slate-50 p-2.5 rounded-[5px] border border-slate-200/80 space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Incluye en la entrega:
                          </p>
                          <ul className="space-y-1">
                            {reward.specifications.map((spec, i) => (
                              <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#38A169] shrink-0 mt-0.5" />
                                <span>{spec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Card Footer: Progress & CTA */}
                      <div className="p-4 bg-slate-50/80 border-t border-[#E0E6ED] space-y-2.5">
                        {/* Progress Towards Goal */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Progreso acumulado:</span>
                            <span className="font-bold text-[#003E78]">
                              {currentUser.ultra_points.toLocaleString()} / {reward.pointsRequired.toLocaleString()} pts ({progressPct}%)
                            </span>
                          </div>
                          <div className="w-full bg-[#E0E6ED] h-2 rounded-[5px] overflow-hidden">
                            <div
                              className={`h-full rounded-[5px] transition-all duration-300 ${
                                hasEnough ? 'bg-[#38A169]' : 'bg-[#1E83EC]'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        {hasEnough ? (
                          <button
                            onClick={() => setSelectedRewardToRedeem(reward)}
                            className="w-full py-2.5 rounded-[5px] bg-[#38A169] hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-[#FFCA00]" />
                            <span>Canjear Recompensa Ahora</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-[5px] bg-slate-200 text-slate-500 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                          >
                            <span>Te faltan {missingPoints.toLocaleString()} pts para canjear</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* CONFIRMATION OVERLAY MODAL */}
          {selectedRewardToRedeem && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E0E6ED] animate-in zoom-in-95 duration-150">
                <div className="w-12 h-12 rounded-[5px] bg-blue-50 text-[#003E78] flex items-center justify-center mx-auto border border-blue-200">
                  <Gift className="w-6 h-6 text-[#1E83EC]" />
                </div>

                <div className="text-center space-y-1">
                  <h4 className="text-base font-bold text-[#003E78]">¿Confirmar canje de incentivo?</h4>
                  <p className="text-xs text-slate-600">
                    Estás a punto de redimir <strong>{selectedRewardToRedeem.title}</strong> por{' '}
                    <strong className="text-[#003E78]">{selectedRewardToRedeem.pointsRequired.toLocaleString()} Puntos Ultra</strong>.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-[5px] border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saldo actual:</span>
                    <span className="font-semibold">{currentUser.ultra_points.toLocaleString()} pts</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Costo de recompensa:</span>
                    <span className="font-semibold">-{selectedRewardToRedeem.pointsRequired.toLocaleString()} pts</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-[#003E78]">
                    <span>Saldo restante:</span>
                    <span>{(currentUser.ultra_points - selectedRewardToRedeem.pointsRequired).toLocaleString()} pts</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedRewardToRedeem(null)}
                    disabled={isRedeeming}
                    className="flex-1 py-2.5 rounded-[5px] border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmRedeem}
                    disabled={isRedeeming}
                    className="flex-1 py-2.5 rounded-[5px] bg-[#003E78] hover:bg-[#002B54] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isRedeeming ? (
                      <span>Generando cupón...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#FFCA00]" />
                        <span>Sí, Canjear</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* FOOTER */}
        {/* ===================================================================== */}
        <div className="p-3.5 bg-slate-50 border-t border-[#E0E6ED] flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">
            Incentivos corporativos válidos para la fuerza de ventas activa de Ultracem S.A.S.
          </span>
          <button
            onClick={() => {
              setActiveReceipt(null);
              setSelectedRewardToRedeem(null);
              onClose();
            }}
            className="px-4 py-1.5 rounded-[5px] border border-slate-300 bg-white hover:bg-slate-100 font-semibold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
