import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Currency } from '../components/common/Currency';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { User, Smartphone, CreditCard, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface Customer360Props {
  onSelectTransaction: (txnId: string) => void;
}

export const Customer360: React.FC<Customer360Props> = ({ onSelectTransaction }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.listCustomers().then((res) => {
      setCustomers(res.customers);
      if (res.customers.length > 0) {
        setSelectedCustomerId(res.customers[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      setIsLoading(true);
      api.getCustomer360(selectedCustomerId)
        .then((res) => setCustomerDetail(res))
        .finally(() => setIsLoading(false));
    }
  }, [selectedCustomerId]);

  const cust = customerDetail?.customer;

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-veyra-800 pb-3 flex-shrink-0">
        <div>
          <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
            CUSTOMER 360 // BEHAVIORAL RISK PROFILER
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic identity resolution, multi-account velocity tracking, and hardware binding history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* CUSTOMER DIRECTORY (4 COLS) */}
        <div className="lg:col-span-4 bg-veyra-900 border border-veyra-800/80 rounded flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-veyra-800 bg-veyra-850/60 font-mono text-2xs font-bold text-slate-300 uppercase">
            VERIFIED CUSTOMERS ({customers.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-veyra-800/60">
            {customers.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCustomerId(c.id)}
                className={`w-full p-3 text-left transition-colors flex items-center justify-between ${
                  selectedCustomerId === c.id
                    ? 'bg-blue-600/15 border-l-2 border-l-blue-500'
                    : 'hover:bg-veyra-850/60'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-100">
                    {c.first_name} {c.last_name}
                  </div>
                  <div className="text-2xs font-mono text-slate-500 mt-0.5">
                    {c.customer_code} · {c.phone_masked}
                  </div>
                </div>
                <RiskBadge level={c.risk_tier} size="sm" />
              </button>
            ))}
          </div>
        </div>

        {/* CUSTOMER DETAIL VIEW (8 COLS) */}
        <div className="lg:col-span-8 space-y-4 overflow-y-auto min-h-0">
          {cust && (
            <>
              {/* PROFILE SUMMARY */}
              <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3 font-mono text-2xs">
                <div className="flex items-center justify-between border-b border-veyra-800 pb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-slate-100 uppercase">
                      {cust.first_name} {cust.last_name}
                    </span>
                  </div>
                  <RiskBadge level={cust.risk_tier} size="sm" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-400">
                  <div>
                    <span className="text-slate-500 block">PAN NUMBER</span>
                    <span className="text-slate-200 font-bold">{cust.pan_masked}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">KYC STATUS</span>
                    <span className="text-emerald-400 font-bold">{cust.kyc_status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">PHONE</span>
                    <span className="text-slate-200">{cust.phone_masked}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">EMAIL</span>
                    <span className="text-slate-200 truncate">{cust.email}</span>
                  </div>
                </div>
              </div>

              {/* ACCOUNTS & DEVICES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ACCOUNTS */}
                <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-slate-200 uppercase">
                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                    <span>LINKED ACCOUNTS ({customerDetail?.accounts?.length || 0})</span>
                  </div>

                  <div className="space-y-2 font-mono text-2xs">
                    {customerDetail?.accounts?.map((a: any) => (
                      <div key={a.id} className="p-2.5 rounded bg-veyra-950 border border-veyra-800 flex justify-between items-center">
                        <div>
                          <div className="text-slate-200 font-bold">{a.account_number_masked}</div>
                          <div className="text-slate-500">{a.account_type}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-100 font-bold"><Currency amount={a.balance} /></div>
                          <StatusBadge status={a.status} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DEVICES */}
                <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-slate-200 uppercase">
                    <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                    <span>REGISTERED DEVICES ({customerDetail?.devices?.length || 0})</span>
                  </div>

                  <div className="space-y-2 font-mono text-2xs">
                    {customerDetail?.devices?.map((d: any) => (
                      <div key={d.id} className="p-2.5 rounded bg-veyra-950 border border-veyra-800 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-200 font-bold">{d.device_type}</span>
                          <span className={d.trust_score < 50 ? 'text-red-400' : 'text-emerald-400'}>
                            Trust: {d.trust_score}/100
                          </span>
                        </div>
                        <div className="text-slate-500 truncate">FP: {d.device_fingerprint}</div>
                        {d.is_rooted_or_jailbroken && (
                          <span className="text-3xs text-red-400 bg-red-950/60 px-1 rounded border border-red-800">
                            ROOTED / MODIFIED OS
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RECENT TRANSACTIONS */}
              <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-3">
                <span className="text-xs font-bold font-mono text-slate-200 uppercase">
                  RECENT ACTIVITY TIMELINE
                </span>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-veyra-800 text-slate-500 font-mono text-2xs uppercase">
                        <th className="py-2 px-2">REFERENCE</th>
                        <th className="py-2 px-2">TIMESTAMP</th>
                        <th className="py-2 px-2">RECIPIENT</th>
                        <th className="py-2 px-2 text-right">AMOUNT</th>
                        <th className="py-2 px-2">RISK</th>
                        <th className="py-2 px-2">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-veyra-800/40 font-mono text-2xs">
                      {customerDetail?.recentTransactions?.map((rt: any) => (
                        <tr
                          key={rt.id}
                          onClick={() => onSelectTransaction(rt.id)}
                          className="hover:bg-veyra-850/60 cursor-pointer text-slate-300 transition-colors"
                        >
                          <td className="py-2 px-2 text-blue-400">{rt.txn_reference}</td>
                          <td className="py-2 px-2 text-slate-500">{new Date(rt.timestamp).toLocaleTimeString('en-IN')}</td>
                          <td className="py-2 px-2 truncate max-w-[140px]">{rt.recipient_identifier}</td>
                          <td className="py-2 px-2 text-right font-medium text-slate-100">
                            <Currency amount={rt.amount} />
                          </td>
                          <td className="py-2 px-2">
                            <RiskBadge level={rt.risk_level || 'SAFE'} score={rt.risk_score} showScore size="sm" />
                          </td>
                          <td className="py-2 px-2">
                            <StatusBadge status={rt.status} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
