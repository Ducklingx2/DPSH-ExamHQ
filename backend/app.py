from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

from routes import tasks
from routes import teachers
from routes import analytics
from routes import reports


app = FastAPI(
    title="ExamHQ API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Register routes
app.include_router(tasks.router)
app.include_router(teachers.router)
app.include_router(analytics.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {
        "message": "ExamHQ API is running"
    }