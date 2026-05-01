const buildVerifyPage = ({ success, title, message, showResend = false }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const loginUrl = `${clientUrl}/signin`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title} — Beacon.</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #0a0a0a;
      color: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
 
    .card {
      background: #121212;
      border: 1px solid #2a2a2a;
      box-shadow: 0 14px 34px rgba(0,0,0,0.55);
      border-radius: 20px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
 
    /* logo */
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 36px;
    }
    .logo-icon {
      width: 34px;
      height: 34px;
      background: #528dff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-name {
      font-size: 18px;
      font-weight: 700;
      color: #f5f5f5;
      letter-spacing: -0.3px;
    }
 
    /* status icon */
    .icon-wrap {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
      .icon-wrap.success { background: rgba(82,141,255,0.14); border: 1px solid rgba(82,141,255,0.32); }
    .icon-wrap.error   { background: rgba(199,62,58,0.10); border: 1px solid rgba(199,62,58,0.22); }
 
    h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.4px;
      margin-bottom: 10px;
      color: #f5f5f5;
    }
 
    p {
      font-size: 14px;
      color: #b9bcc4;
      line-height: 1.7;
      margin-bottom: 28px;
    }
 
    /* buttons */
    .btn {
      display: inline-block;
      padding: 12px 28px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      font-family: inherit;
      transition: transform 0.15s, opacity 0.15s;
    }
    .btn:hover { opacity: 0.92; transform: translateY(-1px); }
      .btn-primary { background: #528dff; color: #fff; }
    .btn-ghost {
      background: rgba(82,141,255,0.08);
      color: #c2cad8;
      border: 1px solid rgba(82,141,255,0.28);
      margin-top: 12px;
    }
 
    /* resend form */
    .resend-form {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .resend-form input {
      background: #1a1a1a;
      border: 1px solid #303030;
      border-radius: 10px;
      padding: 11px 14px;
      font-size: 13px;
      color: #f5f5f5;
      font-family: inherit;
      outline: none;
      width: 100%;
      text-align: center;
    }
    .resend-form input::placeholder { color: #7f8491; }
    .resend-form input:focus { border-color: rgba(124,144,130,0.6); }
 
    .divider {
      width: 100%;
      height: 1px;
      background: #2a2a2a;
      margin: 24px 0;
    }
 
    .footer-text {
      font-size: 12px;
      color: #7f8491;
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="card">
 
    <!-- logo -->
    <div class="logo">
      <div class="logo-icon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="4" fill="none" stroke="#fff" stroke-width="2"/>
          <circle cx="9" cy="9" r="1.4" fill="#fff"/>
          <line x1="9" y1="2" x2="9" y2="5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="9" y1="13" x2="9" y2="16" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="2" y1="9" x2="5" y2="9" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="13" y1="9" x2="16" y2="9" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="logo-name">Beacon</span>
    </div>
 
    <!-- status icon -->
    <div class="icon-wrap ${success ? 'success' : 'error'}">
      ${success
        ? `<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M8 16.5L13.5 22L24 11" stroke="#528dff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>`
        : `<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
             <path d="M11 11L21 21M21 11L11 21" stroke="#c73e3a" stroke-width="2.5" stroke-linecap="round"/>
           </svg>`
      }
    </div>
 
    <h1>${title}</h1>
    <p>${message}</p>
 
    ${success ? `
      <a href="${loginUrl}" class="btn btn-primary">
        Go to login →
      </a>
    ` : ''}
 
    ${showResend ? `
      <form class="resend-form" action="/api/auth/resend-verification" method="POST">
        <input
          type="email"
          name="email"
          placeholder="Enter your email to resend"
          required
        />
        <button type="submit" class="btn btn-primary">Resend verification email</button>
      </form>
      <a href="${clientUrl}" class="btn btn-ghost">Back to home</a>
    ` : ''}
 
    ${!success && !showResend ? `
      <a href="${clientUrl}" class="btn btn-ghost">Back to home</a>
    ` : ''}
 
    <div class="divider"></div>
    <p class="footer-text">© 2026 Beacon. · All rights reserved</p>
 
  </div>
</body>
</html>
`
}

export default buildVerifyPage