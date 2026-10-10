import React from 'react';
import { ClipboardList, Search, FileText, Users, Monitor, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, dbMode, totalLogsCount }) {
  const tabs = [
    { id: 'log', label: 'Daily Work Log', icon: ClipboardList, badge: totalLogsCount ? `${totalLogsCount}` : null },
    { id: 'search', label: 'Faculty Search', icon: Search },
    { id: 'report', label: 'Generate PDF Report', icon: FileText },
    { id: 'students', label: 'Student Roster', icon: Users },
    { id: 'lab', label: 'Lab Monitor', icon: Monitor }
  ];

  return (
    <header style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, lineHeight: 1.2 }}>
              CUB Internship Log Portal
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
              Daily Work Logging & Faculty Monitoring System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.35rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : '#9ca3af',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(99, 102, 241, 0.2)',
                    color: isActive ? '#ffffff' : '#818cf8',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
