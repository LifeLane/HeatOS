import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
  Lock,
  Layers,
  ArrowRight,
  X,
  Flame,
  Clock,
} from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import SecondaryButton from '../ui/SecondaryButton';
import PrimaryButton from '../ui/PrimaryButton';

export const SubscriptionModal: React.FC = () => {
  const { isSubscriptionModalOpen, setIsSubscriptionModalOpen, plans, currentTier } = useSubscription();

  if (!isSubscriptionModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                HeatOS Subscription &amp; Plans
              </h2>
              <p className="text-xs text-slate-500">
                Transparent access to the living environment operating system.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSubscriptionModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Plans Grid */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900">Personal Plan is completely Free: </span>
              All current FortyGuard thermal intelligence, Living Environment Maps, 24-hour predictive forecasts, rule-based alerts, and AI Analyst capabilities are fully unlocked for all users.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentTier;
              const isComingSoon = plan.status === 'coming_soon';

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-5 flex flex-col justify-between border transition-all ${
                    isCurrent
                      ? 'bg-white border-[#2563EB] shadow-md ring-2 ring-[#2563EB]/10'
                      : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Title and Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">
                          {plan.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {plan.tagline}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${plan.badgeColor}`}
                      >
                        {plan.badge}
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 pb-1 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black font-mono text-slate-900">
                          {plan.price}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          / {plan.billingPeriod}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Included Capabilities:
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                                isCurrent ? 'text-[#2563EB]' : 'text-slate-400'
                              }`}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Plan CTA button */}
                  <div className="pt-6 mt-4 border-t border-slate-100">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#2563EB] cursor-default flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Current Active Plan</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-500 cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Coming Soon</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>HeatOS Living Environment OS • v1.4.0</span>
          <SecondaryButton size="sm" onClick={() => setIsSubscriptionModalOpen(false)}>
            Close
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
