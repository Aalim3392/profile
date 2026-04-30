import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarDays, Clock3, UserRoundCheck, UserX } from 'lucide-react';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { EmptyState } from '@/components/ui/empty-state.jsx';
import { Field } from '@/components/ui/field.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatCard } from '@/components/ui/stat-card.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

const inputClass = 'h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-indigo-400';

export function AdminAttendancePage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({ summary: {}, records: [] });
  const [filters, setFilters] = useState({ employeeId: '', month: currentMonth });
  const [manual, setManual] = useState({ user_id: '', date: new Date().toISOString().slice(0, 10), status: 'present', check_in: '', check_out: '' });

  const fetchEmployees = async () => {
    const response = await api.get('/admin/employees');
    setEmployees(response.data.data);
  };

  const fetchAttendance = async () => {
    const response = await api.get('/admin/attendance', { params: { employeeId: filters.employeeId, month: filters.month } });
    setAttendance(response.data.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [filters.employeeId, filters.month]);

  const calendarDays = useMemo(() => attendance.records.slice(0, 31).reverse(), [attendance.records]);

  const submitManual = async (event) => {
    event.preventDefault();
    await api.post('/admin/attendance', manual);
    toast.success('Attendance updated.');
    fetchAttendance();
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin workspace" title="Attendance tracking" description="Review attendance records, monitor today’s summary, and mark manual updates." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UserRoundCheck} label="Present today" value={attendance.summary.presentToday || 0} />
        <StatCard icon={UserX} label="Absent today" value={attendance.summary.absentToday || 0} />
        <StatCard icon={CalendarDays} label="On leave" value={attendance.summary.onLeave || 0} />
        <StatCard icon={Clock3} label="Half day" value={attendance.summary.halfDay || 0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.9fr]">
        <SectionPanel
          title="Attendance register"
          actions={
            <>
              <select className={inputClass} value={filters.employeeId} onChange={(e) => setFilters((current) => ({ ...current, employeeId: e.target.value }))}>
                <option value="">All employees</option>
                {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
              </select>
              <input className={inputClass} type="month" value={filters.month} onChange={(e) => setFilters((current) => ({ ...current, month: e.target.value }))} />
            </>
          }
        >
          {attendance.records.length ? (
            <div className="space-y-3">
              {attendance.records.map((record) => (
                <div key={record.id} className="grid gap-3 rounded-[20px] border border-white/8 bg-white/5 p-4 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.7fr] md:items-center">
                  <div>
                    <p className="font-medium text-white">{record.name}</p>
                    <p className="text-sm text-slate-400">{record.department}</p>
                  </div>
                  <p className="text-sm text-slate-300">{formatDate(record.date)}</p>
                  <p className="text-sm text-slate-400">{record.check_in ? `${record.check_in.slice(11, 16)} - ${record.check_out?.slice(11, 16) || '--:--'}` : 'No punches'}</p>
                  <StatusBadge value={record.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No attendance records" description="Pick another employee or month to inspect the register." />
          )}
        </SectionPanel>

        <div className="space-y-4">
          <SectionPanel title="Mini calendar" description="Recent status trail for the selected records.">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {calendarDays.map((record) => (
                <div key={record.id} className="rounded-[18px] border border-white/8 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatDate(record.date, 'dd MMM')}</p>
                  <div className="mt-3"><StatusBadge value={record.status} /></div>
                </div>
              ))}
            </div>
          </SectionPanel>

          <SectionPanel title="Manual mark attendance">
            <form className="space-y-4" onSubmit={submitManual}>
              <Field label="Employee">
                <select className={inputClass} value={manual.user_id} onChange={(e) => setManual((current) => ({ ...current, user_id: e.target.value }))}>
                  <option value="">Select employee</option>
                  {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                </select>
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Date"><input className={inputClass} type="date" value={manual.date} onChange={(e) => setManual((current) => ({ ...current, date: e.target.value }))} /></Field>
                <Field label="Status">
                  <select className={inputClass} value={manual.status} onChange={(e) => setManual((current) => ({ ...current, status: e.target.value }))}>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="half-day">Half day</option>
                    <option value="leave">Leave</option>
                  </select>
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Check-in"><input className={inputClass} type="datetime-local" value={manual.check_in} onChange={(e) => setManual((current) => ({ ...current, check_in: e.target.value }))} /></Field>
                <Field label="Check-out"><input className={inputClass} type="datetime-local" value={manual.check_out} onChange={(e) => setManual((current) => ({ ...current, check_out: e.target.value }))} /></Field>
              </div>
              <button type="submit" className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">Save attendance</button>
            </form>
          </SectionPanel>
        </div>
      </div>
    </div>
  );
}
