from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Task


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


@router.get("/")
def get_analytics(
    db: Session = Depends(get_db)
):

    tasks = db.query(Task).all()

    total = len(tasks)

    completed = sum(
        1
        for task in tasks
        if task.status == "Completed"
    )

    pending = sum(
        1
        for task in tasks
        if task.status == "Pending"
    )

    overdue = sum(
        1
        for task in tasks
        if task.status == "Overdue"
    )

    completion_rate = (
        completed / total * 100
        if total
        else 0
    )

    return {
        "totalTasks": total,
        "completed": completed,
        "pending": pending,
        "overdue": overdue,
        "completionRate": round(
            completion_rate,
            2
        )
    }