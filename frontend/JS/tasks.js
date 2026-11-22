
import { api } from "./api.js";

import {
    escapeHTML,
    renderTaskCard,
    emptyState
} from "./ui.js";

export async function renderTasks(user) {
    const tasks = await api("/tasks");

    let teachers = [];

    if (user.role === "admin") {
        teachers = await api("/teachers");
    }

    const creationForm = user.role === "admin"
        ? `
            <section class="content-panel">

                <div class="section-heading">
                    <div>
                        <span class="eyebrow">TASK MANAGEMENT</span>
                        <h2>Create a task</h2>
                        <p class="muted">
                            Assign a new responsibility.
                        </p>
                    </div>
                </div>

                <form id="create-task-form">

                    <div class="form-grid">

                        <div class="field field-wide">
                            <label for="task-title">
                                Task title
                            </label>

                            <input
                                id="task-title"
                                name="title"
                                maxlength="160"
                                placeholder="Question Paper Submission"
                                required
                            >
                        </div>

                        <div class="field">
                            <label for="task-teacher">
                                Assign teacher
                            </label>

                            <select
                                id="task-teacher"
                                name="teacher_id"
                                required
                            >
                                <option value="">
                                    Select teacher
                                </option>

                                ${teachers.map(teacher => `
                                    <option value="${escapeHTML(teacher.id)}">
                                        ${escapeHTML(teacher.full_name)}
                                    </option>
                                `).join("")}
                            </select>
                        </div>

                        <div class="field">
                            <label for="task-deadline">
                                Deadline
                            </label>

                            <input
                                id="task-deadline"
                                name="deadline"
                                type="date"
                                required
                            >
                        </div>

                        <div class="field field-wide">
                            <label for="task-description">
                                Description
                            </label>

                            <textarea
                                id="task-description"
                                name="description"
                                rows="3"
                                placeholder="Additional instructions..."
                            ></textarea>
                        </div>

                    </div>

                    <div class="form-actions">
                        <button
                            class="primary-button"
                            type="submit"
                        >
                            + Create task
                        </button>
                    </div>

                </form>

            </section>
        `
        : "";

    return `
        ${creationForm}

        <section class="content-panel">

            <div class="section-heading">
                <div>
                    <span class="eyebrow">YOUR WORKLOAD</span>

                    <h2>
                        ${user.role === "admin" ? "All tasks" : "My tasks"}
                    </h2>

                    <p class="muted">
                        ${tasks.length} task(s) found.
                    </p>
                </div>
            </div>

            <div class="task-list">
                ${
                    tasks.length
                        ? tasks.map(task =>
                            renderTaskCard(
                                task,
                                user.role === "admin"
                            )
                        ).join("")
                        : emptyState(
                            "Nothing here yet",
                            "There are no tasks to display."
                        )
                }
            </div>

        </section>
    `;
}

