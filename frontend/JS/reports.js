
import { api } from "./api.js";

import {
    escapeHTML,
    statCard,
    emptyState
} from "./ui.js";

export async function renderReports() {
    const reports = await api("/reports");

    const total = reports.reduce(
        (sum, report) => sum + report.total,
        0
    );

    const completed = reports.reduce(
        (sum, report) => sum + report.completed,
        0
    );

    const overdue = reports.reduce(
        (sum, report) => sum + report.overdue,
        0
    );

    const rate = total
        ? Math.round(completed / total * 100)
        : 0;

    return `
        <section class="stats-grid">

            ${statCard(
                "Teachers",
                reports.length,
                "Registered accounts",
                "♧"
            )}

            ${statCard(
                "Total tasks",
                total,
                "Across all teachers",
                "▤"
            )}

            ${statCard(
                "Completed",
                completed,
                "Successfully completed",
                "✓"
            )}

            ${statCard(
                "Completion rate",
                `${rate}%`,
                "Across all assigned tasks",
                "%"
            )}

        </section>

        <section class="content-panel">

            <div class="section-heading">
                <div>
                    <span class="eyebrow">PERFORMANCE</span>
                    <h2>Teacher reports</h2>

                    <p class="muted">
                        Task statistics grouped by teacher.
                    </p>
                </div>
            </div>

            ${
                reports.length
                    ? `
                        <div class="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Teacher</th>
                                        <th>Total</th>
                                        <th>Completed</th>
                                        <th>Pending</th>
                                        <th>Overdue</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    ${reports.map(report => `
                                        <tr>
                                            <td>
                                                <strong>
                                                    ${escapeHTML(report.teacher_name)}
                                                </strong>
                                            </td>

                                            <td>${report.total}</td>
                                            <td>
                                                <span class="table-success">
                                                    ${report.completed}
                                                </span>
                                            </td>
                                            <td>${report.pending}</td>
                                            <td>
                                                <span class="table-danger">
                                                    ${report.overdue}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join("")}
                                </tbody>
                            </table>
                        </div>
                    `
                    : emptyState(
                        "No report data",
                        "Reports will appear once teachers register."
                    )
            }

        </section>
    `;
}

