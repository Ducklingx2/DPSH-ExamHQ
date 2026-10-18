
#pragma once

#include <pqxx/pqxx>

#include <memory>
#include <mutex>
#include <string>

class Database {
public:
    explicit Database(const std::string& connectionString);

    bool isConnected() const;

    pqxx::result query(const std::string& sql);

    void execute(const std::string& sql);

private:
    std::string connectionString;
    bool connected;

    std::unique_ptr<pqxx::connection> connection;
    mutable std::mutex connectionMutex;
};
