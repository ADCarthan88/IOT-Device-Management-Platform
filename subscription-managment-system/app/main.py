from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter

router = APIRouter()
app = FastAPI()
# ...exsiting code...


@router.get("/health")
def health_check():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourfrontend.com"], # Set to your frontend domain(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)