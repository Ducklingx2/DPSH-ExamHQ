from fastapi import APIRouter


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"]
)


@router.get("/")
def get_reports():

    return {
        "message": "Report system ready"
    }