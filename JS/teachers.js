const teachers = [];

function Teachers(main) {

    main.innerHTML = `

        <h1>Teachers</h1>

        <div class="teacher-form">

            <input id="teacherName" placeholder="Teacher Name">

            <input id="teacherEmail" placeholder="Email">

            <input id="teacherDepartment" placeholder="Department">

            <input id="teacherSubject" placeholder="Subject">

            <button id="addTeacherBtn">Add Teacher</button>

        </div>

        <div id="teacherList"></div>

    `;

    document
        .getElementById("addTeacherBtn")
        .addEventListener("click", addTeacher);

    renderTeachers();
}

function addTeacher() {

    const name = document.getElementById("teacherName").value.trim();
    const email = document.getElementById("teacherEmail").value.trim();
    const department = document.getElementById("teacherDepartment").value.trim();
    const subject = document.getElementById("teacherSubject").value.trim();

    if (!name) {
        alert("Please enter a teacher name.");
        return;
    }

    teachers.push({
        id: Date.now(),
        name,
        email,
        department,
        subject
    });

    renderTeachers();

    document.getElementById("teacherName").value = "";
    document.getElementById("teacherEmail").value = "";
    document.getElementById("teacherDepartment").value = "";
    document.getElementById("teacherSubject").value = "";
}

function renderTeachers() {

    const list = document.getElementById("teacherList");

    list.innerHTML = "";

    teachers.forEach(teacher => {

        list.innerHTML += `

        <div class="teacher-card">

            <h3>${teacher.name}</h3>

            <p>${teacher.department}</p>

            <p>${teacher.subject}</p>

        </div>

        `;

    });

}
