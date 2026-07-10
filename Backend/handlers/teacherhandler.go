package handlers

import (
	"encoding/json"
	"net/http"

	"examhq/database"
	"examhq/models"
)

func GetTeachers(w http.ResponseWriter, r *http.Request) {

	rows, err := database.DB.Query(`
		SELECT id, name, email, subject
		FROM teachers
		ORDER BY id
	`)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	teachers := []models.Teacher{}

	for rows.Next() {

		var teacher models.Teacher

		err := rows.Scan(
			&teacher.ID,
			&teacher.Name,
			&teacher.Email,
			&teacher.Subject,
		)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		teachers = append(teachers, teacher)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teachers)
}

func CreateTeacher(w http.ResponseWriter, r *http.Request) {

	var teacher models.Teacher

	err := json.NewDecoder(r.Body).Decode(&teacher)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := database.DB.Exec(`
		INSERT INTO teachers
		(name, email, subject)
		VALUES (?, ?, ?)
	`,
		teacher.Name,
		teacher.Email,
		teacher.Subject,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	id, _ := result.LastInsertId()
	teacher.ID = int(id)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teacher)
}