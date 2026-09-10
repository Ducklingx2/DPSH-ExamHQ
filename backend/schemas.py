from pydantic import BaseModel, ConfigDict, Field


class TeacherCreate(BaseModel):
    name: str
    department: str = ""
    subject: str = ""
    email: str = ""


class TeacherResponse(BaseModel):
    id: int
    name: str
    department: str
    subject: str
    email: str

    model_config = ConfigDict(
        from_attributes=True
    )


class TaskCreate(BaseModel):
    teacherId: int
    title: str
    deadline: str = ""
    status: str = "Pending"


class TaskResponse(BaseModel):
    id: int

    teacherId: int = Field(
        validation_alias="teacher_id"
    )

    title: str
    deadline: str
    status: str

    fileName: str = Field(
        default="",
        validation_alias="file_name"
    )

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )