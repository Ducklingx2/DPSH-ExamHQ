package handlers

import (
	"encoding/json"
	"net/http"

	"examhq/database"
	"examhq/models"
)

func GetTasks(w http.ResponseWriter, r *http.Request) {

	rows, err := database.DB.Query(`
	SELECT id, teacherId, title, deadline, status
	FROM tasks
	ORDER BY id
`)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	var tasks []models.Task

	for rows.Next() {

		var task models.Task

		err := rows.Scan(
			&task.ID,
			&task.TeacherID,
			&task.Title,
			&task.Deadline,
			&task.Status,
		)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		tasks = append(tasks, task)

	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)

}

func CreateTask(w http.ResponseWriter, r *http.Request) {

	var task models.Task

	err := json.NewDecoder(r.Body).Decode(&task)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := database.DB.Exec(
		`INSERT INTO tasks
		(teacherId, title, deadline, status)
		VALUES (?, ?, ?, ?)`,
		task.TeacherID,
		task.Title,
		task.Deadline,
		task.Status,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	id, _ := result.LastInsertId()
	task.ID = int(id)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)

}