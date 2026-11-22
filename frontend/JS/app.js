
import { supabase } from "./supabase.js";
import { api } from "./api.js";

import { toast } from "./ui.js";

import { renderDashboard } from "./dashboard.js";
import { renderTasks } from "./tasks.js";
import { renderTeachers } from "./teachers.js";
import { renderReports } from "./reports.js";

const $ = selector => document.querySelector(selector);

const authScreen = $("#auth-screen");
const appScreen = $("#app-screen");
const main = $("#main-content");

const pageTitles = {
    dashboard: "Dashboard",
    tasks: "Tasks",
    teachers: "Teachers",
    reports: "Reports"
};

let currentUser = null;
let authMode = "login";
let currentPage = "dashboard";
let loadingPromise = null;
let resettingPassword = false;


// ============================================================
// AUTHENTICATION UI
// ============================================================

function showAuth() {
    currentUser = null;

    authScreen.hidden = false;
    appScreen.hidden = true;

    $("#auth-form").hidden = false;
    $("#password-reset-form").hidden = true;

    setAuthMode("login");
}

function authMessage(message, type = "") {
    const element = $("#auth-message");

    element.textContent = message;
    element.className = `message ${type}`;
}

function setAuthMode(mode) {
    authMode = mode;

    const signup = mode === "signup";

    $("#auth-heading").textContent = signup
        ? "Create your account."
        : "Welcome back.";

    $("#auth-description").textContent = signup
        ? "Set up your ExamHQ workspace."
        : "Sign in to continue to your workspace.";

    $("#auth-submit").textContent = signup
        ? "Create account"
        : "Sign in";

    $("#auth-switch-text").textContent = signup
        ? "Already have an account?"
        : "Don't have an account?";

    $("#auth-mode-button").textContent = signup
        ? "Sign in"
        : "Create one";

    $("#full-name-field").hidden = !signup;
    $("#forgot-password").hidden = signup;

    $("#password").autocomplete = signup
        ? "new-password"
        : "current-password";

    authMessage("");
}

$("#auth-mode-button").addEventListener("click", () => {
    setAuthMode(
        authMode === "login" ? "signup" : "login"
    );
});


// ============================================================
// SIGN IN / SIGN UP
// ============================================================

$("#auth-form").addEventListener("submit", async event => {
    event.preventDefault();

    const button = $("#auth-submit");

    const email = $("#email").value.trim();
    const password = $("#password").value;

    const originalText = authMode === "signup"
        ? "Create account"
        : "Sign in";

    button.disabled = true;
    button.textContent = "Please wait...";

    authMessage("");

    try {
        if (authMode === "signup") {
            const fullName = $("#full-name").value.trim();

            if (!fullName) {
                throw new Error("Enter your full name.");
            }

            const { data, error } =
                await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                });

            if (error) throw error;

            if (data.session) {
                await loadApplication();
            } else {
                authMessage(
                    "Account created. Check your email to verify your address, then sign in.",
                    "success"
                );
            }

        } else {
            const { error } =
                await supabase.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) throw error;

            await loadApplication();
        }

    } catch (error) {
        authMessage(error.message, "error");
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
});


// ============================================================
// PASSWORD RECOVERY
// ============================================================

$("#forgot-password").addEventListener("click", async () => {
    const email = $("#email").value.trim();

    if (!email) {
        authMessage(
            "Enter your email address first.",
            "error"
        );
        return;
    }

    try {
        const { error } =
            await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin
            });

        if (error) throw error;

        authMessage(
            "Password reset instructions have been sent to your email.",
            "success"
        );

    } catch (error) {
        authMessage(error.message, "error");
    }
});

function showPasswordReset() {
    resettingPassword = true;

    authScreen.hidden = false;
    appScreen.hidden = true;

    $("#auth-form").hidden = true;
    $("#password-reset-form").hidden = false;

    authMessage("Choose a new password.");
}

$("#password-reset-form").addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const button = event.currentTarget.querySelector("button");
        const password = $("#new-password").value;

        button.disabled = true;
        button.textContent = "Updating...";

        try {
            const { error } =
                await supabase.auth.updateUser({
                    password
                });

            if (error) throw error;

            resettingPassword = false;

            authMessage(
                "Password updated successfully.",
                "success"
            );

            await loadApplication();

        } catch (error) {
            authMessage(error.message, "error");
        } finally {
            button.disabled = false;
            button.textContent = "Update password";
        }
    }
);


// ============================================================
// LOAD APPLICATION
// ============================================================

async function loadApplication() {
    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = (async () => {
        try {
            currentUser = await api("/me");

            authScreen.hidden = true;
            appScreen.hidden = false;

            $("#user-name").textContent =
                currentUser.full_name;

            $("#user-role").textContent =
                currentUser.role;

            $("#user-avatar").textContent =
                (currentUser.full_name || "U")
                    .charAt(0)
                    .toUpperCase();

            document.querySelectorAll(".admin-only")
                .forEach(element => {
                    element.hidden =
                        currentUser.role !== "admin";
                });

            await navigate("dashboard");

        } catch (error) {
            await supabase.auth.signOut();

            showAuth();

            authMessage(
                error.message || "Unable to load your account.",
                "error"
            );
        }
    })();

    try {
        await loadingPromise;
    } finally {
        loadingPromise = null;
    }
}


// ============================================================
// NAVIGATION
// ============================================================

document.querySelectorAll(".nav-button")
    .forEach(button => {
        button.addEventListener("click", () => {
            void navigate(button.dataset.page);
        });
    });

async function navigate(page) {
    if (!pageTitles[page] || !currentUser) {
        return;
    }

    if (
        ["teachers", "reports"].includes(page) &&
        currentUser.role !== "admin"
    ) {
        toast("You do not have permission to view this page.");
        return;
    }

    currentPage = page;

    $("#page-title").textContent = pageTitles[page];

    document.querySelectorAll(".nav-button")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.page === page
            );
        });

    main.innerHTML = `
        <div class="loading-state">
            <div class="loader"></div>
            <p>Loading ${pageTitles[page]}...</p>
        </div>
    `;

    try {
        let html;

        switch (page) {
            case "dashboard":
                html = await renderDashboard(currentUser);
                break;

            case "tasks":
                html = await renderTasks(currentUser);
                break;

            case "teachers":
                html = await renderTeachers();
                break;

            case "reports":
                html = await renderReports();
                break;

            default:
                return;
        }

        main.innerHTML = html;

    } catch (error) {
        main.innerHTML = `
            <section class="content-panel error-panel">
                <span class="eyebrow">SOMETHING WENT WRONG</span>
                <h2>Unable to load this page.</h2>
                <p>${error.message.replace(/[<>&"']/g, "")}</p>

                <button
                    class="primary-button"
                    data-retry
                >
                    Try again
                </button>
            </section>
        `;
    }
}


// ============================================================
// PAGE ACTIONS
// ============================================================

main.addEventListener("click", async event => {
    const pageButton = event.target.closest("[data-open-page]");

    if (pageButton) {
        await navigate(pageButton.dataset.openPage);
        return;
    }

    const retryButton = event.target.closest("[data-retry]");

    if (retryButton) {
        await navigate(currentPage);
        return;
    }

    const completeButton = event.target.closest("[data-complete]");

    if (completeButton) {
        const id = completeButton.dataset.complete;

        completeButton.disabled = true;
        completeButton.textContent = "Updating...";

        try {
            await api(`/tasks/${id}/complete`, {
                method: "PATCH"
            });

            toast("Task marked as completed.", "success");

            await navigate(currentPage);

        } catch (error) {
            toast(error.message, "error");

            completeButton.disabled = false;
            completeButton.textContent = "Mark complete";
        }
    }
});


// ============================================================
// CREATE TASK
// ============================================================

main.addEventListener("submit", async event => {
    if (event.target.id !== "create-task-form") {
        return;
    }

    event.preventDefault();

    const form = event.target;
    const data = new FormData(form);

    const payload = {
        title: data.get("title"),
        description: data.get("description"),
        deadline: data.get("deadline"),
        teacher_id: data.get("teacher_id")
    };

    const button = form.querySelector("button[type=submit]");

    button.disabled = true;
    button.textContent = "Creating...";

    try {
        await api("/tasks", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        toast("Task created successfully.", "success");

        await navigate("tasks");

    } catch (error) {
        toast(error.message, "error");

        button.disabled = false;
        button.textContent = "+ Create task";
    }
});


// ============================================================
// LOGOUT
// ============================================================

$("#logout-button").addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        toast(error.message, "error");
    }
});


// ============================================================
// SUPABASE AUTH EVENTS
// ============================================================

supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
        showPasswordReset();
        return;
    }

    if (session && !resettingPassword) {
        queueMicrotask(() => {
            void loadApplication();
        });
    }

    if (!session && event !== "INITIAL_SESSION") {
        showAuth();
    }
});


// ============================================================
// STARTUP
// ============================================================

async function initialize() {
    const {
        data: { session },
        error
    } = await supabase.auth.getSession();

    if (error) {
        showAuth();
        authMessage(error.message, "error");
        return;
    }

    if (session) {
        await loadApplication();
    } else {
        showAuth();
    }
}

void initialize();

