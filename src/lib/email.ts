import nodemailer from 'nodemailer'

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface TeamInvitationEmailData {
  inviterName: string
  inviterEmail: string
  catalogueName: string
  invitationToken: string
  recipientEmail: string
}

export async function sendTeamInvitation(data: TeamInvitationEmailData) {
  const {
    inviterName,
    inviterEmail,
    catalogueName,
    invitationToken,
    recipientEmail,
  } = data

  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${invitationToken}`

  try {
    const emailData = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmail,
      subject: `You've been invited to collaborate on ${catalogueName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Invitation</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .content { background: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Catfy</div>
            </div>
            
            <div class="content">
              <h2>You've been invited to collaborate!</h2>
              <p>Hi there,</p>
              <p><strong>${inviterName}</strong> (${inviterEmail}) has invited you to collaborate on the catalogue <strong>"${catalogueName}"</strong>.</p>
              <p>As a team member, you'll have full access to edit products, categories, and manage the catalogue alongside the owner.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${acceptUrl}" class="button">Accept Invitation</a>
              </p>
              <p><strong>Note:</strong> This invitation will expire in 7 days.</p>
            </div>
            
            <div class="footer">
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
              <p>© 2024 Catfy. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
You've been invited to collaborate on ${catalogueName}

${inviterName} (${inviterEmail}) has invited you to collaborate on the catalogue "${catalogueName}".

As a team member, you'll have full access to edit products, categories, and manage the catalogue alongside the owner.

Accept the invitation by visiting: ${acceptUrl}

Note: This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

© 2024 Catfy. All rights reserved.
      `,
    })

    return { success: true, messageId: emailData.messageId }
  } catch (error) {
    console.error('Error sending team invitation email:', error)
    throw new Error('Failed to send invitation email')
  }
}

export async function sendInvitationAcceptedNotification(data: {
  ownerEmail: string
  ownerName: string
  memberName: string
  memberEmail: string
  catalogueName: string
}) {
  const { ownerEmail, ownerName, memberName, memberEmail, catalogueName } = data

  try {
    const emailData = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: ownerEmail,
      subject: `${memberName} joined your team on ${catalogueName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Member Joined</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .content { background: #f0fdf4; padding: 30px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Catfy</div>
            </div>
            
            <div class="content">
              <h2>🎉 New team member joined!</h2>
              <p>Hi ${ownerName},</p>
              <p><strong>${memberName}</strong> (${memberEmail}) has accepted your invitation and joined your team on <strong>"${catalogueName}"</strong>.</p>
              <p>They now have full access to collaborate on your catalogue.</p>
            </div>
            
            <div class="footer">
              <p>© 2024 Catfy. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New team member joined!

Hi ${ownerName},

${memberName} (${memberEmail}) has accepted your invitation and joined your team on "${catalogueName}".

They now have full access to collaborate on your catalogue.

© 2024 Catfy. All rights reserved.
      `,
    })

    return { success: true, messageId: emailData.messageId }
  } catch (error) {
    console.error('Error sending team member joined notification:', error)
    throw new Error('Failed to send notification email')
  }
}

export interface CatalogueAccessEmailData {
  inviterName: string
  inviterEmail: string
  catalogueName: string
  invitationToken: string
  recipientEmail: string
  permission: 'view' | 'edit'
}

export async function sendCatalogueAccessEmail(data: CatalogueAccessEmailData) {
  const {
    inviterName,
    inviterEmail,
    catalogueName,
    invitationToken,
    recipientEmail,
    permission,
  } = data

  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${invitationToken}`

  const permissionText = permission === 'edit' ? 'edit' : 'view'
  const subject =
    permission === 'edit'
      ? `You've been invited to edit ${catalogueName}`
      : `You've been invited to view ${catalogueName}`

  const bodyHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto, sans-serif; color:#222;">
      <div style="max-width:600px;margin:0 auto;padding:20px;">
        <h2>${inviterName} invited you to ${permissionText} the catalogue</h2>
        <p>${inviterName} (${inviterEmail}) has invited you to ${permissionText} the catalogue <strong>"${catalogueName}"</strong>.</p>
        <p style="margin-top:18px;text-align:center;"><a href="${acceptUrl}" style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">Open Invitation</a></p>
        <p style="margin-top:12px;color:#666;font-size:13px;">This invitation expires in 7 days.</p>
      </div>
    </body>
    </html>
  `

  try {
    const emailData = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmail,
      subject,
      html: bodyHtml,
      text: `${inviterName} (${inviterEmail}) has invited you to ${permissionText} the catalogue "${catalogueName}". Open: ${acceptUrl}`,
    })

    return { success: true, messageId: emailData.messageId }
  } catch (error) {
    console.error('Error sending catalogue access email:', error)
    throw new Error('Failed to send catalogue access email')
  }
}
