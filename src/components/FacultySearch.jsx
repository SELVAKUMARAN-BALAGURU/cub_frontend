import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Clock, Calendar, Award, Filter, FileSpreadsheet, ChevronRight, RefreshCw } from 'lucide-react';

export default function FacultySearch({ students, API_URL, initialSearchQuery }) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [searchedName, setSearchedName] = useState('');

  // Search handler
  const handleSearch = async (queryToSearch) => {
    const term = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!term) return;

    setLoading(true);
    try {
      const weekParam = selectedWeek ? `&week=${encodeURIComponent(selectedWeek)}` : '';
      const response = await fetch(`${API_URL}/api/logs/search?query=${encodeURIComponent(term)}${weekParam}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setSearchedName(term);
        // Set default selected week if not set
        if (!selectedWeek && data.weeks_breakdown && data.weeks_breakdown.length > 0) {
          setSelectedWeek(data.weeks_breakdown[0].week_key);
        }
      }
    } catch (err) {
      console.error('Error fetching student logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if initialSearchQuery is passed from Student Roster
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
      handleSearch(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Re-run search when week changes
  useEffect(() => {
    if (searchedName) {
      handleSearch(searchedName);
    }
  }, [selectedWeek]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Search Header Panel */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Search style={{ color: '#06b6d4' }} size={24} />
            Faculty Search Portal - Student Internship Logs
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Type a student's name or register number to view their work logs, weekly hours, and overall total hours worked.
          </p>
        </div>

        {/* Search Bar & Controls */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <input
              type="text"
              list="faculty-student-list"
              className="form-input"
              style={{ paddingLeft: '2.5rem', fontSize: '1rem' }}
              placeholder="Enter Student Name or Register Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#818cf8' }} />
            
            <datalist id="faculty-student-list">
              {students.map(s => (
                <option key={s.reg_no} value={s.name}>{s.reg_no}</option>
              ))}
            </datalist>
          </div>

          <button
            onClick={() => handleSearch()}
            className="btn-primary"
            disabled={loading}
            style={{ height: '48px', padding: '0 1.8rem', fontSize: '0.95rem' }}
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
            Search Student Info
          </button>

        </div>

      </div>

      {/* Search Results Display */}
      {searchResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Student Profile & Summary Stat Cards */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'white', fontSize: '1.2rem' }}>
                  {searchResults.student_name ? searchResults.student_name.charAt(0) : 'S'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>
                    {searchResults.student_name}
                  </h3>
                  <p style={{ color: '#818cf8', fontSize: '0.88rem', fontFamily: 'monospace', margin: 0 }}>
                    Register Number: {searchResults.reg_no || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Week Selector for Particular Week Report */}
              {searchResults.weeks_breakdown && searchResults.weeks_breakdown.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Filter size={16} style={{ color: '#06b6d4' }} />
                  <span style={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: '600' }}>Select Particular Week:</span>
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                  >
                    {searchResults.weeks_breakdown.map(w => (
                      <option key={w.week_key} value={w.week_key}>
                        {w.week_range || w.week_key} — {w.total_hours} hrs
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              
              {/* Card 1: Particular Week Worked Hours */}
              <div className="glass-card" style={{ background: 'rgba(6, 182, 212, 0.08)', borderColor: 'rgba(6, 182, 212, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#22d3ee', fontWeight: '700', uppercase: true }}>
                    Particular Week Worked
                  </span>
                  <Clock size={20} style={{ color: '#22d3ee' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.1 }}>
                  {searchResults.weekly_total_hours} <span style={{ fontSize: '1rem', fontWeight: '500', color: '#9ca3af' }}>hrs</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.4rem' }}>
                  Week: {selectedWeek || 'Selected Week'}
                </p>
              </div>

              {/* Card 2: Overall Total Hours Worked */}
              <div className="glass-card" style={{ background: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: '700', uppercase: true }}>
                    Overall Total Worked
                  </span>
                  <Award size={20} style={{ color: '#818cf8' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.1 }}>
                  {searchResults.overall_total_hours} <span style={{ fontSize: '1rem', fontWeight: '500', color: '#9ca3af' }}>hrs</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.4rem' }}>
                  Cumulative across all log entries
                </p>
              </div>

              {/* Card 3: Total Logged Days */}
              <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '700', uppercase: true }}>
                    Total Days Logged
                  </span>
                  <Calendar size={20} style={{ color: '#34d399' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.1 }}>
                  {searchResults.total_records} <span style={{ fontSize: '1rem', fontWeight: '500', color: '#9ca3af' }}>days</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.4rem' }}>
                  Avg: {searchResults.total_records > 0 ? (searchResults.overall_total_hours / searchResults.total_records).toFixed(1) : 0} hrs / day
                </p>
              </div>

            </div>

          </div>

          {/* Student Log History Table (Descending Order) */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={18} style={{ color: '#818cf8' }} />
              Log Records for {searchResults.student_name} ({searchResults.records.length})
            </h4>

            {searchResults.records.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No log entries found for this student.</p>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Register No</th>
                      <th>Time Interval</th>
                      <th>Worked Hours</th>
                      <th>Work Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.records.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <span className="badge badge-indigo">{row.log_date}</span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: '600', color: '#818cf8' }}>
                          {row.reg_no}
                        </td>
                        <td style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                          {row.start_time} - {row.end_time}
                        </td>
                        <td>
                          <span className="badge badge-emerald">⚡ {row.hours_worked} hrs</span>
                        </td>
                        <td style={{ maxWidth: '400px', color: '#d1d5db', fontSize: '0.88rem' }}>
                          {row.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
