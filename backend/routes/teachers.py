from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Teacher
from schemas import TeacherCreate, TeacherResponse


router = APIRouter(
    prefix="/api/teachers",
    tags=["Teachers"]
)


@router.get(
    "/",
    response_model=list[TeacherResponse]
)
def get_teachers(
    db: Session = Depends(get_db)
):

    return db.query(Teacher).order_by(
        Teacher.id
    ).all()


@router.post(
    "/",
    response_model=TeacherResponse
)
def create_teacher(
    teacher_data: TeacherCreate,
    db: Session = Depends(get_db)
):

    teacher = Teacher(
        name=teacher_data.name,
        department=teacher_data.department,
        subject=teacher_data.subject,
        email=teacher_data.email
    )

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    return teacher