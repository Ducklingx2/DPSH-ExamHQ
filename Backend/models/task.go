package models

type Task struct {
	ID        int    `json:"id"`
	TeacherID int    `json:"teacherId"`
	Title     string `json:"title"`
	Deadline  string `json:"deadline"`
	Status    string `json:"status"`
}
