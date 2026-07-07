package handlers

import (
	"encoding/json"
	"net/http"
)

func GetTasks(w http.ResponseWriter, r *http.Request) {

	tasks := []map[string]interface{}{

		{
			"id": 1,
			"title": "Question Paper Submission",
			"status": "Pending",
		},

	}

	json.NewEncoder(w).Encode(tasks)

}
