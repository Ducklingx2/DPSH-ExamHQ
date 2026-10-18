#include "server.h"

#include <cstdlib>
#include <iostream>
#include <string>

int main() {

    std::cout << "========================================\n";
    std::cout << "          DPSH ExamHQ Backend\n";
    std::cout << "========================================\n";

    const char* portEnvironment = std::getenv("PORT");

    int port = 8080;

    if (portEnvironment != nullptr) {
        try {
            port = std::stoi(portEnvironment);
        }
        catch (...) {
            std::cerr << "Invalid PORT environment variable.\n";
            std::cerr << "Falling back to port 8080.\n";
            port = 8080;
        }
    }

    std::cout << "Starting server on port " << port << "...\n";

    try {

        ExamHQServer server(port);

        server.start();

    }
    catch (const std::exception& error) {

        std::cerr << "\nSERVER ERROR:\n";
        std::cerr << error.what() << "\n";

        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}