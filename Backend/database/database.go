package database

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func Connect() {
	var err error

	DB, err = sql.Open("sqlite", "examhq.db")
	if err != nil {
		log.Fatal(err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal(err)
	}

	createTables()

	log.Println("Database connected.")
}

func createTables() {

	query := `
	CREATE TABLE IF NOT EXISTS teachers (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		email TEXT,
		subject TEXT
	);

	CREATE TABLE IF NOT EXISTS tasks (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		teacherId INTEGER,
		title TEXT NOT NULL,
		deadline TEXT,
		status TEXT,
		FOREIGN KEY (teacherId) REFERENCES teachers(id)
	);
	`

	_, err := DB.Exec(query)

	if err != nil {
		log.Fatal(err)
	}

}