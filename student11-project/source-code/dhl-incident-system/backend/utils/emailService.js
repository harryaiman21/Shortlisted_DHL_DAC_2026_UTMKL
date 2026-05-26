import nodemailer from 'nodemailer';

// 1. Configure the Transporter (The Engine)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 2. Utility to verify connection when the server starts
export const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('📧 Email Engine Ready and Connected');
    } catch (error) {
        console.error('⚠️ Email Engine Connection Failed:', error.message);
    }
};

// 3. Email Template: Critical Server Errors for the Admin
export const sendAdminErrorAlert = async (errorMessage, stackTrace) => {
    const mailOptions = {
        from: `"ResoBot System" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: '🚨 CRITICAL: ResoBot Server Exception',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border-top: 5px solid #D40511; max-width: 600px;">
                <h2 style="color: #D40511; margin-top: 0;">Server Exception Detected</h2>
                <p style="color: #333;">The ResoBot Node.js server has encountered an unhandled error.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
                    <p style="margin: 0 0 10px 0;"><strong>Error Message:</strong> <span style="color: #D40511;">${errorMessage}</span></p>
                    <p style="margin: 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <p style="font-size: 11px; color: #888; margin-top: 20px;">Automated system diagnostic message. Do not reply.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send Admin Alert email:', error.message);
    }
};

// 4. Email Template: New Incident Assignment for Departments
// 🚨 THIS IS THE FUNCTION IT WAS LOOKING FOR 🚨
export const sendDepartmentAlert = async (departmentEmail, incident) => {
    const mailOptions = {
        from: `"ResoBot AI" <${process.env.EMAIL_USER}>`,
        to: departmentEmail,
        subject: `New Incident Routed: ${incident.ticketId} - ${incident.priority} Priority`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border-top: 5px solid #FFCC00; max-width: 600px;">
                <h2 style="color: #333; margin-top: 0;">New Incident Assignment</h2>
                <p style="color: #555;">A new incident has been automatically routed to your department by the ResoBot AI Engine.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${incident.priority === 'Critical' ? '#D40511' : '#FFCC00'};">
                    <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${incident.ticketId}</p>
                    <p style="margin: 5px 0;"><strong>Category:</strong> ${incident.category}</p>
                    <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="font-weight: bold; color: ${incident.priority === 'Critical' ? '#D40511' : '#333'};">${incident.priority}</span></p>
                    <p style="margin: 10px 0 0 0; line-height: 1.5;"><strong>AI Summary:</strong> ${incident.aiSummary}</p>
                </div>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/vault" style="display: inline-block; padding: 10px 20px; background-color: #D40511; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Details in Vault</a>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send Department Alert email:', error.message);
    }
};