import React, { useState } from 'react';
import { FileText, Download, Calendar, Layers, Check, User, Sparkles, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportGenerator({ students, logs, API_URL }) {
  const [selectedStudent, setSelectedStudent] = useState('ALL');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [generating, setGenerating] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // Extract distinct ISO weeks from logs
  const getISOWeek = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Unknown';
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  };

  // Convert ISO week key (e.g. "2026-W40") to readable date range like "Sep 28 – Oct 04, 2026"
  const isoWeekToDateRange = (weekKey) => {
    try {
      const [year, week] = weekKey.split('-W');
      // Get Monday of that ISO week
      const jan4 = new Date(Date.UTC(parseInt(year), 0, 4));
      const dayOfWeek = jan4.getUTCDay() || 7;
      const monday = new Date(jan4);
      monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (parseInt(week) - 1) * 7);
      const sunday = new Date(monday);
      sunday.setUTCDate(monday.getUTCDate() + 6);
      const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' });
      return `${fmt(monday)} – ${fmt(sunday)}`;
    } catch (e) {
      return weekKey;
    }
  };

  const availableWeeks = Array.from(new Set(logs.map(l => getISOWeek(l.log_date)))).sort().reverse();
  const currentWeek = availableWeeks[0] || getISOWeek(new Date().toISOString().split('T')[0]);

  // Generate PDF Function
  const generatePDF = async (reportType) => {
    setGenerating(true);
    setSuccessNotice('');

    try {
      // 1. Fetch filtered report data from API or current logs
      let targetLogs = [...logs];

      // Filter by student if selected
      if (selectedStudent !== 'ALL') {
        targetLogs = targetLogs.filter(
          l => l.reg_no === selectedStudent || l.student_name.toLowerCase() === selectedStudent.toLowerCase()
        );
      }

      // Filter by week if 'weekly' report type
      const activeWeek = selectedWeek || currentWeek;
      if (reportType === 'weekly') {
        targetLogs = targetLogs.filter(l => getISOWeek(l.log_date) === activeWeek);
      }

      // Sort logs descending by date
      targetLogs.sort((a, b) => new Date(b.log_date) - new Date(a.log_date));

      // 2. Initialize jsPDF Document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Branding Colors
      const primaryColor = [99, 102, 241]; // #6366f1
      const headerTextColor = [30, 41, 59];

      // Title Header
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, 210, 24, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('CUB INTERNSHIP DAILY WORK LOG REPORT', 14, 15);

      // Metadata Info Box
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      
      const reportTitle = reportType === 'weekly' ? `Particular Week Report (${activeWeek})` : 'Full Internship Report';
      const studentLabel = selectedStudent === 'ALL' ? 'All Interns' : (
        students.find(s => s.reg_no === selectedStudent)?.name || selectedStudent
      );

      doc.text(`Report Type: ${reportTitle}`, 14, 32);
      doc.text(`Student Scope: ${studentLabel}`, 14, 37);
      doc.text(`Generated Date: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}`, 14, 42);
      doc.text(`Total Records: ${targetLogs.length} entries`, 14, 47);

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 51, 196, 51);

      // 3. Prepare Table Data (Only: Date, Register No, Name, Description)
      // Note: User explicitly asked for "pdf show the details like register no, name, description (no need of start time and end time)"
      const tableHeaders = [['Date', 'Register No', 'Student Name', 'Work Description']];
      
      const tableRows = targetLogs.map(item => [
        item.log_date || '',
        item.reg_no || '',
        item.student_name || '',
        item.description || ''
      ]);

      // 4. Generate autoTable cleanly
      autoTable(doc, {
        startY: 55,
        head: tableHeaders,
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9.5
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: [51, 65, 85],
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 24 }, // Date
          1: { cellWidth: 28, fontStyle: 'bold' }, // Reg No
          2: { cellWidth: 40, fontStyle: 'bold' }, // Name
          3: { cellWidth: 'auto' } // Description
        },
        didDrawPage: (data) => {
          // Page Footer
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Page ${data.pageNumber} of ${pageCount}`, 196, 287, { align: 'right' });
          doc.text('Confidential - CUB Internship Management Portal', 14, 287);
        }
      });

      // 5. Download PDF File
      const filename = `CUB_Internship_Report_${reportType}_${selectedStudent}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      setSuccessNotice(`Successfully generated and downloaded PDF report: ${filename}`);
      setTimeout(() => setSuccessNotice(''), 5000);

    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText style={{ color: '#8b5cf6' }} size={24} />
            Generate PDF Internship Reports
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Generate and export official PDF reports containing student register numbers, names, dates, and detailed work descriptions.
          </p>
        </div>

        {/* Filter Selection Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          
          {/* Select Student Scope */}
          <div>
            <label className="form-label">
              <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Filter by Student
            </label>
            <select
              className="form-select"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="ALL">All Interns (Full Roster)</option>
              {students.map(s => (
                <option key={s.reg_no} value={s.reg_no}>
                  {s.reg_no} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Week (for Particular Week Report) */}
          <div>
            <label className="form-label">
              <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Select Particular Week
            </label>
            <select
              className="form-select"
              value={selectedWeek || (availableWeeks[0] || '')}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              {availableWeeks.map(w => (
                <option key={w} value={w}>
                  {isoWeekToDateRange(w)}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Report Generation Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Option 1: Generate Full Report */}
          <div className="glass-card" style={{ padding: '1.75rem', background: 'rgba(99, 102, 241, 0.07)', borderColor: 'rgba(99, 102, 241, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="badge badge-indigo" style={{ marginBottom: '1rem' }}>
                <Layers size={14} /> Option 1
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                Generate Full Report (PDF)
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Exports all daily work log records for the selected student or all students across the entire internship duration into a formatted PDF document.
              </p>
            </div>

            <button
              onClick={() => generatePDF('full')}
              className="btn-primary"
              disabled={generating}
              style={{ width: '100%', height: '46px' }}
            >
              <Download size={18} />
              {generating ? 'Creating PDF...' : 'Download Full PDF Report'}
            </button>
          </div>

          {/* Option 2: Generate Particular Week Report */}
          <div className="glass-card" style={{ padding: '1.75rem', background: 'rgba(6, 182, 212, 0.07)', borderColor: 'rgba(6, 182, 212, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="badge badge-cyan" style={{ marginBottom: '1rem' }}>
                <Calendar size={14} /> Option 2
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                Generate Particular Week Report (PDF)
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Exports only the daily work log entries submitted during the selected week (<strong>{selectedWeek || currentWeek}</strong>) into a PDF document.
              </p>
            </div>

            <button
              onClick={() => generatePDF('weekly')}
              className="btn-accent"
              disabled={generating}
              style={{ width: '100%', height: '46px', background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}
            >
              <Download size={18} />
              {generating ? 'Creating PDF...' : 'Download Weekly PDF Report'}
            </button>
          </div>

        </div>

        {/* Success Notice */}
        {successNotice && (
          <div style={{ marginTop: '1.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px', padding: '1rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
            <Check size={20} />
            <span>{successNotice}</span>
          </div>
        )}

      </div>

    </div>
  );
}
