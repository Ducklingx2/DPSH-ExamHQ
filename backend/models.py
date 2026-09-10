from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Teacher(Base):

    __tablename__ = "teachers"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100)
    )

    department: Mapped[str] = mapped_column(
        String(100),
        default=""
    )

    subject: Mapped[str] = mapped_column(
        String(100),
        default=""
    )

    email: Mapped[str] = mapped_column(
        String(255),
        default=""
    )


class Task(Base):

    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    teacher_id: Mapped[int]

    title: Mapped[str] = mapped_column(
        String(255)
    )

    deadline: Mapped[str] = mapped_column(
        String(20),
        default=""
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="Pending"
    )

    file_name: Mapped[str] = mapped_column(
        String(255),
        default=""
    )