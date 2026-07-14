import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

// Helper to convert LocalTime (which Jackson serializes as either string or [H, M] array) to HH:MM string safely
const timeToString = (timeVal) => {
  if (!timeVal) return '';
  if (typeof timeVal === 'string') return timeVal;
  if (Array.isArray(timeVal)) {
    const h = String(timeVal[0]).padStart(2, '0');
    const m = String(timeVal[1] !== undefined ? timeVal[1] : 0).padStart(2, '0');
    return `${h}:${m}`;
  }
  return '';
};

// Helper to generate slots dynamically based on start time, end time and max slots
const generateSlots = (startTimeVal, endTimeVal, maxSlots) => {
  const startTimeStr = timeToString(startTimeVal);
  const endTimeStr = timeToString(endTimeVal);

  if (!startTimeStr || !endTimeStr) return [];
  try {
    const [sh, sm] = startTimeStr.split(':').map(Number);
    const [eh, em] = endTimeStr.split(':').map(Number);
    
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const totalDuration = endMin - startMin;
    
    if (totalDuration <= 0 || !maxSlots || maxSlots <= 0) return [];
    
    const interval = Math.floor(totalDuration / maxSlots);
    const slots = [];
    for (let i = 0; i < maxSlots; i++) {
      const currentMin = startMin + i * interval;
      const h = Math.floor(currentMin / 60);
      const m = currentMin % 60;
      const hStr = String(h).padStart(2, '0');
      const mStr = String(m).padStart(2, '0');
      
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      const h12Str = String(h12).padStart(2, '0');
      
      slots.push({
        value: `${hStr}:${mStr}`,
        label: `${h12Str}:${mStr} ${ampm}`
      });
    }
    return slots;
  } catch (e) {
    console.error("Error generating slots:", e);
    return [];
  }
};

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);

  // Availability states
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availability, setAvailability] = useState(null); // null = not checked, false = unavailable
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await api.get(`/doctors/${doctorId}/summary`);
        setDoctor(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch specialist details');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  // Fetch slot details when date changes
  useEffect(() => {
    if (!date) {
      setAvailability(null);
      setAvailableSlots([]);
      return;
    }

    const checkSlots = async () => {
      setCheckingAvailability(true);
      setAvailability(null);
      setAvailableSlots([]);
      setTime('');
      try {
        const res = await api.get(`/doctors/${doctorId}/slots?date=${date}`);
        if (res.data && res.data.id) {
          setAvailability(res.data);
          const slots = generateSlots(res.data.startTime, res.data.endTime, res.data.maxSlots);
          setAvailableSlots(slots);
          if (slots.length > 0) {
            setTime(slots[0].value);
          }
        } else {
          setAvailability(false);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
        setAvailability(false);
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkSlots();
  }, [date, doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      setError('Please select a date and an available time slot.');
      return;
    }
    setError('');
    setBooking(true);
    try {
      const appointmentTime = `${date}T${time}:00`;
      await api.post('/appointments', {
        doctorId: Number(doctorId),
        appointmentTime,
        reason
      });
      navigate('/patient/appointments');
    } catch (err) {
      setError(err.response?.data || err.message || 'Slot booking failed. Verify physician availability.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  // Determine availability status safely
  const isFullyBooked = availability && availability.bookedSlots !== undefined && availability.maxSlots !== undefined && availability.bookedSlots >= availability.maxSlots;
  const isAvailable = availability && !isFullyBooked;

  const displayStartTime = timeToString(availability?.startTime).substring(0, 5);
  const displayEndTime = timeToString(availability?.endTime).substring(0, 5);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900">Secure Session Slot</h2>
        <p className="text-xs text-slate-500 mt-0.5">Book your direct consultation date and parameters</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-danger-light border border-red-100 text-danger p-3.5 rounded-lg text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {doctor && (
        <div className="card-base p-5 space-y-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 font-bold">
              {doctor.name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-none">{doctor.name}</h3>
              <span className="text-xs text-slate-400 block mt-1">{doctor.specialization || 'General Physician'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-slate-100 text-xs text-slate-500">
            <div>
              <span>Session Fee</span>
              <span className="block font-bold text-slate-800 mt-0.5">₹{doctor.consultationFee || '500'}</span>
            </div>
            <div>
              <span>Physician Email</span>
              <span className="block font-bold text-slate-800 mt-0.5">{doctor.email}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-base p-6 space-y-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        {/* Date Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Appointment Date
          </label>
          <input
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Availability Notification Boxes */}
        {date && (
          <div className="mt-2">
            {checkingAvailability ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                Checking doctor availability...
              </div>
            ) : availability === false ? (
              <div className="flex items-start gap-2 text-xs font-semibold text-amber-800 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>No availability scheduled for this doctor on the selected date. Please choose another date.</span>
              </div>
            ) : isFullyBooked ? (
              <div className="flex items-start gap-2 text-xs font-semibold text-red-800 p-3 bg-red-50 rounded-xl border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>All slots are fully booked for this day. ({availability.bookedSlots}/{availability.maxSlots} booked)</span>
              </div>
            ) : isAvailable ? (
              <div className="flex items-start gap-2 text-xs font-semibold text-emerald-800 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p>Doctor is available!</p>
                  <p className="text-[10px] text-emerald-600 font-normal mt-0.5">
                    Hours: {displayStartTime} - {displayEndTime} | Slots available: {(availability.maxSlots || 0) - (availability.bookedSlots || 0)} remaining
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Time Slots Selection */}
        {isAvailable && availableSlots.length > 0 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Time Slot
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input-field"
              required
            >
              {availableSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Symptoms & Details
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Briefly explain the reason for consultation..."
            className="input-field resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={booking || checkingAvailability || !isAvailable}
          className="w-full btn-primary py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#1F5F5B' }}
        >
          {booking ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Booking Slot'}
        </button>
      </form>
    </div>
  );
}
