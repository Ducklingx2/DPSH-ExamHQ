
#include "database.h"

#include <stdexcept>
#include <utility>

Database::Database(const std::string& connectionString)
    : connectionString(connectionString),
      connected(false) {

    if (this->connectionString.empty()) {
        throw std::invalid_argument(
            "DATABASE_URL is empty."
        );
    }

    connection =
        std::make_unique<pqxx::connection>(
            this->connectionString
        );

    connected = connection->is_open();

    if (!connected) {
        throw std::runtime_error(
            "Could not connect to Neon PostgreSQL."
        );
    }
}

bool Database::isConnected() const {
    std::lock_guard<std::mutex> lock(connectionMutex);

    return connection && connection->is_open();
}

pqxx::result Database::query(const std::string& sql) {
    std::lock_guard<std::mutex> lock(connectionMutex);

    if (!connection || !connection->is_open()) {
        throw std::runtime_error(
            "Database connection is not open."
        );
    }

    pqxx::work transaction(*connection);

    pqxx::result result = transaction.exec(sql);

    transaction.commit();

    return result;
}

void Database::execute(const std::string& sql) {
    std::lock_guard<std::mutex> lock(connectionMutex);

    if (!connection || !connection->is_open()) {
        throw std::runtime_error(
            "Database connection is not open."
        );
    }

    pqxx::work transaction(*connection);

    transaction.exec(sql);

    transaction.commit();
}
