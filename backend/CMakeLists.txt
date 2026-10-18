
cmake_minimum_required(VERSION 3.20)

project(ExamHQ
    VERSION 1.0
    LANGUAGES CXX
)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# =========================================================
# Dependencies
# =========================================================

find_package(Crow CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(libpqxx CONFIG REQUIRED)

# =========================================================
# Executable
# =========================================================

add_executable(examhq
    src/main.cpp
    src/server.cpp
    src/database.cpp
)

# =========================================================
# Libraries
# =========================================================

target_link_libraries(examhq
    PRIVATE
        Crow::Crow
        nlohmann_json::nlohmann_json
        pqxx
)

# =========================================================
# Compiler warnings
# =========================================================

if(MSVC)
    target_compile_options(examhq PRIVATE
        /W4
        /permissive-
    )
else()
    target_compile_options(examhq PRIVATE
        -Wall
        -Wextra
        -Wpedantic
    )
endif()

# =========================================================
# Output
# =========================================================

set_target_properties(examhq PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)
