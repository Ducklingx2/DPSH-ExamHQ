function Tasks(main) {

    let teacherOptions = "";

    teachers.forEach(teacher => {

        teacherOptions += `
            <option value="${teacher.id}">
                ${teacher.name}
            </option>
        `;

    });

    main.innerHTML = `

        <h1>Tasks</h1>

        <div class="task-form">

        <select id="taskTemplate"></select>

            <select id="taskTeacher">

                ${teacherOptions}

            </select>

            <input
                id="taskDeadline"
                type="date"
            >

            <button id="addTaskBtn">

                Add Task

            </button>

        </div>

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

    `;

    document
        .getElementById("addTaskBtn")
        .addEventListener("click", addTask);

    loadTaskTemplates();
    
    renderTasks();

}

function loadTaskTemplates() {

    const select = document.getElementById("taskTemplate");

    select.innerHTML = "";

    taskTemplates.forEach(template => {

        select.innerHTML += `
            <option value="${template.id}">
                ${template.name}
            </option>
        `;

    });

}

function addTask() {

    const templateId =
        Number(document.getElementById("taskTemplate").value);

    const template =
        taskTemplates.find(t => t.id === templateId);

    const title = template.name;

    const teacherId =
        Number(document.getElementById("taskTeacher").value);

    const deadline =
        document.getElementById("taskDeadline").value;

    tasks.push({

        id: generateId(),

        teacherId,

        title,

        deadline,

        status: "Pending"

    });

    saveData();

    renderTasks();

    updateDashboardStats();

    document.getElementById("taskDeadline").value = "";

}

function renderTasks() {

    const table = document.getElementById("taskTable");

    if (!table) return;

    table.innerHTML = "";

    tasks.forEach(task => {

        const teacher =
            teachers.find(t => t.id === task.teacherId);

        table.innerHTML += `

            <tr>

    <td>${teacher ? teacher.name : "Unknown"}</td>

    <td>
        ${task.title}

        ${task.status === "Completed"
            ? ""
            : `<br><br>

            <input
            type="file"
            id="file-${task.id}"
            class="task-file">
               
               <button 
                  class="submit-btn"
                  onclick="submitTask(${task.id})">
                   Submit
               </button>`
        }
    </td>

    <td>${task.deadline}</td>

    <td>${getTaskStatus(task)}</td>

</tr>
        `;

    });

}

function submitTask(taskId) {

    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    const fileInput =
        document.getElementById(`file-${taskId}`);

    if (fileInput.files.length === 0) {

        alert("Please choose a file.");

        return;

    }

    task.fileName = fileInput.files[0].name;

    task.status = "Completed";

    task.completedAt = new Date().toISOString();

    saveData();

    renderTasks();

    updateDashboardStats();

}
