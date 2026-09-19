const ExcelJS = require('exceljs');
const path = require('path');
const sendEmail = require('./sendEmail');

const generateMonthlyReport = async (users, attendances) => {
    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'SN Enviro System';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Monthly Attendance');

        worksheet.columns = [
            { header: 'Employee Name', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Role', key: 'role', width: 20 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Location', key: 'location', width: 30 },
            { header: 'Hours', key: 'hours', width: 10 }
        ];

        // Add Header Style
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };

        attendances.forEach(att => {
            worksheet.addRow({
                name: att.user.name,
                email: att.user.email,
                role: att.user.role,
                date: new Date(att.timestamp).toLocaleDateString(),
                location: att.locationName,
                hours: att.totalHours ? att.totalHours.toFixed(2) : 'Active'
            });
        });

        const reportPath = path.join(__dirname, '..', 'uploads', `Monthly_Report_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(reportPath);

        // Send Email to MD
        await sendEmail({
            email: process.env.SMTP_EMAIL, // Send to MD
            subject: `Monthly Attendance Report - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
            message: `<div style="font-family: sans-serif; padding: 20px;">
                        <h2>Monthly Attendance Report</h2>
                        <p>Please find attached the automated Excel report for this month's attendance.</p>
                      </div>`,
            attachments: [
                {
                    filename: 'Monthly_Attendance_Report.xlsx',
                    path: reportPath
                }
            ]
        });

        console.log('Monthly report generated and emailed successfully.');
    } catch (error) {
        console.error('Failed to generate monthly report:', error);
    }
};

module.exports = { generateMonthlyReport };
