#include "server.h"

#include <nlohmann/json.hpp>

#include <iostream>

using json = nlohmann::json;

ExamHQServer::ExamHQServer(int port)
    : port(port) {
}

void ExamHQServer::configureRoutes() {

    // =========================================================
    // CORS
    // =========================================================

    CROW_ROUTE(app, "/api/health")
        .methods(crow::HTTPMethod::GET)
        ([] {

            crow::response response;

            response.code = 200;

            response.set_header(
                "Content-Type",
                "application/json"
            );

            response.set_header(
                "Access-Control-Allow-Origin",
                "*"
            );

            json data = {
                {"status", "ok"},
                {"service", "DPSH ExamHQ"},
                {"backend", "C++"},
                {"database", "Supabase PostgreSQL"}
            };

            response.body = data.dump();

            return response;
        });


    // =========================================================
    // API ROOT
    // =========================================================

    CROW_ROUTE(app, "/api")
        .methods(crow::HTTPMethod::GET)
        ([] {

            json data = {
                {"name", "DPSH ExamHQ API"},
                {"version", "1.0.0"},
                {"status", "running"},
                {"backend", "C++"},
                {"endpoints", {
                    "/api/health",
                    "/api/tasks",
                    "/api/teachers",
                    "/api/analytics",
                    "/api/reports"
                }}
            };

            crow::response response(
                200,
                data.dump()
            );

            response.set_header(
                "Content-Type",
                "application/json"
            );

            response.set_header(
                "Access-Control-Allow-Origin",
                "*"
            );

            return response;
        });


    // =========================================================
    // TASKS
    // =========================================================

    CROW_ROUTE(app, "/api/tasks")
        .methods(crow::HTTPMethod::GET)
        ([] {

            json data = {
                {"success", true},
                {"tasks", json::array()}
            };

            crow::response response(
                200,
                data.dump()
            );

            response.set_header(
                "Content-Type",
                "application/json"
            );

            response.set_header(
                "Access-Control-Allow-Origin",
                "*"
            );

            return response;
        });


    // =========================================================
    // TEACHERS
    // =========================================================

    CROW_ROUTE(app, "/api/teachers")
        .methods(crow::HTTPMethod::GET)
        ([] {

            json data = {
                {"success", true},
                {"teachers", json::array()}
            };

            crow::response response(
                200,
                data.dump()
            );

            response.set_header(
                "Content-Type",
                "application/json"
            );

            response.set_header(
                "Access-Control-Allow-Origin",
                "*"
            );

            return response;
        });


    // =========================================================
    // ANALYTICS
    // =========================================================

    CROW_ROUTE(app, "/api/analytics")
        .methods(crow::HTTPMethod::GET)
        ([] {

            json data = {
                {"success", true},
                {"totalTasks", 0},
                {"completedTasks", 0},
                {"pendingTasks", 0},
                {"overdueTasks", 0}
            };

            crow::response response(
                200,
                data.dump()
            );

            response.set_header(
                "Content-Type",
                "application/json"
            );

            response.set_header(
                "Access-Control-Allow-Origin",
                "*"
            );

            return response;
        });


    // =========================================================
    // REPORTS
    // =========================================================

    CROW_ROUTE(app, "/api/reports")
        .methods(crow::HTTPMethod::GET)
        ([] {

            json data = {
                {"success", true},
                {"reports", json::array()}
            };

            crow::response response(
                200,
                data.dump()
            );

            response.set_header(
                "Content-Type",
                "application/json"
            );

            response.set_header(
                "Access-Control-Allow-Origin",
                "*"
            );

            return response;
        });
}


// =============================================================
// START SERVER
// =============================================================

void ExamHQServer::start() {

    configureRoutes();

    std::cout
        << "========================================\n"
        << "          DPSH ExamHQ Backend\n"
        << "========================================\n"
        << "Backend: C++ / Crow\n"
        << "Database: Supabase PostgreSQL\n"
        << "Port: " << port << "\n"
        << "========================================\n";

    app
        .port(port)
        .multithreaded()
        .run();
}