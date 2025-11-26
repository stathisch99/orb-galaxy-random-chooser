// =========================================
// Orb Galaxy - History page logic start
// =========================================

// DOM references start
const historyListEl = document.getElementById("historyList");
const historyEmptyStateEl = document.getElementById("historyEmptyState");

const statTotalBattlesEl = document.getElementById("statTotalBattles");
const statUniqueWinnersEl = document.getElementById("statUniqueWinners");
const statTopWinnerEl = document.getElementById("statTopWinner");
const statTopThemeEl = document.getElementById("statTopTheme");

const filterThemeSelect = document.getElementById("filterTheme");
const sortOrderSelect = document.getElementById("sortOrder");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
// DOM references end

// Keys shared with main page
const STORAGE_KEYS = {
	history: "orbGalaxyHistory",
	preset: "orbGalaxyPresetOptions",
};

// =========================================
// Storage helpers start
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

// Storage helpers end
// =========================================

// =========================================
// Stats helpers start
// =========================================

function computeStats(history) {
	const total = history.length;

	const winnerCounts = new Map();
	const themeCounts = new Map();

	for (const entry of history) {
		if (entry.winner) {
			const key = entry.winner;
			winnerCounts.set(key, (winnerCounts.get(key) || 0) + 1);
		}
		if (entry.theme) {
			const tKey = entry.theme;
			themeCounts.set(tKey, (themeCounts.get(tKey) || 0) + 1);
		}
	}

	const uniqueWinners = winnerCounts.size;

	let topWinner = "–";
	let topWinnerCount = 0;
	for (const [name, count] of winnerCounts.entries()) {
		if (count > topWinnerCount) {
			topWinner = name;
			topWinnerCount = count;
		}
	}
	if (topWinnerCount === 0) {
		topWinner = "–";
	}

	let topTheme = "–";
	let topThemeCount = 0;
	for (const [theme, count] of themeCounts.entries()) {
		if (count > topThemeCount) {
			topTheme = theme;
			topThemeCount = count;
		}
	}
	if (topThemeCount === 0) {
		topTheme = "–";
	} else {
		// Nicely format theme name
		if (topTheme === "galaxy") topTheme = "Galaxy";
		if (topTheme === "solar") topTheme = "Solar System";
		if (topTheme === "neon") topTheme = "Neon Grid";
	}

	return {
		totalBattles: total,
		uniqueWinners,
		topWinner,
		topTheme,
	};
}

function renderStats(history) {
	const stats = computeStats(history);
	statTotalBattlesEl.textContent = stats.totalBattles;
	statUniqueWinnersEl.textContent = stats.uniqueWinners;
	statTopWinnerEl.textContent = stats.topWinner;
	statTopThemeEl.textContent = stats.topTheme;
}

// Stats helpers end
// =========================================

// =========================================
/* History list rendering start */
// =========================================

function formatDateTime(timestamp) {
	if (!timestamp) return "";
	const d = new Date(timestamp);
	const dateStr = d.toLocaleDateString([], {
		year: "numeric",
		month: "short",
		day: "2-digit",
	});
	const timeStr = d.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
	return `${dateStr} • ${timeStr}`;
}

function getThemeLabel(theme) {
	switch (theme) {
		case "solar":
			return "Solar System";
		case "neon":
			return "Neon Grid";
		case "galaxy":
		default:
			return "Galaxy";
	}
}

/**
 * Render the full history list, applying filters and sort options.
 */
function renderHistoryList() {
	const history = loadHistory();
	const themeFilter = filterThemeSelect.value;
	const sortOrder = sortOrderSelect.value;

	let filtered = history.slice();

	if (themeFilter !== "all") {
		filtered = filtered.filter((entry) => entry.theme === themeFilter);
	}

	filtered.sort((a, b) => {
		if (sortOrder === "oldest") {
			return a.timestamp - b.timestamp;
		}
		// newest first (default)
		return b.timestamp - a.timestamp;
	});

	// Toggle empty state
	if (filtered.length === 0) {
		historyEmptyStateEl.style.display = "block";
		historyListEl.innerHTML = "";
		return;
	} else {
		historyEmptyStateEl.style.display = "none";
	}

	// Render rows
	historyListEl.innerHTML = "";

	filtered.forEach((entry) => {
		const row = document.createElement("div");
		row.className = "history-item";

		// Meta column
		const metaCol = document.createElement("div");
		metaCol.className = "history-item__meta";

		const title = document.createElement("div");
		title.className = "history-item__title";
		title.textContent = `Battle #${entry.id}`;

		const sub = document.createElement("div");
		sub.className = "history-item__sub";
		const winnerPart = entry.winner ? `Winner: ${entry.winner}` : "Winner: –";
		const themePart = `Theme: ${getThemeLabel(entry.theme)}`;
		const whenPart = formatDateTime(entry.timestamp);
		sub.textContent = `${winnerPart} • ${themePart} • ${whenPart}`;

		metaCol.appendChild(title);
		metaCol.appendChild(sub);

		// Options column
		const optionsCol = document.createElement("div");
		optionsCol.className = "history-item__options";

		const optionsLabel = document.createElement("div");
		optionsLabel.className = "history-item__options-label";
		optionsLabel.textContent = "Options";

		const optionsText = document.createElement("div");
		optionsText.className = "history-item__options-text";
		optionsText.textContent = (entry.options || []).join(", ");

		optionsCol.appendChild(optionsLabel);
		optionsCol.appendChild(optionsText);

		// Action button
		const actionBtn = document.createElement("button");
		actionBtn.type = "button";
		actionBtn.className = "btn btn--ghost btn--small";
		actionBtn.textContent = "Use on Galaxy page";

		actionBtn.addEventListener("click", () => {
			// Save preset for main page and redirect
			try {
				const preset = {
					options: entry.options || [],
					theme: entry.theme || "galaxy",
				};
				localStorage.setItem(STORAGE_KEYS.preset, JSON.stringify(preset));
			} catch (error) {
				console.warn("Could not store preset options", error);
			}
			window.location.href = "index.html";
		});

		row.appendChild(metaCol);
		row.appendChild(optionsCol);
		row.appendChild(actionBtn);

		historyListEl.appendChild(row);
	});
}

// History list rendering end
// =========================================

// =========================================
/* Clear history start */
// =========================================

function clearHistory() {
	const history = loadHistory();
	if (history.length === 0) return;

	const confirmClear = window.confirm(
		"Are you sure you want to clear all recorded battles?"
	);
	if (!confirmClear) return;

	localStorage.removeItem(STORAGE_KEYS.history);
	renderStats([]);
	renderHistoryList();
}

// Clear history end
// =========================================

// =========================================
/* Initialisation start */
// =========================================

function initHistoryPage() {
	const history = loadHistory();
	renderStats(history);
	renderHistoryList();

	filterThemeSelect.addEventListener("change", renderHistoryList);
	sortOrderSelect.addEventListener("change", renderHistoryList);
	clearHistoryBtn.addEventListener("click", clearHistory);
}

document.addEventListener("DOMContentLoaded", initHistoryPage);

// =========================================
// Orb Galaxy - History page logic end
// =========================================
