import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Plus, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import FormField from '../ui/FormField';
import StatusPill from '../ui/StatusPill';

export default function AppointmentCalendar() {
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [appointments, setAppointments] = useState([
    { id: 'APT-101', patient: 'Rahul Sharma', doctor: 'Dr. Anjali Rajan', time: '09:00 AM', date: '2026-08-02', status: 'CONFIRMED', dept: 'Cardiology' },
    { id: 'APT-102', patient: 'Priya Patel', doctor: 'Dr. Amit Verma', time: '10:30 AM', date: '2026-08-02', status: 'WAITING', dept: 'Neurology' },
    { id: 'APT-103', patient: 'Suresh Kumar', doctor: 'Dr. Neha Sharma', time: '02:00 PM', date: '2026-08-02', status: 'SCHEDULED', dept: 'Pediatrics' },
    { id: 'APT-104', patient: 'Ananya Roy', doctor: 'Dr. Anjali Rajan', time: '04:15 PM', date: '2026-08-03', status: 'CONFIRMED', dept: 'Cardiology' },
  ]);

  const [formData, setFormData] = useState({
    patient: '',
    doctor: 'Dr. Anjali Rajan',
    time: '11:00 AM',
    date: '2026-08-02',
    dept: 'Cardiology',
  });

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!formData.patient) return;
    const newApt = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      patient: formData.patient,
      doctor: formData.doctor,
      time: formData.time,
      date: formData.date,
      status: 'CONFIRMED',
      dept: formData.dept,
    };
    setAppointments([newApt, ...appointments]);
    setIsBookModalOpen(false);
    setFormData({ patient: '', doctor: 'Dr. Anjali Rajan', time: '11:00 AM', date: '2026-08-02', dept: 'Cardiology' });
  };

  const handleStatusChange = (id, newStatus) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Appointment Schedule</h2>
            <p className="text-xs text-slate-500">Real-time doctor slots & scheduling management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  viewMode === mode ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1F5F5B] text-white text-xs font-semibold rounded-xl hover:bg-teal-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {/* Slots Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Doctor Availability Slots */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" /> Available Doctor Slots
          </h3>
          <p className="text-xs text-slate-500">Select a time slot to quickly assign walk-in patients.</p>

          <div className="space-y-2">
            {timeSlots.map((slot) => {
              const isOccupied = appointments.some(a => a.time === slot);
              return (
                <div
                  key={slot}
                  onClick={() => {
                    if (!isOccupied) {
                      setFormData({ ...formData, time: slot });
                      setIsBookModalOpen(true);
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium cursor-pointer transition-all ${
                    isOccupied
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-teal-50/40 border-teal-200/60 hover:bg-teal-50 text-teal-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                    <span>{slot}</span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${isOccupied ? 'bg-slate-200 text-slate-600' : 'bg-teal-600 text-white'}`}>
                    {isOccupied ? 'Booked' : 'Available'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Scheduled Appointments List */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Scheduled Patients ({appointments.length})</h3>
            <span className="text-xs text-slate-500 font-mono">Today: 2026-08-02</span>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-all bg-slate-50/40 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
                    {apt.patient.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-800">{apt.patient}</h4>
                      <span className="text-[11px] font-mono text-slate-400">({apt.id})</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                      <span>Doctor: <strong className="text-slate-700">{apt.doctor}</strong></span>
                      <span>Time: <strong className="text-teal-700">{apt.time}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusPill status={apt.status} />
                  {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                    <div className="flex items-center gap-1">
                      <button
                        title="Mark Complete"
                        onClick={() => handleStatusChange(apt.id, 'COMPLETED')}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        title="Cancel Appointment"
                        onClick={() => handleStatusChange(apt.id, 'CANCELLED')}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="New Appointment Booking">
        <form onSubmit={handleBookSubmit} className="space-y-4">
          <FormField label="Patient Full Name" required>
            <input
              type="text"
              required
              value={formData.patient}
              onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
              placeholder="e.g. Ramesh Verma"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department">
              <select
                value={formData.dept}
                onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
              </select>
            </FormField>

            <FormField label="Doctor Specialist">
              <select
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Dr. Anjali Rajan">Dr. Anjali Rajan (Cardio)</option>
                <option value="Dr. Amit Verma">Dr. Amit Verma (Neuro)</option>
                <option value="Dr. Neha Sharma">Dr. Neha Sharma (Pedia)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </FormField>

            <FormField label="Time Slot">
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                {timeSlots.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#1F5F5B] text-white hover:bg-teal-800 shadow-sm"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
