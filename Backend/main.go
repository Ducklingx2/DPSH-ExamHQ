package main

import (
	"log"
	"net/http"

	"examhq/Handlers"
)

func main() {

	http.Handle("/", http.FileServer(http.Dir("../frontend")))

	http.HandleFunc("/api/tasks", func(w http.ResponseWriter, r *http.Request) {

	if r.Method == http.MethodGet {

		Handlers.GetTasks(w, r)

		return

	}

	if r.Method == http.MethodPost {

		Handlers.CreateTask(w, r)

		return

	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)

})
		switch r.Method {

		case http.MethodGet:
			handlers.GetTasks(w, r)

		case http.MethodPost:
			handlers.CreateTask(w, r)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)

		}

	})

	log.Println("Server running on http://localhost:8080")

	log.Fatal(http.ListenAndServe(":8080", nil))

}
