export interface TransactionStoryContext {
  amount: number;
  currency: string;
  timestamp: string;
  channel: string;
  recipient: string;
  customerName: string;
  customerRiskTier: string;
  accountNumberMasked: string;
  deviceType?: string;
  isRooted?: boolean;
  deviceTrust?: number;
  city?: string;
  state?: string;
  isVpn?: boolean;
  factors: Array<{ factor_name: string; score_contribution: number; severity: string; details: any }>;
  riskScore: number;
  riskLevel: string;
}

export function synthesizeTransactionStory(ctx: TransactionStoryContext): string {
  const date = new Date(ctx.timestamp);
  const timeFormatted = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const inrAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(ctx.amount);

  const sentences: string[] = [];

  // Sentence 1: Transaction core action
  sentences.push(
    `A ${inrAmount} ${ctx.channel} transfer was initiated at ${timeFormatted} IST from account ${ctx.accountNumberMasked} held by ${ctx.customerName} (Risk Tier: ${ctx.customerRiskTier}) to recipient [${ctx.recipient}].`
  );

  // Sentence 2: Device & Geolocation context
  const devParts: string[] = [];
  if (ctx.deviceType) {
    devParts.push(`using an origin ${ctx.deviceType}`);
    if (ctx.isRooted) {
      devParts.push(`with rooted/compromised OS signatures (Trust Score: ${ctx.deviceTrust}/100)`);
    }
  }
  if (ctx.city) {
    devParts.push(`geolocated in ${ctx.city}, ${ctx.state}`);
  }
  if (ctx.isVpn) {
    devParts.push(`routed through an anonymizing VPN/Tor relay node`);
  }

  if (devParts.length > 0) {
    sentences.push(`The operation was dispatched ${devParts.join(' ')}.`);
  }

  // Sentence 3: Risk Evaluation & Explainability
  if (ctx.riskScore >= 70) {
    const topFactors = ctx.factors
      .slice(0, 3)
      .map(f => `${f.factor_name} (+${f.score_contribution} pts)`)
      .join(', ');

    sentences.push(
      `System flagged this transaction as ${ctx.riskLevel} (${ctx.riskScore}/100) primarily driven by: ${topFactors || 'multi-vector risk anomalies'}. Immediate manual triage recommended.`
    );
  } else if (ctx.riskScore >= 40) {
    sentences.push(
      `Transaction evaluated at Medium Risk (${ctx.riskScore}/100) with minor deviations from customer baseline behavior.`
    );
  } else {
    sentences.push(
      `Transaction conforms to historical behavioral baselines with a clean confidence rating (${ctx.riskScore}/100 - Safe).`
    );
  }

  return sentences.join(' ');
}
