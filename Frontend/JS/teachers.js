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

    loadTeachers();

}

async function loadTeachers() {

    const response = await fetch("/api/teachers");

    teachers = await response.json();

    renderTeachers();

}

async function addTeacher() {

    const name = document.getElementById("teacherName").value.trim();
    const email = document.getElementById("teacherEmail").value.trim();
    const subject = document.getElementById("teacherSubject").value.trim();

    if (!name) {
        alert("Please enter a teacher name.");
        return;
    }

    await fetch("/api/teachers", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name,
            email,
            subject
        })

    });

    document.getElementById("teacherName").value = "";
    document.getElementById("teacherEmail").value = "";
    document.getElementById("teacherSubject").value = "";

    loadTeachers();

}

function renderTeachers() {

    const list = document.getElementById("teacherList");

    if (!list) return;

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
