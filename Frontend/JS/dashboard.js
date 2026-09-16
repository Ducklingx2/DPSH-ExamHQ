async function Dashboard(main) {

    main.innerHTML = `

        <section class="dashboard">

            <div class="welcome-card">

                <h2>Welcome back.</h2>

                <p>
                    Manage examination tasks, monitor teacher progress,
                    and keep the examination department running smoothly.
                </p>

            </div>

            <div class="dashboard-grid">

                <div class="panel">

                    <h2>Today's Overview</h2>

                    <div class="overview">

                        <div class="overview-item">

                            <span>Total Tasks</span>

                            <h3 id="totalTasks">0</h3>

                        </div>

                        <div class="overview-item">

                            <span>Completed</span>

                            <h3 id="completedTasks">0</h3>

                        </div>

                        <div class="overview-item">

                            <span>Pending</span>

                            <h3 id="pendingTasks">0</h3>

                        </div>

                        <div class="overview-item">

                            <span>Overdue</span>

                            <h3 id="overdueTasks">0</h3>

                        </div>

                    </div>

                </div>

                <div class="panel">

                    <h2>Recent Activity</h2>

                    <div id="activityFeed">

                        <p>No activity yet.</p>

                    </div>

                </div>

            </div>

            <div class="panel">

                <h2>Recent Tasks</h2>

                <table>

                    <thead>

                        <tr>

                            <th>Teacher</th>
                            <th>Task</th>
                            <th>Deadline</th>
                            <th>Status</th>

                        </tr>

                    </thead>

                    <tbody id="taskTable">

                    </tbody>

                </table>

            </div>

        </section>

    `;

  }
 
function updateDashboardStats() {

    const total = tasks.length;

    const completed = tasks.filter(
        t => t.status === "Completed"
    ).length;

    const overdue = tasks.filter(
        t => getTaskStatus(t) === "🔴 Overdue"
    ).length;

    const pending = tasks.filter(
        t => getTaskStatus(t) === "🟡 Pending"
    ).length;

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("pendingTasks").textContent = pending;

    document.getElementById("overdueTasks").textContent = overdue;

}

function refreshUI() {

    renderTasks();

    renderTeachers();

    updateDashboardStats();

}

