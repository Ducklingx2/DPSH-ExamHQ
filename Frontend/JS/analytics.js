function Analytics(main) {

    main.innerHTML = `

        <h1>Analytics</h1>

        <p>View examination statistics and performance charts.</p>

    `;

}

function Analytics(main) {

    main.innerHTML = `

        <h1>Analytics</h1>

        <div id="analyticsContent">

            <p>Loading analytics...</p>

        </div>

    `;

    loadAnalytics();

}

async function loadAnalytics() {

    const response = await fetch("/api/analytics");

    const data = await response.json();

    document.getElementById("analyticsContent").innerHTML = `

        <div class="panel">

            <h2>Exam Statistics</h2>

            <p>Average: ${data.average}</p>
            <p>Median: ${data.median}</p>
            <p>Highest: ${data.highest}</p>
            <p>Lowest: ${data.lowest}</p>
            <p>Pass Rate: ${data.passRate}%</p>

        </div>

    `;

}