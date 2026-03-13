import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_email(to: str, subject: str, body_html: str) -> bool:
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER', '')
    smtp_pass = os.getenv('SMTP_PASS', '')

    if not smtp_user or not smtp_pass:
        print(f'[EMAIL MOCK] To: {to} | Subject: {subject}')
        return True  # Mock success when not configured

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = smtp_user
        msg['To'] = to
        msg.attach(MIMEText(body_html, 'html'))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, to, msg.as_string())
        return True
    except Exception as e:
        print(f'[EMAIL ERROR] {e}')
        return False


def send_alert_digest(to: str, alerts: list) -> bool:
    rows = ''.join(
        f'<tr><td style="padding:8px;border-bottom:1px solid #eee">{a["title"]}</td>'
        f'<td style="padding:8px;border-bottom:1px solid #eee;color:{"#e05c5c" if a["type"]=="critical" else "#f5a623"}">'
        f'{a["type"].upper()}</td></tr>'
        for a in alerts
    )
    body = f'''
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1a1a2e">AXIS Alert Digest</h2>
      <p style="color:#666">The following alerts require your attention:</p>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr>
          <th style="padding:8px;text-align:left;background:#f5f5f5">Alert</th>
          <th style="padding:8px;text-align:left;background:#f5f5f5">Severity</th>
        </tr></thead>
        <tbody>{rows}</tbody>
      </table>
      <p style="color:#999;font-size:12px;margin-top:24px">AXIS Central Intelligence System</p>
    </div>
    '''
    return send_email(to, f'AXIS Alert Digest — {len(alerts)} alerts', body)
