
// =====================================
// AVIATOR PRO - ANALYTICS ENGINE
// =====================================

const STORAGE_KEY = "aviator_pro_rounds";

// LOAD SAVED DATA
let rounds = [];

try {
    const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (Array.isArray(saved)) {
        rounds = saved.filter(item =>
            Number.isFinite(item.value) && item.value >= 1
        );
    }
} catch (error) {
    rounds = [];
}

// SAVE DATA
function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(rounds)
    );
}

// FORMAT MULTIPLIER
function formatMultiplier(value) {
    return Number(value).toFixed(2) + "x";
}

// UPDATE DASHBOARD
function updateDashboard() {

    const total = rounds.length;

    document.getElementById("totalRounds").textContent = total;

    if (total === 0) {

        document.getElementById("average").textContent = "0.00x";
        document.getElementById("highest").textContent = "0.00x";
        document.getElementById("lowest").textContent = "0.00x";

        document.getElementById("recentRounds").textContent =
            "No rounds recorded.";

        document.getElementById("historyList").textContent =
            "No history available.";

        document.getElementById("signalBox").innerHTML = `
            <h2>WAITING FOR DATA</h2>
            <p>Add historical rounds to begin analysis.</p>
        `;

        document.getElementById("distribution").innerHTML =
            "No data available.";

        document.getElementById("riskAnalysis").textContent =
            "Enter rounds to calculate statistics.";

        return;
    }

    const values = rounds.map(item => item.value);

    const sum = values.reduce((a, b) => a + b, 0);

    const average = sum / total;

    const highest = Math.max(...values);

    const lowest = Math.min(...values);

    document.getElementById("average").textContent =
        formatMultiplier(average);

    document.getElementById("highest").textContent =
        formatMultiplier(highest);

    document.getElementById("lowest").textContent =
        formatMultiplier(lowest);

    updateHistory();

    updateSignals();

    updateDistribution();
}

// ADD NEW ROUND
function addRound() {

    const input = document.getElementById("multiplier");

    const message = document.getElementById("message");

    const value = Number(input.value);

    if (
        input.value.trim() === "" ||
        !Number.isFinite(value) ||
        value < 1 ||
        value > 1000000
    ) {

        message.textContent =
            "Enter a valid multiplier of at least 1.00x.";

        message.style.color = "#ed354b";

        return;
    }

    rounds.push({
        value: value,
        date: new Date().toISOString()
    });

    saveData();

    updateDashboard();

    input.value = "";

    message.textContent = "Round saved successfully!";

    message.style.color = "#20c997";
}

// HISTORY
function updateHistory() {

    const historyList = document.getElementById("historyList");

    const recentRounds = document.getElementById("recentRounds");

    const reversed = [...rounds].reverse();

    function createRoundHTML(item, index) {

        const low = item.value < 2 ? "low" : "";

        return `
            <div class="round-item">
                <span>Round ${rounds.length - index}</span>
                <span class="multiplier ${low}">
                    ${formatMultiplier(item.value)}
                </span>
            </div>
        `;
    }

    historyList.innerHTML = reversed
        .map(createRoundHTML)
        .join("");

    recentRounds.innerHTML = reversed
        .slice(0, 5)
        .map(createRoundHTML)
        .join("");
}

// STATISTICAL SIGNALS
function updateSignals() {

    const total = rounds.length;

    const box = document.getElementById("signalBox");

    const risk = document.getElementById("riskAnalysis");

    if (total < 10) {

        box.innerHTML = `
            <h2>INSUFFICIENT DATA</h2>
            <p>Record at least 10 completed rounds for a basic historical analysis.</p>
        `;

        risk.textContent =
            "A larger sample is needed for more meaningful statistics.";

        return;
    }

    const values = rounds.map(item => item.value);

    const lowCount = values.filter(v => v < 2).length;

    const mediumCount = values.filter(
        v => v >= 2 && v < 10
    ).length;

    const highCount = values.filter(v => v >= 10).length;

    const lowPercent = (lowCount / total) * 100;

    const mediumPercent = (mediumCount / total) * 100;

    const highPercent = (highCount / total) * 100;

    box.innerHTML = `
        <h2>HISTORICAL ANALYSIS</h2>
        <p>Low multiplier frequency: ${lowPercent.toFixed(1)}%</p>
        <p>Medium multiplier frequency: ${mediumPercent.toFixed(1)}%</p>
        <p>High multiplier frequency: ${highPercent.toFixed(1)}%</p>
        <p>These are past observations, not predictions.</p>
    `;

    risk.innerHTML = `
        <p>Total analyzed rounds: <strong>${total}</strong></p>
        <p>Rounds below 2x: <strong>${lowCount}</strong></p>
        <p>Rounds from 2x to below 10x: <strong>${mediumCount}</strong></p>
        <p>Rounds of 10x or above: <strong>${highCount}</strong></p>
        <p>Historical low multiplier proportion:
        <strong>${lowPercent.toFixed(2)}%</strong></p>
        <p>Independent future rounds cannot be predicted from these proportions.</p>
    `;
}

// DISTRIBUTION CHART
function updateDistribution() {

    const total = rounds.length;

    const low = rounds.filter(v => v.value < 2).length;

    const medium = rounds.filter(
        v => v.value >= 2 && v.value < 10
    ).length;

    const high = rounds.filter(v => v.value >= 10).length;

    function bar(label, count) {

        const percent = (count / total) * 100;

        return `
            <div class="distribution-item">
                <div class="distribution-label">
                    <span>${label}</span>
                    <span>${count} (${percent.toFixed(1)}%)</span>
                </div>

                <div class="bar">
                    <div class="bar-fill"
                    style="width:${percent}%"></div>
                </div>
            </div>
        `;
    }

    document.getElementById("distribution").innerHTML =

        bar("LOW (<2x)", low) +

        bar("MEDIUM (2x–9.99x)", medium) +

        bar("HIGH (10x+)", high);
}

// NAVIGATION
document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        document.querySelectorAll(".page").forEach(page => {
            page.classList.remove("active");
        });

        button.classList.add("active");

        document.getElementById(
            button.dataset.page
        ).classList.add("active");

    });

});

// ADD BUTTON
document.getElementById("addRound")
    .addEventListener("click", addRound);

// ENTER KEY
document.getElementById("multiplier")
    .addEventListener("keydown", event => {

        if (event.key === "Enter") {
            addRound();
        }

    });

// CLEAR HISTORY
document.getElementById("clearHistory")
    .addEventListener("click", () => {

        if (confirm("Are you sure you want to delete all history?")) {

            rounds = [];

            saveData();

            updateDashboard();

            document.getElementById("message").textContent =
                "History cleared.";
        }

    });

// EXPORT DATA
document.getElementById("exportData")
    .addEventListener("click", () => {

        const data = JSON.stringify(rounds, null, 2);

        const blob = new Blob(
            [data],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "aviator-round-history.json";

        link.click();

        URL.revokeObjectURL(url);

    });

// INITIALIZE SYSTEM
updateDashboard();

console.log("AVIATOR PRO initialized successfully.");
