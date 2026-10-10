import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentLogForm from './components/StudentLogForm';
import FacultySearch from './components/FacultySearch';
import ReportGenerator from './components/ReportGenerator';
import StudentRoster from './components/StudentRoster';
import LabMonitor from './components/LabMonitor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [activeTab, setActiveTab] = useState('log');
  const [logs, setLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [dbMode, setDbMode] = useState('pg');
  const [loading, setLoading] = useState(true);
  const [selectedStudentForSearch, setSelectedStudentForSearch] = useState('');

  // Fetch initial system status, students roster, and daily logs
  const fetchSystemData = async () => {
    try {
      // 1. Fetch DB mode status
      const statusRes = await fetch(`${API_URL}/api/status`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setDbMode(statusData.db_mode);
      }

      // 2. Fetch students list
      const studentsRes = await fetch(`${API_URL}/api/students`);
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }

      // 3. Fetch all daily logs (ordered in descending order)
      const logsRes = await fetch(`${API_URL}/api/logs`);
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
    } catch (err) {
      console.error('Failed to connect to backend server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  // Save new daily log record
  const handleSaveLog = async (logData) => {
    try {
      const response = await fetch(`${API_URL}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });

      if (response.ok) {
        const data = await response.json();
        // Update state instantly with new logs list
        if (data.logs) {
          setLogs(data.logs);
        } else {
          fetchSystemData();
        }
        return { success: true, log: data.log };
      } else {
        const errData = await response.json();
        return { success: false, error: errData.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Delete log entry
  const handleDeleteLog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    try {
      const response = await fetch(`${API_URL}/api/logs/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to delete log entry:', err);
    }
  };

  const handleSelectStudentForSearch = (studentName) => {
    setSelectedStudentForSearch(studentName);
    setActiveTab('search');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbMode={dbMode}
        totalLogsCount={logs.length}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
            <div className="badge badge-indigo" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              Connecting to PostgreSQL Server & Loading Data...
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'log' && (
              <StudentLogForm
                logs={logs}
                onSaveLog={handleSaveLog}
                onDeleteLog={handleDeleteLog}
                students={students}
              />
            )}

            {activeTab === 'search' && (
              <FacultySearch
                students={students}
                API_URL={API_URL}
                initialSearchQuery={selectedStudentForSearch}
              />
            )}

            {activeTab === 'report' && (
              <ReportGenerator
                students={students}
                logs={logs}
                API_URL={API_URL}
              />
            )}

            {activeTab === 'students' && (
              <StudentRoster
                students={students}
                logs={logs}
                onSelectStudentForSearch={handleSelectStudentForSearch}
              />
            )}

            {activeTab === 'lab' && (
              <LabMonitor API_URL={API_URL} />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(11, 15, 25, 0.9)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.85rem'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <span>© 2026 CUB Internship Daily Log Portal</span>
        </div>
      </footer>

    </div>
  );
}
