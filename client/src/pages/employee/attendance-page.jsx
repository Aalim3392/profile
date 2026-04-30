import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatCard } from '@/components/ui/stat-card.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

export function EmployeeAttendancePage() {
  const [data, setData] = useState({ records: [], summary: {} });

  const fetchData = async () => {
    const response = await api.get('/employee/attendance');
    setData(response.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayRecord = useMemo(() => data.records.find((record) => record.date === new Date().toISOString().slice(0, 10)), [data.records]);

  const checkIn = async () => {
    await api.post('/employee/attendance/checkin');
    toast.success('Check-in recorded.');
    fetchData();
  };

  const checkOut = async () => {
    await api.post('/employee/attendance/checkout');
    toast.success('Check-out recorded.');
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee workspace"
        title="My attendance"
        description="Mark your day, review recent records, and track your attendance percentage."
        actions={
          <>
            <button type="button" onClick={checkIn} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
              Check in
            </button>
            <button type="button" onClick={checkOut} className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">
              Check out
            </button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present days" value={data.summary.present || 0} />
        <StatCard label="Absent days" value={data.summary.absent || 0} />
        <StatCard label="Leave days" value={data.summary.leave || 0} />
        <StatCard label="Attendance %" value={`${data.summary.percentage || 0}%`} />
      </div>

      <SectionPanel title="Today">
        {todayRecord ? (
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge value={todayRecord.status} />
            <p className="text-sm text-slate-300">Check-in: {todayRecord.check_in?.slice(11, 16) || '--:--'}</p>
            <p className="text-sm text-slate-300">Check-out: {todayRecord.check_out?.slice(11, 16) || '--:--'}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No attendance record for today yet.</p>
        )}
      </SectionPanel>

      <SectionPanel title="Monthly calendar view">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
          {data.records.slice(0, 30).map((record) => (
            <div key={record.id} className="rounded-[18px] border border-white/8 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatDate(record.date, 'dd MMM')}</p>
              <div className="mt-3"><StatusBadge value={record.status} /></div>
            </div>
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}
