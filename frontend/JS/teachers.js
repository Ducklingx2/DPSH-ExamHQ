
import { api } from "./api.js";

import {
    escapeHTML,
    emptyState
} from "./ui.js";

export async function renderTeachers() {
    const teachers = await api("/teachers");

    return `
        <section class="content-panel">

            <div class="section-heading">
                <div>
                    <span class="eyebrow">DIRECTORY</span>
                    <h2>Teachers</h2>

                    <p class="muted">
                        Registered teacher accounts.
                    </p>
                </div>

                <span class="count-pill">
                    ${teachers.length} accounts
                </span>
            </div>

            ${
                teachers.length
                    ? `
                        <div class="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Teacher</th>
                                        <th>Email address</th>
                                        <th>Account type</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    ${teachers.map(teacher => `
                                        <tr>
                                            <td>
                                                <div class="table-person">
                                                    <span class="table-avatar">
                                                        ${escapeHTML(
                                                            teacher.full_name
                                                                .charAt(0)
                                                                .toUpperCase()
                                                        )}
                                                    </span>

                                                    <strong>
                                                        ${escapeHTML(teacher.full_name)}
                                                    </strong>
                                                </div>
                                            </td>

                                            <td>
                                                ${escapeHTML(teacher.email)}
                                            </td>

                                            <td>
                                                <span class="status pending">
                                                    Teacher
                                                </span>
                                            </td>
                                        </tr>
                                    `).join("")}
                                </tbody>
                            </table>
                        </div>
                    `
                    : emptyState(
                        "No teachers yet",
                        "Registered teacher accounts will appear here."
                    )
            }

        </section>
    `;
}

