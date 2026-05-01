export const verificationEmailTemplate = ({ name, verificationUrl, expiryHours = 24 }) => {
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/signin`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Verify your email — Beacon.</title>
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }

    @media only screen and (max-width: 600px) {
      body, .shell { padding: 0 !important; }
      .shell { width: 100% !important; padding: 14px 0 !important; }
      .card { width: 100% !important; border-radius: 0 !important; }
      .hero, .content, .footer { padding-left: 18px !important; padding-right: 18px !important; }
      .headline { font-size: 21px !important; }
      .body-copy { font-size: 15px !important; }
      .chip-row td { display: block !important; width: 100% !important; padding-right: 0 !important; padding-bottom: 8px !important; }
      .cta { font-size: 15px !important; padding: 15px 18px !important; }
      .small { font-size: 12px !important; }
    }

    @media (prefers-color-scheme: dark) {
      body, .shell { background: #0b0f17 !important; color: #e6ecff !important; }
      .card { background: #121826 !important; border-color: #22304a !important; }
      .hero { background: #1f5fb8 !important; }
      .body-copy, .muted, .small { color: #b4c2df !important; }
      .surface { background: #101624 !important; border-color: #22304a !important; }
      .surface-link { color: #90b4ff !important; }
      .cta { background: #5c94ff !important; color: #ffffff !important; }
      .footer { background: #0f1522 !important; border-top-color: #22304a !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f6fb;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#17233a;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="shell" style="background:#f3f6fb;padding:34px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card" style="max-width:580px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e9eef7;box-shadow:0 18px 42px rgba(17,33,63,0.12);">

          <!-- HEADER -->
          <tr>
            <td class="hero" style="padding:22px 30px;background:#2a67bf;">
              <p style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.2px;">Beacon</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="content" style="padding:34px 30px 22px;">
              <p class="headline" style="font-size:27px;font-weight:800;line-height:1.25;color:#17233a;margin:0 0 10px 0;letter-spacing:-0.3px;">
                Hey, <span style="color:#528dff;">${name}</span>
              </p>
              <p class="body-copy" style="font-size:15px;color:#42526f;line-height:1.8;margin:0 0 22px 0;">
                Your Beacon workspace is almost ready. Confirm your email to activate account access and receive security alerts.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td>
                    <div class="surface" style="background:#f7f9fd;border:1px solid #e7edf7;border-radius:12px;padding:14px 14px;">
                      <p style="margin:0 0 8px;font-size:11px;font-family:monospace;color:#5c6d8a;letter-spacing:0.3px;text-transform:uppercase;">Verification URL</p>
                      <a href="${verificationUrl}" class="surface-link" style="font-size:13px;line-height:1.7;color:#3f73da;text-decoration:none;word-break:break-all;">${verificationUrl}</a>
                    </div>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" class="cta" style="display:block;background:#528dff;color:#ffffff;text-decoration:none;border-radius:12px;padding:14px 24px;font-size:14px;font-weight:700;letter-spacing:0.2px;text-align:center;box-shadow:0 8px 18px rgba(82,141,255,0.32);">
                      Activate my Beacon account
                    </a>
                  </td>
                </tr>
              </table>

              <p class="muted" style="font-size:12px;color:#61708d;line-height:1.75;margin:0 0 4px;">
                Link expires in <strong style="color:#1f355c;">${expiryHours} hours</strong>. If it expires, request a fresh link from the
                <a href="${loginUrl}" style="color:#3f73da;text-decoration:none;font-weight:600;">login page</a>.
              </p>
              <p class="small" style="font-size:12px;color:#6f7d96;line-height:1.7;margin:0;">
                If you did not create a Beacon account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer" style="background:#f7f9fd;padding:18px 30px;border-top:1px solid #e7edf7;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" class="small" style="font-size:11px;color:#6f7d96;">© 2026 Beacon · incident response platform</td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export const passwordResetEmailTemplate = ({ name, resetUrl, expiryMinutes = 15 }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Reset your password — Beacon.</title>
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }

    @media only screen and (max-width: 600px) {
      body, .shell { padding: 0 !important; }
      .shell { width: 100% !important; padding: 14px 0 !important; }
      .card { width: 100% !important; border-radius: 0 !important; }
      .hero, .content, .footer { padding-left: 18px !important; padding-right: 18px !important; }
      .headline { font-size: 21px !important; }
      .body-copy { font-size: 15px !important; }
      .cta { font-size: 15px !important; padding: 15px 18px !important; }
    }

    @media (prefers-color-scheme: dark) {
      body, .shell { background: #0b0f17 !important; color: #e6ecff !important; }
      .card { background: #121826 !important; border-color: #22304a !important; }
      .hero { background: #c73e3a !important; }
      .body-copy, .muted, .small { color: #b4c2df !important; }
      .surface { background: #101624 !important; border-color: #22304a !important; }
      .surface-link { color: #90b4ff !important; }
      .cta { background: #e64a4a !important; color: #ffffff !important; }
      .footer { background: #0f1522 !important; border-top-color: #22304a !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f6fb;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#17233a;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="shell" style="background:#f3f6fb;padding:34px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card" style="max-width:580px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e9eef7;box-shadow:0 18px 42px rgba(17,33,63,0.12);">

          <!-- HEADER -->
          <tr>
            <td class="hero" style="padding:22px 30px;background:#e64a4a;">
              <p style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.2px;">Beacon</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="content" style="padding:34px 30px 22px;">
              <p class="headline" style="font-size:27px;font-weight:800;line-height:1.25;color:#17233a;margin:0 0 10px 0;letter-spacing:-0.3px;">
                Password Reset
              </p>
              <p class="body-copy" style="font-size:15px;color:#42526f;line-height:1.8;margin:0 0 22px 0;">
                Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" class="cta" style="display:block;background:#e64a4a;color:#ffffff;text-decoration:none;border-radius:12px;padding:14px 24px;font-size:14px;font-weight:700;letter-spacing:0.2px;text-align:center;box-shadow:0 8px 18px rgba(230,74,74,0.32);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p class="muted" style="font-size:12px;color:#61708d;line-height:1.75;margin:0 0 4px;">
                This link will expire in <strong style="color:#1f355c;">${expiryMinutes} minutes</strong> for security reasons.
              </p>
              <p class="small" style="font-size:12px;color:#6f7d96;line-height:1.7;margin:0;">
                If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer" style="background:#f7f9fd;padding:18px 30px;border-top:1px solid #e7edf7;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" class="small" style="font-size:11px;color:#6f7d96;">© 2026 Beacon · security & reliability</td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}