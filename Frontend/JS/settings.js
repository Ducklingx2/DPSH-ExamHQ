function Settings(main) {

    main.innerHTML = `

        <h1>Settings</h1>

        <p>Configure the Examination Management System.</p>
	<br><br>

	<h2>Personalisation</h2>

	<br><br>

        <h3>Theme</h3>

	<br>

        <button class="theme-btn" data-theme="ocean">Ocean</button>
	<button class="theme-btn" data-theme="amber">Amber</button>
	<br>
	<button class="theme-btn" data-theme="emerald">Emerald</button>
	<button class="theme-btn" data-theme="violet">Violet</button>
	<br>
	<button class="theme-btn" data-theme="crimson">Crimson</button>
	<button class="theme-btn" data-theme="obsidian">Obsidian</button>
	<br>
	<button class="theme-btn" data-theme="ornate">Ornate</button>
	<button class="theme-btn" data-theme="summer">Summer</button>

	<br><br><br>

        <h3>Border Style</h3>

	<button class="border-btn" data-border="classic">Classic</button>
	<br>
	<button class="border-btn" data-border="glow">Glow</button>
	<br>
	<button class="border-btn" data-border="accent">Accent</button>

  `;

    document.querySelectorAll(".theme-btn").forEach(button => {

    button.addEventListener("click", () => {

        applyTheme(button.dataset.theme);

    });

});

    document.querySelectorAll(".border-btn").forEach(button => {

    button.addEventListener("click", () => {

        applyBorder(button.dataset.border);

    });

});

}