function Teachers(main) {

    main.innerHTML = `

        <h1>Teachers</h1>

        <div class="teacher-form">

            <input id="teacherName" placeholder="Teacher Name">

            <input id="teacherEmail" placeholder="Email">

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
    const subject = document.getElementById("teacherSubject").value.trim();

    if (!name) {
        alert("Please enter a teacher name.");
        return;
    }

    teachers.push({
        id: generateId(),
        name,
        email,
        subject
    });
    saveData();

    renderTeachers();

    document.getElementById("teacherName").value = "";
    document.getElementById("teacherEmail").value = "";
    document.getElementById("teacherSubject").value = "";
}

function renderTeachers() {

    const list = document.getElementById("teacherList");

    list.innerHTML = "";

    teachers.forEach(teacher => {

        list.innerHTML += `

        <div class="teacher-card">

            <h3>${teacher.name}</h3>

            <p>${teacher.subject}</p>

        </div>

        `;

    });

}
