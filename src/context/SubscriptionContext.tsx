import React, { createContext, useContext, useState } from 'react';

export type SubscriptionTier = 'personal' | 'commercial' | 'ultimate';

export interface PlanFeature {
  name: string;
  included: boolean;
  note?: string;
}

export interface PlanTierConfig {
  id: SubscriptionTier;
  name: string;
  badge: string;
  badgeColor: string;
  status: 'active' | 'coming_soon';
  tagline: string;
  description: string;
  price: string;
  billingPeriod: string;
  ctaText: string;
  isCurrent: boolean;
  features: string[];
}

export const SUBSCRIPTION_PLANS: PlanTierConfig[] = [
  {
    id: 'personal',
    name: 'Personal',
    badge: 'FREE PLAN',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    status: 'active',
    tagline: 'Individual Environmental Awareness',
    description: 'Complete real-time access to FortyGuard thermal mesh, open data fabric, weather conditions, forecasts, living map, and AI analyst.',
    price: '$0',
    billingPeriod: 'Forever Free',
    ctaText: 'Current Plan',
    isCurrent: true,
    features: [
      'Full FortyGuard spatial thermal intelligence (1m–10m resolution)',
      'Living Environment Map with 6 multi-source overlay layers',
      'Continuous 24-hour diurnal trajectory & 5-day predictive forecasts',
      'Deterministic rule-based alert stream & incident detail evidence',
      'Nature Analyst AI grounded environmental intelligence',
      'Multi-source Open Data Fabric (NOAA, EPA, Copernicus, NASA, USGS)',
      'Dynamic multi-city microclimate switching & custom watchlists',
    ],
  },
  {
    id: 'commercial',
    name: 'Commercial',
    badge: 'COMING SOON',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    status: 'coming_soon',
    tagline: 'For Teams, Operations & Municipalities',
    description: 'Multi-site portfolio monitoring, custom SMS/webhook threshold alerting, team collaboration workspaces, and automated environmental compliance reports.',
    price: 'Custom',
    billingPeriod: 'Enterprise Billing',
    ctaText: 'Coming Soon',
    isCurrent: false,
    features: [
      'Multi-site automated portfolio monitoring & campus clusters',
      'Custom SMS, email, and Webhook threshold escalation triggers',
      'Automated Executive Environmental Briefs & PDF compliance exports',
      'Operational playbooks for worker safety and thermal asset dispatch',
      'Dedicated FortyGuard API keys & priority data mesh throughput',
      'Team permission hierarchies (Viewer, Analyst, Incident Manager)',
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    badge: 'COMING SOON',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    status: 'coming_soon',
    tagline: 'Autonomous Environmental Orchestration',
    description: 'Advanced autonomous AI workflows, automated cooling infrastructure dispatch, predictive biophysical risk modeling, and private edge sensor mesh deployments.',
    price: 'Custom',
    billingPeriod: 'Tailored SLA',
    ctaText: 'Coming Soon',
    isCurrent: false,
    features: [
      'Autonomous cooling infrastructure and misting array dispatch',
      'Predictive biophysical CFD heat transport simulations',
      'Dedicated private on-premise sensor mesh integration',
      'Custom fine-tuned microclimate Gemini AI models',
      'Sub-meter urban canopy LiDAR micro-shading analysis',
      '24/7 dedicated climatologist support & custom SLA guarantee',
    ],
  },
];

interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  plans: PlanTierConfig[];
  isSubscriptionModalOpen: boolean;
  setIsSubscriptionModalOpen: (open: boolean) => void;
  openSubscriptionModal: (tierHint?: SubscriptionTier) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTier] = useState<SubscriptionTier>('personal');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);

  const openSubscriptionModal = () => {
    setIsSubscriptionModalOpen(true);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        currentTier,
        plans: SUBSCRIPTION_PLANS,
        isSubscriptionModalOpen,
        setIsSubscriptionModalOpen,
        openSubscriptionModal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
