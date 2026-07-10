package main

import (
	"log"
	"net/http"

	"examhq/handlers"
	"examhq/database"
)

func main() {

	database.Connect()

	http.Handle("/", http.FileServer(http.Dir("../frontend")))

	http.HandleFunc("/api/tasks", func(w http.ResponseWriter, r *http.Request) {

		if r.Method == http.MethodGet {
			handlers.GetTasks(w, r)
			return
		}

		if r.Method == http.MethodPost {
			handlers.CreateTask(w, r)
			return
		}

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	})

	http.HandleFunc("/api/teachers", func(w http.ResponseWriter, r *http.Request) {

		switch r.Method {

		case http.MethodGet:
			handlers.GetTeachers(w, r)

		case http.MethodPost:
			handlers.CreateTeacher(w, r)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}

	})

	log.Println("Server running on http://localhost:8080")

	log.Fatal(http.ListenAndServe(":8080", nil))
}