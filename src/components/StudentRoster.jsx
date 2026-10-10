import React, { useState } from 'react';
import { Users, Search, Award, Calendar, CheckCircle } from 'lucide-react';

export default function StudentRoster({ students, logs, onSelectStudentForSearch }) {
  const [filterQuery, setFilterQuery] = useState('');

  // Calculate stats for each student
  const studentStatsMap = {};
  logs.forEach(log => {
    const reg = log.reg_no.trim();
    if (!studentStatsMap[reg]) {
      studentStatsMap[reg] = { totalHours: 0, logCount: 0 };
    }
    studentStatsMap[reg].totalHours += parseFloat(log.hours_worked) || 0;
    studentStatsMap[reg].logCount += 1;
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.reg_no.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users style={{ color: '#6366f1' }} size={24} />
            Selected Internship Student Roster ({students.length})
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Complete directory of enrolled students from <code style={{ color: '#818cf8' }}>cub_list_log.xlsx</code>.
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.3rem', fontSize: '0.85rem' }}
            placeholder="Search student roster..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Register Number</th>
              <th>Student Name</th>
              <th>Total Logs</th>
              <th>Total Hours Worked</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, idx) => {
              const stats = studentStatsMap[student.reg_no] || { totalHours: 0, logCount: 0 };
              return (
                <tr key={student.reg_no}>
                  <td style={{ color: '#6b7280', fontSize: '0.82rem' }}>{idx + 1}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#818cf8' }}>
                    {student.reg_no}
                  </td>
                  <td style={{ fontWeight: '600', color: '#ffffff' }}>
                    {student.name}
                  </td>
                  <td>
                    <span className="badge badge-indigo">
                      {stats.logCount} entries
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-emerald">
                      ⚡ {stats.totalHours.toFixed(1)} hrs
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => onSelectStudentForSearch(student.name)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      View Logs & Hours
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
