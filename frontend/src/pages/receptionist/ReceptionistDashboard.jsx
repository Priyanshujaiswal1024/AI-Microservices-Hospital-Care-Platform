import React, { useState } from 'react';
import { UserPlus, Ticket, Clock, CheckCircle, Search, UserCheck } from 'lucide-react';
import EcgPulseMeter from '../../components/ui/EcgPulseMeter';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import StatusPill from '../../components/ui/StatusPill';
import DataTable from '../../components/ui/DataTable';

export default function ReceptionistDashboard() {
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [currentToken, setCurrentToken] = useState(14);

  const [queueList, setQueueList] = useState([
    { token: 'T-12', name: 'Vikas Sharma', age: 34, gender: 'Male', doctor: 'Dr. Anjali Rajan', dept: 'Cardiology', status: 'IN_CONSULTATION' },
    { token: 'T-13', name: 'Sunita Menon', age: 48, gender: 'Female', doctor: 'Dr. Amit Verma', dept: 'Neurology', status: 'WAITING' },
    { token: 'T-14', name: 'Karan Malhotra', age: 29, gender: 'Male', doctor: 'Dr. Neha Sharma', dept: 'Pediatrics', status: 'WAITING' },
    { token: 'T-15', name: 'Meena Kumari', age: 52, gender: 'Female', doctor: 'Dr. Anjali Rajan', dept: 'Cardiology', status: 'SCHEDULED' },
  ]);

  const [regForm, setRegForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    doctor: 'Dr. Anjali Rajan',
    dept: 'Cardiology',
    contact: '',
  });

  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!regForm.name) return;
    const newTokenNum = currentToken + 1;
    setCurrentToken(newTokenNum);
    const newEntry = {
      token: `T-${newTokenNum}`,
      name: regForm.name,
      age: regForm.age || 30,
      gender: regForm.gender,
      doctor: regForm.doctor,
      dept: regForm.dept,
      status: 'WAITING',
    };
    setQueueList([...queueList, newEntry]);
    setIsRegModalOpen(false);
    setRegForm({ name: '', age: '', gender: 'Male', doctor: 'Dr. Anjali Rajan', dept: 'Cardiology', contact: '' });
  };

  const handleCallToken = (token) => {
    setQueueList(queueList.map(q => q.token === token ? { ...q, status: 'IN_CONSULTATION' } : q));
  };

  const columns = [
    { header: 'Token No.', key: 'token', sortable: true, render: (val) => <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">{val}</span> },
    { header: 'Patient Name', key: 'name', sortable: true, render: (val, row) => <div><div className="font-semibold text-slate-800">{val}</div><div className="text-[11px] text-slate-400">{row.gender}, {row.age} yrs</div></div> },
    { header: 'Department', key: 'dept', sortable: true },
    { header: 'Doctor Specialist', key: 'doctor', sortable: true },
    { header: 'Status', key: 'status', render: (val) => <StatusPill status={val} /> },
    {
      header: 'Queue Action',
      key: 'token',
      render: (val, row) => (
        row.status === 'WAITING' ? (
          <button
            onClick={() => handleCallToken(val)}
            className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5" /> Call Token
          </button>
        ) : row.status === 'IN_CONSULTATION' ? (
          <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" /> In Room
          </span>
        ) : (
          <span className="text-xs text-slate-400">Done</span>
        )
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#12302E] font-display">Front Desk & Reception Desk</h1>
          <p className="text-xs text-slate-500 mt-1">Walk-in patient intake, token distribution & active queue management</p>
        </div>

        <button
          onClick={() => setIsRegModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C8862B] hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:-translate-y-px"
        >
          <UserPlus className="w-4 h-4" /> Quick Patient Registration
        </button>
      </div>

      {/* Grid: ECG Vitals & Queue Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <EcgPulseMeter bpm={78} spo2={99} bp="118/76" />
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase font-mono">Current Token</span>
              <Ticket className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-4">
              <div className="font-mono text-3xl font-bold text-slate-900">T-{currentToken}</div>
              <p className="text-xs text-slate-400 mt-1">Active front-desk token counter</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase font-mono">Patients Waiting</span>
              <Clock className="w-5 h-5 text-teal-600" />
            </div>
            <div className="mt-4">
              <div className="font-mono text-3xl font-bold text-teal-700">
                {queueList.filter(q => q.status === 'WAITING').length}
              </div>
              <p className="text-xs text-slate-400 mt-1">In waiting lobby</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase font-mono">In Consultation</span>
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-4">
              <div className="font-mono text-3xl font-bold text-emerald-600">
                {queueList.filter(q => q.status === 'IN_CONSULTATION').length}
              </div>
              <p className="text-xs text-slate-400 mt-1">Inside doctor cabin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Patients Queue Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">Live Front-Desk Patient Queue</h2>
        <DataTable
          columns={columns}
          data={queueList}
          searchPlaceholder="Search token, patient or doctor..."
        />
      </div>

      {/* Patient Intake Registration Modal */}
      <Modal isOpen={isRegModalOpen} onClose={() => setIsRegModalOpen(false)} title="Fast Patient Registration">
        <form onSubmit={handleRegisterPatient} className="space-y-4">
          <FormField label="Full Name" required>
            <input
              type="text"
              required
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              placeholder="e.g. Ramesh Verma"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Age">
              <input
                type="number"
                value={regForm.age}
                onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                placeholder="e.g. 35"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </FormField>
            <FormField label="Gender">
              <select
                value={regForm.gender}
                onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department">
              <select
                value={regForm.dept}
                onChange={(e) => setRegForm({ ...regForm, dept: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
              </select>
            </FormField>
            <FormField label="Assigned Doctor">
              <select
                value={regForm.doctor}
                onChange={(e) => setRegForm({ ...regForm, doctor: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Dr. Anjali Rajan">Dr. Anjali Rajan</option>
                <option value="Dr. Amit Verma">Dr. Amit Verma</option>
                <option value="Dr. Neha Sharma">Dr. Neha Sharma</option>
              </select>
            </FormField>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRegModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#C8862B] text-white hover:bg-amber-600 shadow-sm"
            >
              Generate Queue Token
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
