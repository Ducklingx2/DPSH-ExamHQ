#pragma once

#include <crow.h>

#include <string>

class ExamHQServer {

public:

    explicit ExamHQServer(int port);

    void start();

private:

    int port;

    crow::SimpleApp app;

    void configureRoutes();
};