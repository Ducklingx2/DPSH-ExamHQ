
export function escapeHTML(value) {
    return String(value ?? "").replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]
    );
}

export function formatDate(value) {
    if (!value) return "No deadline";

    const date = new Date(`${value}T00:00:00`);

    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

export function getTaskStatus(task) {
    if (task.status === "completed") {
        return {
            label: "Completed",
            className: "completed"
        };
    }

    const today = new Date().toLocaleDateString("en-CA");

    if (task.deadline < today) {
        return {
            label: "Overdue",
            className: "overdue"
        };
    }

    return {
        label: "Pending",
        className: "pending"
    };
}

let toastTimer;

export function toast(message, type = "info") {
    const element = document.querySelector("#toast");

    if (!element) return;

    element.textContent = message;
    element.dataset.type = type;
    element.classList.add("visible");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        element.classList.remove("visible");
    }, 3200);
}

export function renderTaskCard(task, isAdmin = false) {
    const status = getTaskStatus(task);

    return `
        <article class="task-card">

            <div class="task-main">

                <div class="task-heading">
                    <span class="status ${status.className}">
                        ${status.label}
                    </span>
                </div>

                <h3>${escapeHTML(task.title)}</h3>

                <p class="task-description">
                    ${escapeHTML(task.description || "No description provided.")}
                </p>

                <div class="task-meta">
                    <span>
                        <span aria-hidden="true">◷</span>
                        ${formatDate(task.deadline)}
                    </span>

                    ${
                        isAdmin
                            ? `<span>
                                Assigned to ${escapeHTML(task.teacher_name)}
                               </span>`
                            : ""
                    }
                </div>

            </div>

            ${
                task.status === "pending"
                    ? `<button
                        class="complete-button"
                        data-complete="${escapeHTML(task.id)}"
                       >
                        Mark complete
                       </button>`
                    : `<span class="completed-label">✓ Completed</span>`
            }

        </article>
    `;
}

export function statCard(label, value, detail, icon) {
    return `
        <article class="stat-card">
            <div class="stat-top">
                <span>${escapeHTML(label)}</span>
                <span class="stat-icon">${icon}</span>
            </div>

            <strong>${Number(value) || 0}</strong>

            <small>${escapeHTML(detail)}</small>
        </article>
    `;
}

export function emptyState(title, description) {
    return `
        <div class="empty-state">
            <div class="empty-icon">◇</div>
            <h3>${escapeHTML(title)}</h3>
            <p>${escapeHTML(description)}</p>
        </div>
    `;
}

