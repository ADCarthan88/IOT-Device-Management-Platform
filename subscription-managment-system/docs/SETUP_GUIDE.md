# Subscription Management System Setup Guide

## Prerequisites
- Python 3.8+
- PostgreSQL or MySQL database
- SMTP credentials for email alerts

## Installation
1. Clone the repository
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Configure environment variables in `app/core/config.py`:
   - Database URL
   - SMTP server, port, username, password

## Usage
- Start the FastAPI app:
   ```sh
   uvicorn app.main:app --reload
   ```
- API endpoints:
   - `POST /subscriptions/` : Create subscription
   - `PUT /subscriptions/{id}` : Update subscription
   - `POST /subscriptions/{id}/renew` : Renew subscription
   - `GET /subscriptions/{id}` : Get subscription
   - `GET /subscriptions/{id}/status` : Check status

## Automated Expiry & Email Alerts
- APScheduler runs daily to auto-expire subscriptions and send email alerts.
- Ensure scheduler is started in your app's startup event.

## Testing
- Use the endpoints with tools like Postman or curl.
- Check email inbox for alerts.

## Support
- For issues, open a ticket or contact the maintainer.
