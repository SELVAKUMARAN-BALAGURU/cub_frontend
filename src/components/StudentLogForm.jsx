import React, { useState, useEffect } from 'react';
import { Save, Clock, Calendar, User, FileText, CheckCircle2, AlertCircle, Trash2, Search, Sparkles } from 'lucide-react';

export default function StudentLogForm({ logs, onSaveLog, onDeleteLog, students }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [regNo, setRegNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [logDate, setLogDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [description, setDescription] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  // Auto-fill student name when Register Number changes
  useEffect(() => {
    if (regNo.trim()) {
      const match = students.find(s => s.reg_no.toLowerCase() === regNo.trim().toLowerCase());
      if (match) {
        setStudentName(match.name);
      }
    }
  }, [regNo, students]);

  // Calculate work hours preview
  const calculateHoursPreview = () => {
    if (!startTime || !endTime) return '0.0';
    try {
      const parse = (tStr) => {
        let [t, modifier] = tStr.trim().split(' ');
        let [h, m] = t.split(':').map(Number);
        if (modifier) {
          modifier = modifier.toUpperCase();
          if (modifier === 'PM' && h < 12) h += 12;
          if (modifier === 'AM' && h === 12) h = 0;
        }
        return h + (m || 0) / 60;
      };
      const start = parse(startTime);
      const end = parse(endTime);
      let diff = end - start;
      if (diff < 0) diff += 24;
      return isNaN(diff) ? '0.0' : diff.toFixed(1);
    } catch (e) {
      return '0.0';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regNo.trim()) {
      setErrorMsg('Please enter your Register Number.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a description of your work.');
      return;
    }

    setSaving(true);
    try {
      const result = await onSaveLog({
        reg_no: regNo.trim(),
        student_name: studentName.trim() || `Student (${regNo.trim()})`,
        log_date: logDate,
        start_time: startTime,
        end_time: endTime,
        description: description.trim()
      });

      if (result.success) {
        setSuccessMsg('Log record saved successfully to PostgreSQL database!');
        // Keep regNo and studentName for convenience, clear description
        setDescription('');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(result.error || 'Failed to save log entry.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setSaving(false);
    }
  };

  // Filter logs for display table
  const filteredLogs = logs.filter(log => {
    if (!tableSearch) return true;
    const term = tableSearch.toLowerCase();
    return (
      log.reg_no.toLowerCase().includes(term) ||
      log.student_name.toLowerCase().includes(term) ||
      log.description.toLowerCase().includes(term) ||
      log.log_date.includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Daily Log Entry Form Section */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Clock style={{ color: '#6366f1' }} size={24} />
              Enter Daily Internship Work Log
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.2rem' }}>
              Fill in your work hours and daily activities. Records are saved directly to the database.
            </p>
          </div>

          <div className="badge badge-indigo" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Estimated Hours: <strong style={{ color: '#ffffff', marginLeft: '0.3rem' }}>{calculateHoursPreview()} hrs</strong>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px', padding: '0.9rem 1.2rem', color: '#34d399', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.92rem' }}>
            <CheckCircle2 size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', padding: '0.9rem 1.2rem', color: '#f87171', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.92rem' }}>
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          
          {/* Register Number Input with Autocomplete */}
          <div>
            <label className="form-label">
              <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Register Number *
            </label>
            <input
              type="text"
              list="student-reg-list"
              className="form-input"
              placeholder="Enter Register Number"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              required
            />
            <datalist id="student-reg-list">
              {students.map(s => (
                <option key={s.reg_no} value={s.reg_no}>{s.name}</option>
              ))}
            </datalist>
          </div>

          {/* Student Name Input */}
          <div>
            <label className="form-label">Student Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>

          {/* Log Date */}
          <div>
            <label className="form-label">
              <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Log Date *
            </label>
            <input
              type="date"
              className="form-input"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              required
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="form-label">Start Time *</label>
            <input
              type="text"
              className="form-input"
              placeholder="09:00 AM"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          {/* End Time */}
          <div>
            <label className="form-label">End Time *</label>
            <input
              type="text"
              className="form-input"
              placeholder="05:00 PM"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          {/* Description - Spans full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">
              <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Work Description *
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe your internship tasks, code modules completed, or project updates for today..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ opacity: saving ? 0.7 : 1, width: '100%', maxWidth: '240px' }}
            >
              <Save size={18} />
              {saving ? 'Saving to Database...' : 'Save Log Record'}
            </button>
          </div>

        </form>

      </div>

      {/* 2. Log Records Table Display (Ordered in Descending Order) */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} style={{ color: '#06b6d4' }} />
              All Saved Internship Logs ({filteredLogs.length})
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
              Sorted in descending order (today's latest details on top, previous details below).
            </p>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.3rem', fontSize: '0.85rem' }}
              placeholder="Filter table logs..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table Container */}
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}>
            <Clock size={36} style={{ color: '#6b7280', marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '1rem', fontWeight: '500' }}>No log records found.</p>
            <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>Fill in the form above and click "Save Log Record" to add an entry.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Register No</th>
                  <th>Student Name</th>
                  <th>Time Interval</th>
                  <th>Hours Worked</th>
                  <th>Work Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((item, index) => (
                  <tr key={item.id || index} style={{ animation: index === 0 ? 'fadeIn 0.5s ease' : 'none' }}>
                    
                    {/* Log Date */}
                    <td>
                      <span className="badge badge-indigo">
                        {item.log_date}
                      </span>
                    </td>

                    {/* Reg No */}
                    <td style={{ fontWeight: '700', color: '#818cf8', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {item.reg_no}
                    </td>

                    {/* Student Name */}
                    <td style={{ fontWeight: '600', color: '#ffffff' }}>
                      {item.student_name}
                    </td>

                    {/* Start Time & End Time */}
                    <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {item.start_time} - {item.end_time}
                    </td>

                    {/* Hours Worked */}
                    <td>
                      <span className="badge badge-emerald">
                        ⚡ {item.hours_worked} hrs
                      </span>
                    </td>

                    {/* Description */}
                    <td style={{ maxWidth: '340px', color: '#d1d5db', fontSize: '0.88rem', lineHeight: '1.4' }}>
                      {item.description}
                    </td>

                    {/* Action */}
                    <td>
                      <button
                        onClick={() => onDeleteLog(item.id)}
                        title="Delete log entry"
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
