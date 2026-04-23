import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportStatsPDF(stats) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString();

  doc.setFillColor(27, 54, 93);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(123, 179, 66);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ISTAConnect', 14, 18);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Admin Dashboard Report', 80, 18);
  doc.text(now, 140, 18);

  doc.setTextColor(0, 0, 0);
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

  doc.save(`ISTAConnect_Report_${Date.now()}.pdf`);
}

export function exportUsersPDF(users) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString();

  doc.setFillColor(27, 54, 93);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(123, 179, 66);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ISTAConnect', 14, 18);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Users Directory', 80, 18);
  doc.text(now, 140, 18);

  doc.setTextColor(0, 0, 0);
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