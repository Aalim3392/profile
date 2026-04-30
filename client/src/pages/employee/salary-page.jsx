import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { api } from '@/lib/api.js';
import { formatCurrency } from '@/lib/format.js';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';

export function EmployeeSalaryPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salary, setSalary] = useState(null);

  useEffect(() => {
    const fetchSalary = async () => {
      const response = await api.get('/employee/salary', { params: { month } });
      setSalary(response.data.data);
    };

    fetchSalary();
  }, [month]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee workspace"
        title="Salary slips"
        description="Review your salary breakdown for any month and print a copy when you need one."
        actions={
          <button type="button" onClick={() => window.print()} className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">
            <span className="inline-flex items-center gap-2"><Printer className="h-4 w-4" />Print</span>
          </button>
        }
      />

      <SectionPanel title="Payslip overview" actions={<input className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />}>
        {salary ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              ['Basic', salary.basic],
              ['HRA', salary.hra],
              ['Allowances', salary.allowances],
              ['Deductions', salary.deductions],
              ['Net pay', salary.netPay],
              ['Annual CTC', salary.ctc],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[20px] border border-white/8 bg-white/5 p-5">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(value)}</p>
              </div>
            ))}
          </div>
        ) : null}
      </SectionPanel>
    </div>
  );
}
