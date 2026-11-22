
import { api } from "./api.js";

import {
    escapeHTML,
    statCard,
    renderTaskCard,
    emptyState
} from "./ui.js";

export async function renderDashboard(user) {
    const [stats, tasks] = await Promise.all([
        api("/dashboard"),
        api("/tasks")
    ]);

    const recentTasks = tasks.slice(0, 5);

    return `
        <section class="welcome-panel">
            <div>
                <span class="eyebrow">YOUR WORKSPACE</span>

                <h2>
                    Welcome back, ${escapeHTML(user.full_name)}.
                </h2>

                <p>
                    Your examination department workspace,
                    organized and ready.
                </p>
            </div>

            <div class="welcome-decoration">
                <span>EXAMHQ</span>
                <strong>01</strong>
            </div>
        </section>

        <section class="stats-grid">

            ${statCard(
                "Total tasks",
                stats.total,
                "Assigned tasks",
                "▤"
            )}

            ${statCard(
                "Completed",
                stats.completed,
                "Successfully completed",
                "✓"
            )}

            ${statCard(
                "Pending",
                stats.pending,
                "Within deadline",
                "◷"
            )}

            ${statCard(
                "Overdue",
                stats.overdue,
                "Past their deadline",
                "!"
            )}

        </section>

        <section class="content-panel">

            <div class="section-heading">
                <div>
                    <span class="eyebrow">ACTIVITY</span>
                    <h2>Recent tasks</h2>
                    <p class="muted">
                        Your latest examination activity.
                    </p>
                </div>

                <button
                    class="secondary-button"
                    data-open-page="tasks"
                >
                    View all <span>→</span>
                </button>
            </div>

            <div class="task-list">
                ${
                    recentTasks.length
                        ? recentTasks.map(task =>
                            renderTaskCard(
                                task,
                                user.role === "admin"
                            )
                        ).join("")
                        : emptyState(
                            "No tasks yet",
                            "Tasks will appear here when they are assigned."
                        )
                }
            </div>

        </section>
    `;
}

