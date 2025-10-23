# Subscription Management System

A modern, lightweight backend for managing user subscriptions, built with FastAPI, SQLAlchemy, and PostgreSQL. Includes automated expiry logic, email notifications, and production-ready Docker/Nginx deployment.

---

## Features
- **RESTful API**: Create, update, renew, and check subscriptions
- **Automated Expiry**: Subscriptions auto-expire after their end date
- **Email Alerts**: Sends notifications before and after expiration (SMTP)
- **Background Tasks**: Uses APScheduler for scheduled jobs
- **Docker & Nginx**: Ready for scalable deployment
- **Security**: JWT-ready, CORS, and environment variable support
- **Testing**: Includes e2e test example with pytest & httpx

---

## Quick Start

### 1. Clone the Repository
```
git clone https://github.com/ADCarthan88/Subscription--Management.git
cd Subscription--Management
```

### 2. Configure Environment
Create a `.env` file in the root:
```
DATABASE_URL=postgresql+psycopg2://subs_user:yourpassword@db/subscriptions_db
SMTP_SERVER=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USERNAME=your@email.com
SMTP_PASSWORD=yourpassword
SECRET_KEY=your-very-secret-key
```

### 3. Build and Run with Docker Compose
```
docker-compose -f infrastructure/docker/docker-compose.yml up --build
```
- App: http://localhost:8000
- Docs: http://localhost:8000/docs
- Nginx: http://localhost/

### 4. Run Locally (Dev)
```
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## API Endpoints
- `POST /subscriptions/` : Create subscription
- `PUT /subscriptions/{id}` : Update subscription
- `POST /subscriptions/{id}/renew` : Renew subscription
- `GET /subscriptions/{id}` : Get subscription
- `GET /subscriptions/{id}/status` : Check status
- `GET /health` : Health check

---

## Automated Expiry & Email Alerts
- APScheduler runs daily to auto-expire subscriptions and send email alerts.
- Ensure SMTP credentials are set in your environment.

---

## Testing
- Example e2e test: `tests/e2e/test_subscription_e2e.py`
- Run: `pytest tests/e2e/`

---

## Deployment
- Production-ready Dockerfile and Nginx config in `infrastructure/`
- Use Docker Compose for local or cloud deployment
- Supports PostgreSQL out of the box

---

## Security & Scalability
- CORS middleware enabled
- JWT authentication ready (see `app/utils/auth.py`)
- Logging and health check endpoints included
- Easily extendable for more features

---

## Contributing
Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

---

## License
MIT License
