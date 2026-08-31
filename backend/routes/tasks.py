from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Task
from schemas import TaskCreate, TaskResponse


router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"]
)


@router.get(
    "/",
    response_model=list[TaskResponse]
)
def get_tasks(
    db: Session = Depends(get_db)
):

    return db.query(Task).order_by(
        Task.id
    ).all()


@router.post(
    "/",
    response_model=TaskResponse
)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db)
):

    task = Task(
        teacher_id=task_data.teacher_id,
        title=task_data.title,
        deadline=task_data.deadline,
        status=task_data.status
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.post("/{task_id}/complete")
def complete_task(
    task_id: int,
    db: Session = Depends(get_db)
):

    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task.status = "Completed"

    db.commit()
    db.refresh(task)

    return {
        "message": "Task completed",
        "task": task
    }