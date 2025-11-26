// =========================================
// Orb Galaxy Random Chooser - main logic start
// =========================================

// DOM references start
const optionsInput = document.getElementById("optionsInput");
const addOptionsBtn = document.getElementById("addOptionsBtn");
const clearOptionsBtn = document.getElementById("clearOptionsBtn");
const chooseBtn = document.getElementById("chooseBtn");
const optionsList = document.getElementById("optionsList");
const galaxy = document.getElementById("galaxy");
const resultCard = document.getElementById("resultCard");
const resultText = document.getElementById("resultText");
const resultMeta = document.getElementById("resultMeta");
const recentHistoryEl = document.getElementById("recentHistory");
const themeSelect = document.getElementById("themeSelect");
const soundToggleBtn = document.getElementById("soundToggleBtn");
// DOM references end

// State start
let options = [];
let isChoosing = false;

const STORAGE_KEYS = {
	history: "orbGalaxyHistory",
	theme: "orbGalaxyTheme",
	sound: "orbGalaxySoundOn",
	preset: "orbGalaxyPresetOptions",
};

let soundEnabled = false;
let audioContext = null;
// State end

// =========================================
// Helpers start
// =========================================

/**
 * Parse textarea input into an array of cleaned option strings.
 */
function parseOptions(text) {
	return text
		.split(/[\n,]/)
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
}

/**
 * Enable / disable choose button based on state.
 * Require at least 2 options for a "battle".
 */
function updateChooseButtonState() {
	chooseBtn.disabled = options.length < 2 || isChoosing;
}

/**
 * Clear children from a container element.
 */
function clearElementChildren(element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

/**
 * Random integer between min and max inclusive.
 */
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max.
 */
function randomFloat(min, max) {
	return Math.random() * (max - min) + min;
}

/**
 * Shuffle an array (returns a new array).
 */
function shuffleArray(array) {
	const copy = array.slice();
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = copy[i];
		copy[i] = copy[j];
		copy[j] = temp;
	}
	return copy;
}
/**
 * Load preset options & theme (coming from history page).
 * Returns { options: [...], theme: "galaxy|solar|neon" } or null.
 */
function loadPresetFromHistory() {
	try {
		const raw = localStorage.getItem(STORAGE_KEYS.preset);
		if (!raw) return null;

		const preset = JSON.parse(raw);
		// Remove so it only applies once
		localStorage.removeItem(STORAGE_KEYS.preset);
		return preset;
	} catch (error) {
		console.warn("Could not load preset from history", error);
		return null;
	}
}

// Helpers end
// =========================================

// =========================================
// Options rendering start
// =========================================

/**
 * Render the option "chips" under Current options.
 */
function renderOptionTags() {
	clearElementChildren(optionsList);

	if (options.length === 0) {
		const empty = document.createElement("p");
		empty.textContent = "No options yet. Add some to begin.";
		empty.style.fontSize = "0.85rem";
		empty.style.color = "var(--color-text-muted)";
		optionsList.appendChild(empty);
		return;
	}

	options.forEach((optionText, index) => {
		const tag = document.createElement("div");
		tag.className = "option-tag";

		const dot = document.createElement("span");
		dot.className = "option-tag__dot";

		const textSpan = document.createElement("span");
		textSpan.className = "option-tag__text";
		textSpan.textContent = optionText;

		const removeBtn = document.createElement("button");
		removeBtn.className = "option-tag__remove";
		removeBtn.type = "button";
		removeBtn.title = "Remove option";
		removeBtn.textContent = "×";

		removeBtn.addEventListener("click", () => {
			if (isChoosing) return;
			options.splice(index, 1);
			renderOptionTags();
			renderOrbs();
			updateChooseButtonState();
		});

		tag.appendChild(dot);
		tag.appendChild(textSpan);
		tag.appendChild(removeBtn);

		optionsList.appendChild(tag);
	});
}

// Options rendering end
// =========================================

// =========================================
// Galaxy / orbs rendering start
// =========================================

/**
 * Render floating orbs / planets inside the galaxy.
 */
function renderOrbs() {
	clearElementChildren(galaxy);

	if (options.length === 0) {
		const hint = document.createElement("p");
		hint.textContent = "Your galaxy is empty. Add options to see planets battle.";
		hint.style.position = "absolute";
		hint.style.inset = "0";
		hint.style.display = "flex";
		hint.style.alignItems = "center";
		hint.style.justifyContent = "center";
		hint.style.fontSize = "0.9rem";
		hint.style.color = "var(--color-text-muted)";
		hint.style.textAlign = "center";
		hint.style.padding = "0 1rem";
		galaxy.appendChild(hint);
		return;
	}

	const padding = 80;
	const rect = galaxy.getBoundingClientRect();
	const width = rect.width;
	const height = rect.height;

	options.forEach((optionText, index) => {
		const orb = document.createElement("div");
		orb.className = "orb";

		// Drift variants
		const driftClass = `orb--drift-${(index % 3) + 1}`;
		orb.classList.add(driftClass);

		const label = document.createElement("span");
		label.className = "orb__label";
		label.textContent = optionText;
		orb.appendChild(label);

		const maxX = Math.max(width - padding, padding);
		const maxY = Math.max(height - padding, padding);
		const x = randomInt(padding, maxX);
		const y = randomInt(padding, maxY);

		// Center orb around x/y
		const radius = 36; // approx
		orb.style.left = `${x - radius}px`;
		orb.style.top = `${y - radius}px`;

		orb.dataset.index = String(index);

		galaxy.appendChild(orb);
	});
}

// Galaxy / orbs rendering end
// =========================================

// =========================================
// History management start
// =========================================

function loadHistory() {
	try {
		const raw = localStorage.getItem(STORAGE_KEYS.history);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch (error) {
		console.warn("Could not parse history from localStorage", error);
		return [];
	}
}

function saveHistory(historyArray) {
	try {
		localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(historyArray));
	} catch (error) {
		console.warn("Could not save history to localStorage", error);
	}
}

/**
 * Add a new entry to history and re-render preview.
 */
function addHistoryEntry(chosenOption, allOptions) {
	const history = loadHistory();
	const entry = {
		id: history.length + 1,
		timestamp: Date.now(),
		winner: chosenOption,
		options: allOptions.slice(),
		theme: getCurrentTheme(),
	};
	history.push(entry);

	// Keep last 50 entries max
	if (history.length > 50) {
		history.shift();
	}

	saveHistory(history);
	renderRecentHistory();
}

/**
 * Render the "Recent history" box in the result panel.
 */
function renderRecentHistory() {
	if (!recentHistoryEl) return;

	const history = loadHistory();
	clearElementChildren(recentHistoryEl);

	if (history.length === 0) {
		const wrapper = document.createElement("div");
		wrapper.className = "recent-history";
		wrapper.textContent =
			"No battles yet. Once you start choosing, your recent galaxy battles will appear here.";
		recentHistoryEl.appendChild(wrapper);
		return;
	}

	const wrapper = document.createElement("div");
	wrapper.className = "recent-history";

	const header = document.createElement("div");
	header.className = "recent-history__header";

	const title = document.createElement("div");
	title.className = "recent-history__title";
	title.textContent = "Recent battles";

	const seeAllLink = document.createElement("a");
	seeAllLink.href = "history.html";
	seeAllLink.textContent = "Open full history";
	seeAllLink.className = "nav-link";
	seeAllLink.style.fontSize = "0.78rem";
	seeAllLink.style.padding = "0.15rem 0.5rem";

	header.appendChild(title);
	header.appendChild(seeAllLink);

	const list = document.createElement("div");
	list.className = "recent-history__items";

	const recent = history.slice(-3).reverse();
	recent.forEach((entry) => {
		const item = document.createElement("div");
		item.className = "recent-history__item";

		const main = document.createElement("div");
		main.className = "recent-history__item-main";

		const label = document.createElement("div");
		label.className = "recent-history__item-text";
		const date = new Date(entry.timestamp);
		const timeStr = date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
		label.textContent = `#${entry.id} • ${entry.winner} • ${timeStr}`;

		const sub = document.createElement("div");
		sub.style.fontSize = "0.75rem";
		sub.style.opacity = "0.7";
		sub.textContent = entry.options.join(", ");

		main.appendChild(label);
		main.appendChild(sub);

		const replayBtn = document.createElement("button");
		replayBtn.type = "button";
		replayBtn.className = "btn btn--ghost btn--small";
		replayBtn.textContent = "Use again";

		replayBtn.addEventListener("click", () => {
			if (isChoosing) return;
			options = entry.options.slice();
			renderOptionTags();
			renderOrbs();
			updateChooseButtonState();
			resultMeta.textContent = `Loaded from battle #${entry.id}.`;
		});

		item.appendChild(main);
		item.appendChild(replayBtn);
		list.appendChild(item);
	});

	wrapper.appendChild(header);
	wrapper.appendChild(list);
	recentHistoryEl.appendChild(wrapper);
}

// History management end
// =========================================

// =========================================
// Sound handling start
// =========================================

/**
 * Initialize or reuse AudioContext.
 */
function getAudioContext() {
	if (!window.AudioContext && !window.webkitAudioContext) {
		return null;
	}
	if (!audioContext) {
		const AC = window.AudioContext || window.webkitAudioContext;
		audioContext = new AC();
	}
	return audioContext;
}

/**
 * Play a short tone using Web Audio API.
 */
function playTone(frequency, durationMs, type = "sine", volume = 0.15) {
	if (!soundEnabled) return;

	const ctx = getAudioContext();
	if (!ctx) return;

	if (ctx.state === "suspended") {
		ctx.resume().catch(() => {});
	}

	const osc = ctx.createOscillator();
	const gain = ctx.createGain();

	osc.type = type;
	osc.frequency.value = frequency;

	const now = ctx.currentTime;
	const duration = durationMs / 1000;

	gain.gain.setValueAtTime(0, now);
	gain.gain.linearRampToValueAtTime(volume, now + 0.02);
	gain.gain.linearRampToValueAtTime(0, now + duration);

	osc.connect(gain);
	gain.connect(ctx.destination);

	osc.start(now);
	osc.stop(now + duration + 0.05);
}

/**
 * Specific sound helpers for UX.
 */
function playBattleStartSound() {
	playTone(220, 280, "triangle", 0.16);
}

function playKnockoutSound() {
	playTone(180, 120, "sawtooth", 0.12);
}

function playWinnerSound() {
	playTone(880, 260, "sine", 0.18);
}

/**
 * Update sound toggle UI + persist.
 */
function setSoundEnabled(enabled) {
	soundEnabled = enabled;
	soundToggleBtn.textContent = enabled ? "Sound: On" : "Sound: Off";
	try {
		localStorage.setItem(STORAGE_KEYS.sound, enabled ? "true" : "false");
	} catch (error) {
		console.warn("Could not persist sound preference", error);
	}
}

// Sound handling end
// =========================================

// =========================================
// Theme handling start
// =========================================

function getCurrentTheme() {
	const body = document.body;
	if (body.classList.contains("theme--solar")) return "solar";
	if (body.classList.contains("theme--neon")) return "neon";
	return "galaxy";
}

/**
 * Apply theme class to body and save preference.
 */
function applyTheme(themeName) {
	const body = document.body;
	body.classList.remove("theme--galaxy", "theme--solar", "theme--neon");

	let className = "theme--galaxy";
	if (themeName === "solar") className = "theme--solar";
	if (themeName === "neon") className = "theme--neon";

	body.classList.add(className);

	try {
		localStorage.setItem(STORAGE_KEYS.theme, themeName);
	} catch (error) {
		console.warn("Could not save theme preference", error);
	}
}

// Theme handling end
// =========================================

// =========================================
// Battle choosing flow start
// =========================================

/**
 * Create a burst of particles around a given orb element.
 * You can control how many particles and how strong the burst is.
 */
function createOrbExplosion(
	orbEl,
	particlesCount = 20,
	strengthMultiplier = 1
) {
	const orbRect = orbEl.getBoundingClientRect();
	const galaxyRect = galaxy.getBoundingClientRect();

	const centerX = orbRect.left + orbRect.width / 2 - galaxyRect.left;
	const centerY = orbRect.top + orbRect.height / 2 - galaxyRect.top;

	for (let i = 0; i < particlesCount; i++) {
		const p = document.createElement("div");
		p.className = "particle";

		// Start at orb center
		p.style.left = `${centerX - 3}px`;
		p.style.top = `${centerY - 3}px`;

		// Random direction + distance
		const angle = Math.random() * Math.PI * 2;
		const baseDistance = randomFloat(40, 120) * strengthMultiplier;
		const dx = Math.cos(angle) * baseDistance;
		const dy = Math.sin(angle) * baseDistance;

		p.style.setProperty("--dx", `${dx}px`);
		p.style.setProperty("--dy", `${dy}px`);

		galaxy.appendChild(p);

		p.addEventListener("animationend", () => {
			p.remove();
		});
	}
}

/**
 * Orchestrate a longer "battle of planets" (about 4–5s)
 * Each losing planet "attacks" and explodes before fading.
 */
function performBattleChoose() {
	if (options.length < 2 || isChoosing) return;

	isChoosing = true;
	updateChooseButtonState();

	galaxy.classList.add("galaxy--choosing");
	resultCard.classList.add("result-card--visible");
	resultText.textContent = "The galaxy is deciding...";
	resultMeta.textContent =
		"Planets are entering orbit and preparing to attack...";

	const orbs = Array.from(galaxy.querySelectorAll(".orb"));
	if (orbs.length < 2) {
		renderOrbs();
		isChoosing = false;
		updateChooseButtonState();
		galaxy.classList.remove("galaxy--choosing");
		return;
	}

	// Randomly pick the final winner index
	const winnerIndex = randomInt(0, options.length - 1);

	// All orbs become "fighters" for a bit of build-up
	orbs.forEach((orb) => {
		orb.classList.remove("orb--winner", "orb--knocked-out");
		orb.classList.add("orb--fighter");
	});

	// Lose order is shuffled so it feels random
	const loserIndices = shuffleArray(
		orbs.map((_, idx) => idx).filter((idx) => idx !== winnerIndex)
	);

	// Timings (in ms)
	const introDuration = 1200; // time where they all "shake" before attacks start
	const stepDelay = 600; // time between each knockout
	const finaleExtra = 1000; // pause before final big explosion

	playBattleStartSound();

	// Sequential attacks / knockouts
	loserIndices.forEach((idx, step) => {
		const delay = introDuration + step * stepDelay;
		setTimeout(() => {
			const orb = orbs[idx];
			if (!orb) return;

			// This orb just "lost" its duel
			orb.classList.remove("orb--fighter");
			orb.classList.add("orb--knocked-out");

			// Small explosion to feel like it attacked and got hit
			createOrbExplosion(orb, 10, 0.6);
			playKnockoutSound();
		}, delay);
	});

	// Total battle length (roughly 4–5 seconds depending on number of losers)
	const totalBattleDuration =
		introDuration + loserIndices.length * stepDelay + finaleExtra;

	setTimeout(() => {
		const winnerOrb = orbs[winnerIndex];
		if (winnerOrb) {
			winnerOrb.classList.remove("orb--fighter");
			winnerOrb.classList.add("orb--winner");

			// Big final explosion for the champion planet
			createOrbExplosion(winnerOrb, 22, 1.1);
			playWinnerSound();
		}

		const chosenOption = options[winnerIndex];
		resultText.textContent = chosenOption;
		resultMeta.textContent =
			"Battle complete. The winning planet has been chosen.";

		addHistoryEntry(chosenOption, options);

		galaxy.classList.remove("galaxy--choosing");
		isChoosing = false;
		updateChooseButtonState();
	}, totalBattleDuration);
}

// Battle choosing flow end
// =========================================

// =========================================
// Event listeners start
// =========================================

/**
 * Add options button.
 */
addOptionsBtn.addEventListener("click", () => {
	const rawText = optionsInput.value;
	const parsed = parseOptions(rawText);

	if (parsed.length === 0) {
		// Quick visual feedback
		optionsInput.style.borderColor = "var(--color-danger)";
		setTimeout(() => {
			optionsInput.style.borderColor = "";
		}, 400);
		return;
	}

	const existingLower = options.map((opt) => opt.toLowerCase());
	parsed.forEach((opt) => {
		if (!existingLower.includes(opt.toLowerCase())) {
			options.push(opt);
		}
	});

	optionsInput.value = "";
	renderOptionTags();
	renderOrbs();
	updateChooseButtonState();
});

/**
 * Clear all options button.
 */
clearOptionsBtn.addEventListener("click", () => {
	if (isChoosing) return;
	options = [];
	renderOptionTags();
	renderOrbs();
	resultText.textContent = "No option chosen yet.";
	resultMeta.textContent = "Start a battle to see which planet wins.";
	resultCard.classList.remove("result-card--visible");
	updateChooseButtonState();
});

/**
 * Battle button.
 */
chooseBtn.addEventListener("click", () => {
	performBattleChoose();
});

/**
 * Keyboard shortcut: Ctrl+Enter / Cmd+Enter to add options.
 */
optionsInput.addEventListener("keydown", (event) => {
	const isMeta = event.ctrlKey || event.metaKey;
	if (event.key === "Enter" && isMeta) {
		event.preventDefault();
		addOptionsBtn.click();
	}
});

/**
 * Theme select change listener.
 */
themeSelect.addEventListener("change", (event) => {
	applyTheme(event.target.value);
});

/**
 * Sound toggle button.
 */
soundToggleBtn.addEventListener("click", () => {
	setSoundEnabled(!soundEnabled);
});

// Event listeners end
// =========================================

// =========================================
// Initialisation start
// =========================================

function initThemeFromStorage() {
	try {
		const stored = localStorage.getItem(STORAGE_KEYS.theme);
		if (!stored) return;
		applyTheme(stored);
		if (themeSelect) {
			themeSelect.value = stored;
		}
	} catch (error) {
		console.warn("Could not load theme from storage", error);
	}
}

function initSoundFromStorage() {
	try {
		const raw = localStorage.getItem(STORAGE_KEYS.sound);
		const enabled = raw === "true";
		setSoundEnabled(enabled);
	} catch (error) {
		console.warn("Could not load sound preference", error);
	}
}

/**
 * Run initial renders & restore preferences.
 */
function initApp() {
	// Load saved theme + sound first
	initThemeFromStorage();
	initSoundFromStorage();

	// Check if history page sent us a preset
	const preset = loadPresetFromHistory();
	if (preset && Array.isArray(preset.options)) {
		// Load options from preset
		options = preset.options.slice();

		// Apply theme from that battle (override stored theme)
		if (preset.theme) {
			applyTheme(preset.theme);
			if (themeSelect) {
				themeSelect.value = preset.theme;
			}
		}

		resultMeta.textContent = "Loaded from history preset.";
	}

	// Initial renders
	renderOptionTags();
	renderOrbs();
	renderRecentHistory();
	updateChooseButtonState();
}

document.addEventListener("DOMContentLoaded", initApp);

// Initialisation end
// =========================================

// Orb Galaxy Random Chooser - main logic end
// =========================================
