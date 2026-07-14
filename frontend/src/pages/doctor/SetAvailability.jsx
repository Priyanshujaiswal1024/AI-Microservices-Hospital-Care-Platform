import React, { useState, useEffect } from 'react';
import { Clock, Calendar, RefreshCw, Plus } from 'lucide-react';
import api from '../../api/axios';

export default function SetAvailability() {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [maxSlots, setMaxSlots] = useState('10');
  const [saving, setSaving] = useState(false);

  const fetchAvailability = async () => {
    try {
      const response = await api.get('/doctors/availability');
      setAvailabilities(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/doctors/availability', {
        date,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        maxSlots: Number(maxSlots)
      });
      setDate('');
      fetchAvailability();
    } catch (err) {
      alert(err.response?.data || 'Failed to save availability slot');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900">Physician Availability</h2>
        <p className="text-xs text-slate-500 mt-0.5">Publish calendar slots, working timings, and patient consult caps</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Panel */}
        <form onSubmit={handleAdd} className="card-base p-5 space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 text-xs">Publish New Duty Date</h3>
          <div>
            <label className="block text-xs text-slate-500 font-semibold mb-1.5">Duty Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1.5">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1.5">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 font-semibold mb-1.5">Consult Booking Limit</label>
            <input
              type="number"
              required
              min={1}
              value={maxSlots}
              onChange={(e) => setMaxSlots(e.target.value)}
              className="input-field"
            />
          </div>

          <button type="submit" disabled={saving} className="w-full btn-primary py-2.5 flex items-center justify-center gap-1.5">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Plus className="w-3.5 h-3.5" /> Publish Slot</>}
          </button>
        </form>

        {/* Existing Grid */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-850 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" /> Active Registry Dates
          </h3>

          {availabilities.length === 0 ? (
            <div className="card-base p-8 text-center text-slate-400 text-xs">
              No duty dates mapped in calendars.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availabilities.map((av) => (
                <div key={av.id} className="card-base p-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">{new Date(av.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="text-[9px] uppercase font-bold text-emerald-600 bg-success-light border border-green-150 px-2 py-0.5 rounded-full">
                        {av.bookedSlots} / {av.maxSlots} Booked
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{av.startTime?.slice(0, 5)} - {av.endTime?.slice(0, 5)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
