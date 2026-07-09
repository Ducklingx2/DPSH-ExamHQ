package handlers

import (
	"encoding/json"
	"net/http"

	"examhq/models"
)

var Tasks = []models.Task{}

func GetTasks(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(Tasks)

}

func CreateTask(w http.ResponseWriter, r *http.Request) {

	var task models.Task

	err := json.NewDecoder(r.Body).Decode(&task)

	if err != nil {

		http.Error(w, "Invalid JSON", http.StatusBadRequest)

		return

	}

	task.ID = len(Tasks) + 1

	if task.Status == "" {
		task.Status = "Pending"
	}

	Tasks = append(Tasks, task)

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(task)

}
