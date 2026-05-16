const codeDisplay = document.getElementById("code-display");

const hiddenInput = document.getElementById("hidden-input");

const timerElement = document.getElementById("timer");

const wpmElement = document.getElementById("wpm");

const accuracyElement = document.getElementById("accuracy");

const errorsElement = document.getElementById("errors");

const restartBtn = document.getElementById("restart-btn");

const statusMessage = document.getElementById("status-message");

const interruptModal = document.getElementById("interrupt-modal");

const interruptInput = document.getElementById("interrupt-input");

const ghostCaret = document.getElementById("ghost-caret");


let currentIndex;

let totalErrors;

let activeErrors;

let totalTyped;

let startTime;

let timer;

let timerStarted;

let timerInterval;

let testCompleted;

let ghostRecording;

let replayTimeouts= [];

let snippet="";

let interruptionTimeout;

let isPaused = false;


function initializeState() {

    currentIndex = 0;

    totalErrors=0;

    activeErrors = 0;

    totalTyped = 0;

    startTime = null;

    timer = 60;

    timerStarted = false;

    testCompleted = false;

    timerElement.innerText = timer;

    wpmElement.innerText = 0;

    accuracyElement.innerText = "100%";

    errorsElement.innerText = 0;

    statusMessage.innerText = "";

    ghostRecording = [];

}


function renderSnippet() {

    codeDisplay.innerHTML = "";

    snippet.split("").forEach((char) => {

        const span = document.createElement("span");

        if (char === " ") {
            span.innerHTML = "&nbsp;";
        } else if (char === "\n") {
            span.innerHTML = "\n";
        } else {
            span.textContent = char;
        }

        codeDisplay.appendChild(span);

    });

}

async function loadSnippet() {

    try {

        const response =
            await fetch("/random-snippet");

        const data =
            await response.json();

        snippet = data.code;

        renderSnippet();

        const spans =
            codeDisplay.querySelectorAll("span");

        updateCaret(spans);

    } catch (error) {

        console.error(
            "Failed to load snippet:",
            error
        );

    }

}

function updateCaret(spans) {

    spans.forEach((span) => {

        span.classList.remove("current");

    });

    if (spans[currentIndex]) {

        spans[currentIndex].classList.add("current");

    }

}


function startTimer() {

    timerInterval = setInterval(() => {

        timer--;

        timerElement.innerText = timer;

        if (timer <= 0) {

            clearInterval(timerInterval);

            endTest("Time Over!");

        }

    }, 1000);

}


function calculateStats() {

    const currentTime = new Date();

    const elapsedMinutes = (currentTime - startTime) / 1000 / 60;

    const wordsTyped = totalTyped / 5;

    const wpm = Math.round(wordsTyped / elapsedMinutes);

    wpmElement.innerText = wpm || 0;

    const correctChars = totalTyped - activeErrors;

    const accuracy = Math.round((correctChars / totalTyped) * 100);

    accuracyElement.innerText = `${accuracy || 0}%`;

}


async function endTest(message) {

    testCompleted = true;

    hiddenInput.disabled = true;

    statusMessage.innerText = message;

    clearInterval(timerInterval);

    clearTimeout(interruptionTimeout);

    const sessionData = {

        wpm: parseInt(wpmElement.innerText),

        accuracy: parseFloat(
            accuracyElement.innerText
                .replace("%", "")
        ),

        total_errors: totalErrors,

        total_typed: totalTyped,

        ghost_data: ghostRecording
    };

    try {

        const response = await fetch("/save-session", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(sessionData)
        });

        const result = await response.json();

        console.log(result.message);

        loadDashboard();

    } catch (error) {

        console.error("Failed to save session:", error);

    }

}


function resetTest() {

    clearInterval(timerInterval);

    initializeState();

    loadSnippet();

    const spans = codeDisplay.querySelectorAll("span");

    updateCaret(spans);

    hiddenInput.disabled = false;

    hiddenInput.value = "";

    hiddenInput.focus();

}

async function loadDashboard(){
    try{
        const response = await fetch("/sessions");
        const sessions = await response.json();
        renderDashboard(sessions);
    } catch(error) {
        console.error("Failed to load dashboard: ", error);
    }
}

function renderDashboard(sessions) {

    const historyBody = document.getElementById(
        "session-history-body"
    );

    const bestWpmElement = document.getElementById(
        "best-wpm"
    );

    const bestAccuracyElement = document.getElementById(
        "best-accuracy"
    );

    const totalTestsElement = document.getElementById(
        "total-tests"
    );

    const averageWpmElement = document.getElementById(
        "average-wpm"
    );

    historyBody.innerHTML = "";

    if (sessions.length === 0) {

    return;

}

startGhostReplay(
    sessions[0].ghost_data
);

function scheduleInterruption() {

    console.log("Interruption Scheduled");

    clearTimeout(interruptionTimeout);

    const randomDelay =
        Math.floor(
            Math.random() * 10000
        ) + 5000;

    interruptionTimeout =
        setTimeout(() => {

            triggerInterruption();

        }, randomDelay);

}

function triggerInterruption() {

    if (testCompleted) return;

    isPaused = true;

    interruptModal.style.display = "flex";

    interruptInput.value = "";

    interruptInput.focus();

}


let bestWpm = 0;

let bestAccuracy = 0;

    let totalWpm = 0;

    sessions.forEach((session) => {

        if (session.wpm > bestWpm) {
            bestWpm = session.wpm;
        }

        if (session.accuracy > bestAccuracy) {
            bestAccuracy = session.accuracy;
        }

        totalWpm += session.wpm;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${session.wpm}</td>
            <td>${session.accuracy}%</td>
            <td>${session.total_errors}</td>
            <td>${session.total_typed}</td>
            <td>${session.created_at}</td>
        `;

        historyBody.appendChild(row);

    });

    const averageWpm = Math.round(
        totalWpm / sessions.length
    );

    bestWpmElement.innerText = bestWpm;

    bestAccuracyElement.innerText =
        `${bestAccuracy}%`;

    totalTestsElement.innerText =
        sessions.length;

    averageWpmElement.innerText =
        averageWpm;

}

function startGhostReplay(ghostData) {

    replayTimeouts.forEach((timeout) => {

        clearTimeout(timeout);

    });

    replayTimeouts = [];

    const spans =
        codeDisplay.querySelectorAll("span");

    ghostData.forEach((time, index) => {

        const timeout = setTimeout(() => {

            const span = spans[index];

            if (!span) return;

            const rect =
                span.getBoundingClientRect();

            const containerRect =
                codeDisplay.getBoundingClientRect();

            ghostCaret.style.left =
                `${rect.left - containerRect.left}px`;

            ghostCaret.style.top =
                `${rect.top - containerRect.top}px`;

        }, time);

        replayTimeouts.push(timeout);

    });

}

hiddenInput.addEventListener("keydown", (event) => {

    if (isPaused) return;

    if (testCompleted) return;

    const spans = codeDisplay.querySelectorAll("span");

    if (!timerStarted) {

        startTime = new Date();

        startTimer();

        timerStarted = true;

        scheduleInterruption();

    }

    if (event.key === "Backspace") {

        event.preventDefault();

        if (currentIndex > 0) {

            currentIndex--;

            totalTyped--;

            const currentSpan = spans[currentIndex];

            if (currentSpan.classList.contains("incorrect")) {

                activeErrors--;


            }

            currentSpan.classList.remove("correct");

            currentSpan.classList.remove("incorrect");

            updateCaret(spans);

            calculateStats();

        }

        return;

    }

    if (event.key.length > 1 && event.key !== "Enter") {

        return;

    }

    event.preventDefault();

    const typedChar = event.key === "Enter"
        ? "\n"
        : event.key;

    const expectedChar = snippet[currentIndex];

    const currentSpan = spans[currentIndex];

    totalTyped++;

    const elapsedTime = new Date() - startTime;
    ghostRecording.push(elapsedTime);

    currentSpan.classList.remove("correct");
    currentSpan.classList.remove("incorrect");

    if (typedChar === expectedChar) {

    currentSpan.classList.add("correct");

    } else {

    currentSpan.classList.add("incorrect");

    totalErrors++;

    activeErrors++;

    errorsElement.innerText = totalErrors;

    }

    currentIndex++;

    updateCaret(spans);

    calculateStats();

    if (currentIndex >= snippet.length) {

        endTest("Test Completed!");

    }

});


restartBtn.addEventListener("click", () => {

    resetTest();

});


document.addEventListener("click", () => {

    hiddenInput.focus();

});

interruptInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Enter") {
            return;
        }

        const value =
            interruptInput.value.trim();

        if (value === "dismiss alert") {

            interruptModal.style.display =
                "none";

            isPaused = false;

            hiddenInput.focus();

            scheduleInterruption();

        }

    }
);


initializeState();

loadSnippet();

loadDashboard();