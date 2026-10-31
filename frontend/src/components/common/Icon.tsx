import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  ShieldAlert,
  Briefcase,
  Network,
  SlidersHorizontal,
  UserCheck,
  Store,
  BarChart3,
  FileCheck2,
  Database,
  Terminal,
  History,
  ShieldCheck,
  Bell,
  Search,
  Filter,
  RefreshCw,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Key,
  Link as LinkIcon,
  Play,
  RotateCcw,
  Sparkles,
  FileText,
  User,
  CreditCard,
  Smartphone,
  Copy,
  Check,
  LogOut,
  Layers,
  Lock,
  Compass,
  X,
  LucideProps
} from 'lucide-react';

export type IconName =
  | 'overview'
  | 'transactions'
  | 'alerts'
  | 'cases'
  | 'graph'
  | 'rules'
  | 'customers'
  | 'merchants'
  | 'analytics'
  | 'audit'
  | 'database'
  | 'sql-lab'
  | 'scenarios';

// -------------------------------------------------------------
// BESPOKE FINGUARD AI VECTOR ICONOGRAPHY
// Custom-crafted SVG glyphs tailored specifically for FinGuard AI
// -------------------------------------------------------------

interface CustomSvgProps {
  size?: number | string;
  className?: string;
}

// 1. Overview / Radar Intelligence Core
const RadarCoreIcon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
    <circle cx="12" cy="12" r="6" strokeOpacity="0.6" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <path d="m14 10 5-5" strokeWidth="2" />
  </svg>
);

// 2. Transaction Flow Ledger
const TransactionLedgerIcon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 7h13a3 3 0 0 1 3 3v0" />
    <path d="m16 3 4 4-4 4" />
    <path d="M20 17H7a3 3 0 0 1-3-3v0" />
    <path d="m8 21-4-4 4-4" />
    <circle cx="12" cy="7" r="1" fill="currentColor" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);

// 3. Threat Alert Shield
const AlertShieldIcon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v5" strokeWidth="2.2" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" />
  </svg>
);

// 4. Forensic Case Workspace Dossier
const CaseDossierIcon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 7V4a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v3" />
    <rect x="3" y="7" width="18" height="14" rx="2" />
    <circle cx="11" cy="14" r="3" />
    <path d="m13.5 16.5 3 3" strokeWidth="2.2" />
  </svg>
);

// 5. Entity Relationship Graph
const EntityGraphIcon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="12" cy="18" r="3" />
    <path d="M8.5 7.5l7 0" strokeDasharray="2 2" />
    <path d="M7.5 8.5l3 7" />
    <path d="M16.5 8.5l-3 7" />
  </svg>
);

// 6. Risk Rule Engine & Simulator
const RuleSlidersIcon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 6h16M4 12h16M4 18h16" strokeOpacity="0.4" />
    <circle cx="8" cy="6" r="2.5" fill="currentColor" />
    <circle cx="16" cy="12" r="2.5" fill="currentColor" />
    <circle cx="10" cy="18" r="2.5" fill="currentColor" />
  </svg>
);

// 7. Customer 360 Intelligence Profile
const Customer360Icon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="8" r="3.5" />
    <path d="M6 19a6 6 0 0 1 12 0" />
    <path d="M19 4a10 10 0 0 1 3 8 10 10 0 0 1-3 8" strokeDasharray="3 3" strokeOpacity="0.7" />
    <path d="M5 4a10 10 0 0 0-3 8 10 10 0 0 0 3 8" strokeDasharray="3 3" strokeOpacity="0.7" />
  </svg>
);

// 8. Merchant Risk Counterparty
const MerchantStoreIcon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 9 2-5h14l2 5" />
    <path d="M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
    <path d="M10 13h4v4h-4z" />
    <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
  </svg>
);

// 9. Analytics & Compliance Reports
const AnalyticsChartIcon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 20h16" />
    <path d="M6 16v-4" strokeWidth="2.5" />
    <path d="M11 16V9" strokeWidth="2.5" />
    <path d="M16 16V6" strokeWidth="2.5" />
    <path d="m6 11 5-4 4 2 5-5" strokeWidth="2" strokeDasharray="1 1" />
  </svg>
);

// 10. Immutable Audit Ledger
const AuditLedgerIcon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="m9 15 2 2 4-4" strokeWidth="2.2" />
    <path d="M8 11h3" strokeOpacity="0.6" />
  </svg>
);

// 11. Database Explorer
const DatabaseExplorerIcon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
  </svg>
);

// 12. Analytical SQL Lab Terminal
const SqlTerminalIcon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="15" x="3" y="4" rx="2" />
    <path d="m7 9 3 2.5-3 2.5" strokeWidth="2.2" />
    <path d="M13 14h4" strokeWidth="2.2" />
  </svg>
);

// 13. Incident Scenario Replay
const ScenarioReplayIcon: React.FC<CustomSvgProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l3 2" strokeWidth="2" />
    <path d="m9 2-3 3 3 3" />
    <path d="M6 5h8a4 4 0 0 1 4 4" />
  </svg>
);

const customIconMap: Record<IconName, React.FC<CustomSvgProps>> = {
  overview: RadarCoreIcon,
  transactions: TransactionLedgerIcon,
  alerts: AlertShieldIcon,
  cases: CaseDossierIcon,
  graph: EntityGraphIcon,
  rules: RuleSlidersIcon,
  customers: Customer360Icon,
  merchants: MerchantStoreIcon,
  analytics: AnalyticsChartIcon,
  audit: AuditLedgerIcon,
  database: DatabaseExplorerIcon,
  'sql-lab': SqlTerminalIcon,
  scenarios: ScenarioReplayIcon,
};

interface AppIconProps {
  name: IconName;
  size?: number | string;
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 18,
  className = '',
}) => {
  const IconComponent = customIconMap[name] || RadarCoreIcon;
  return <IconComponent size={size} className={className} />;
};

// Styled Icon Badge with Amber/Gold Accent glow
interface IconBadgeProps {
  name: IconName;
  isActive?: boolean;
  size?: number;
  className?: string;
}

export const AppIconBadge: React.FC<IconBadgeProps> = ({
  name,
  isActive = false,
  size = 18,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-center transition-all ${
        isActive
          ? 'text-black'
          : 'text-amber-400 group-hover:text-amber-300'
      } ${className}`}
    >
      <AppIcon name={name} size={size} />
    </div>
  );
};

export {
  LayoutDashboard,
  ArrowLeftRight,
  ShieldAlert,
  Briefcase,
  Network,
  SlidersHorizontal,
  UserCheck,
  Store,
  BarChart3,
  FileCheck2,
  Database,
  Terminal,
  History,
  ShieldCheck,
  Bell,
  Search,
  Filter,
  RefreshCw,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Key,
  LinkIcon,
  Play,
  RotateCcw,
  Sparkles,
  FileText,
  User,
  CreditCard,
  Smartphone,
  Copy,
  Check,
  LogOut,
  Layers,
  Lock,
  Compass,
  X
};
