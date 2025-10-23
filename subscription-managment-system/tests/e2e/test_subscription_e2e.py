import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_and_get_subscription():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Create a subscription
        response = await ac.post("/subscriptions/", json={
            "user_email": "test@example.com",
            "plan_name": "Pro",
            "end_date": "2099-12-31T00:00:00"
        })
        assert response.status_code == 200
        data = response.json()
        sub_id = data["id"]

        # Get the subscription
        response = await ac.get(f"/subscriptions/{sub_id}")
        assert response.status_code == 200
        assert response.json()["user_email"] == "test@example.com"