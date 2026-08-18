module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { name, phone, email, zip, budget, timeline, projectType, matters, pageType } = body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields (name, email)' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const recipientEmail = 'planning@dmhomeimprovementllc.com';
    const siteType = pageType || 'Kitchen';

    if (!resendApiKey) {
      console.log(`[Resend Notice] RESEND_API_KEY not configured on Vercel yet. Lead received for ${name}:`, body);
      return res.status(200).json({
        success: true,
        message: 'Lead recorded. Add RESEND_API_KEY in Vercel Environment Variables to activate instant email delivery.'
      });
    }

    const prioritiesText = Array.isArray(matters) ? matters.join(', ') : (matters || 'None selected');

    // Plain text alternative for anti-spam scoring
    const plainTextContent = `NEW ${siteType.toUpperCase()} PROJECT LEAD\n\n` +
      `Full Name: ${name}\n` +
      `Phone Number: ${phone || 'N/A'}\n` +
      `Email Address: ${email}\n` +
      `ZIP Code: ${zip || 'N/A'}\n` +
      `Investment Range: ${budget || 'N/A'}\n` +
      `Timeline: ${timeline || 'N/A'}\n` +
      `Project Scope: ${projectType || 'N/A'}\n` +
      `What Matters Most: ${prioritiesText}\n\n` +
      `Submitted via DM Home Improvement ${siteType} Landing Page`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #152844; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">🚨 New ${siteType} Project Lead</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.85;">DM Home Improvement LLC Landing Page</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: bold; width: 140px; color: #475569;">Full Name:</td>
              <td style="padding: 10px 0; font-size: 16px; font-weight: bold; color: #0f172a;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #475569;">Phone Number:</td>
              <td style="padding: 10px 0;"><a href="tel:${phone}" style="color: #dc2626; font-weight: bold; text-decoration: none;">${phone || 'N/A'}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #475569;">Email Address:</td>
              <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #475569;">ZIP Code:</td>
              <td style="padding: 10px 0;">${zip || 'N/A'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #475569;">Investment Range:</td>
              <td style="padding: 10px 0; font-weight: bold; color: #059669;">${budget || 'N/A'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #475569;">Timeline:</td>
              <td style="padding: 10px 0;">${timeline || 'N/A'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #475569;">Project Scope:</td>
              <td style="padding: 10px 0;">${projectType || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #475569;">What Matters Most:</td>
              <td style="padding: 10px 0;">${prioritiesText}</td>
            </tr>
          </table>
        </div>
        <div style="background: #f8fafc; padding: 15px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
          Submitted via DM Home Improvement ${siteType} Landing Page • ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST
        </div>
      </div>
    `;

    // Use domain-authenticated sender if configured, or onboarding default
    const senderEmail = process.env.SENDER_EMAIL || 'DM Leads <onboarding@resend.dev>';

    const resendPayload = {
      from: senderEmail,
      to: [recipientEmail],
      reply_to: email,
      subject: `🚨 New ${siteType} Lead: ${name} (${budget || 'Quote Request'})`,
      html: htmlContent,
      text: plainTextContent
    };

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify(resendPayload)
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API Error:', resendData);
      return res.status(500).json({ error: 'Failed to send email via Resend', details: resendData });
    }

    return res.status(200).json({ success: true, id: resendData.id });

  } catch (error) {
    console.error('Error sending lead email:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
