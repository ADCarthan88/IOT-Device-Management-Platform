import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from typing import List

class EmailService:
    
    @staticmethod
    def send_email(to_email: str, subject: str, body: str) -> bool:
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.smtp_username
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(settings.smtp_server, settings.smtp_port)
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)
            server.quit()
            return True
        except Exception as e:
            print(f"Email sending failed: {e}")
            return False
    
    @staticmethod
    def send_expiry_warning(email: str, plan_name: str, days_left: int) -> bool:
        subject = f"Subscription Expiry Warning - {plan_name}"
        body = f"""
Dear Subscriber,

Your {plan_name} subscription will expire in {days_left} days.
Please renew your subscription to continue enjoying our services.

Thank you!
"""
        return EmailService.send_email(email, subject, body)
    
    @staticmethod
    def send_expiry_notification(email: str, plan_name: str) -> bool:
        subject = f"Subscription Expired - {plan_name}"
        body = f"""
Dear Subscriber,

Your {plan_name} subscription has expired.
Please renew your subscription to restore access to our services.

Thank you!
"""
        return EmailService.send_email(email, subject, body)