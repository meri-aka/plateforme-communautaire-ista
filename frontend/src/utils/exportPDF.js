import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function addHeader(doc, title) {
  const now = new Date().toLocaleString();
  doc.setFillColor(27, 54, 93);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(123, 179, 66);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ISTAConnect', 14, 18);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(title, 90, 18);
  doc.text(now, 145, 18);
  doc.setTextColor(0, 0, 0);
}

export function exportStatsPDF(stats) {
  const doc = new jsPDF();
  addHeader(doc, 'Dashboard Report');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Platform Overview', 14, 44);
  autoTable(doc, {
    startY: 50,
    head: [['Metric', 'Value']],
    body: [
      ['Total Users',       stats?.users?.total       ?? 0],
      ['Stagiaires',        stats?.users?.stagiaires  ?? 0],
      ['Formateurs',        stats?.users?.formateurs  ?? 0],
      ['New Today',         stats?.users?.new_today   ?? 0],
      ['Total Posts',       stats?.posts?.total       ?? 0],
      ['Posts Today',       stats?.posts?.today       ?? 0],
      ['Pending Feedbacks', stats?.feedbacks?.pending ?? 0],
      ['Total Feedbacks',   stats?.feedbacks?.total   ?? 0],
      ['Open Lost & Found', stats?.lost_found?.open   ?? 0],
      ['Pending Reports',   stats?.reports?.pending   ?? 0],
      ['Total Reports',     stats?.reports?.total     ?? 0],
    ],
    headStyles:   { fillColor: [27, 54, 93], textColor: [123, 179, 66], fontStyle: 'bold' },
    altRowStyles: { fillColor: [245, 247, 250] },
    styles: { fontSize: 11 },
  });
  doc.save(`ISTAConnect_Dashboard_${Date.now()}.pdf`);
}

export function exportUsersPDF(users) {
  const doc = new jsPDF();
  addHeader(doc, 'Users Directory');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Registered Users', 14, 44);
  autoTable(doc, {
    startY: 50,
    head: [['ID', 'Name', 'Email', 'Role', 'Filière', 'Joined']],
    body: users.map(u => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.filiere?.name ?? '—',
      new Date(u.created_at).toLocaleDateString(),
    ]),
    headStyles:   { fillColor: [27, 54, 93], textColor: [123, 179, 66], fontStyle: 'bold' },
    altRowStyles: { fillColor: [245, 247, 250] },
    styles: { fontSize: 9 },
  });
  doc.save(`ISTAConnect_Users_${Date.now()}.pdf`);
}

export function exportPostsPDF(posts) {
  const doc = new jsPDF();
  addHeader(doc, 'Posts Report');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Posts Overview', 14, 44);
  autoTable(doc, {
    startY: 50,
    head: [['ID', 'Author', 'Content', 'Likes', 'Comments', 'Date']],
    body: posts.map(p => [
      p.id,
      p.user?.name ?? '—',
      (p.content ?? '').substring(0, 60) + '...',
      p.likes_count    ?? 0,
      p.comments_count ?? 0,
      new Date(p.created_at).toLocaleDateString(),
    ]),
    headStyles:   { fillColor: [27, 54, 93], textColor: [123, 179, 66], fontStyle: 'bold' },
    altRowStyles: { fillColor: [245, 247, 250] },
    styles: { fontSize: 9 },
  });
  doc.save(`ISTAConnect_Posts_${Date.now()}.pdf`);
}

export function exportFeedbackPDF(feedbacks) {
  const doc = new jsPDF();
  addHeader(doc, 'Feedback Report');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Feedback Overview', 14, 44);
  autoTable(doc, {
    startY: 50,
    head: [['ID', 'User', 'Category', 'Status', 'Content', 'Date']],
    body: feedbacks.map(f => [
      f.id,
      f.user?.name ?? '—',
      f.category ?? '—',
      f.status,
      (f.content ?? '').substring(0, 50) + '...',
      new Date(f.created_at).toLocaleDateString(),
    ]),
    headStyles:   { fillColor: [27, 54, 93], textColor: [123, 179, 66], fontStyle: 'bold' },
    altRowStyles: { fillColor: [245, 247, 250] },
    styles: { fontSize: 9 },
  });
  doc.save(`ISTAConnect_Feedback_${Date.now()}.pdf`);
}

export function exportReportsPDF(reports) {
  const doc = new jsPDF();
  addHeader(doc, 'Reports Report');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Reports Overview', 14, 44);
  autoTable(doc, {
    startY: 50,
    head: [['ID', 'Reporter', 'Reason', 'Type', 'Target ID', 'Status', 'Date']],
    body: reports.map(r => [
      r.id,
      r.reporter?.name ?? '—',
      r.reason,
      r.reportable_type,
      r.reportable_id,
      r.status,
      new Date(r.created_at).toLocaleDateString(),
    ]),
    headStyles:   { fillColor: [27, 54, 93], textColor: [123, 179, 66], fontStyle: 'bold' },
    altRowStyles: { fillColor: [245, 247, 250] },
    styles: { fontSize: 9 },
  });
  doc.save(`ISTAConnect_Reports_${Date.now()}.pdf`);
}

export function exportLostFoundPDF(items) {
  const doc = new jsPDF();
  addHeader(doc, 'Lost & Found Report');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Lost & Found Items', 14, 44);
  autoTable(doc, {
    startY: 50,
    head: [['ID', 'Title', 'Type', 'Status', 'Location', 'Reported By', 'Date']],
    body: items.map(i => [
      i.id,
      i.title,
      i.type,
      i.status,
      i.location ?? '—',
      i.user?.name ?? '—',
      new Date(i.created_at).toLocaleDateString(),
    ]),
    headStyles:   { fillColor: [27, 54, 93], textColor: [123, 179, 66], fontStyle: 'bold' },
    altRowStyles: { fillColor: [245, 247, 250] },
    styles: { fontSize: 9 },
  });
  doc.save(`ISTAConnect_LostFound_${Date.now()}.pdf`);
}