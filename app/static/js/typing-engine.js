const codeDisplay = document.getElementById("code-display");

const hiddenInput = document.getElementById("hidden-input");

const timerElement = document.getElementById("timer");

const wpmElement = document.getElementById("wpm");

const accuracyElement = document.getElementById("accuracy");

const errorsElement = document.getElementById("errors");

const restartBtn = document.getElementById("restart-btn");

const statusMessage = document.getElementById("status-message");

const ghostCaret = document.getElementById("ghost-caret");

const languageSelect = document.getElementById("language-select");

let currentIndex;

let totalErrors;

let totalTyped;

let startTime;

let timer;

let timerStarted;

let timerInterval;

let testCompleted;

let ghostRecording;

let replayTimeouts = [];

let snippet = "";

let previousKey = null;

let previousKeyTime = null;

let keyLatencyMap = {};

let totalPausedTime = 0;

let tabInsertedPositions = [];


function initializeState() {

    currentIndex = 0;

    totalErrors = 0;

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

    previousKey = null;

    previousKeyTime = null;

    keyLatencyMap = {};

    tabInsertedPositions = [];

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

        const selectedLanguage =
            languageSelect.value;

        const response =
            await fetch(
                `/random-snippet?language=${selectedLanguage}`
            );

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

        spans[currentIndex]
            .classList.add("current");

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

    const elapsedMilliseconds =
        (currentTime - startTime)
        - totalPausedTime;

    const elapsedMinutes =
        elapsedMilliseconds / 1000 / 60;

    const wordsTyped = totalTyped / 5;

    let wpm = 0;

    if (elapsedMinutes > 0.02) {

        wpm = Math.round(
            wordsTyped / elapsedMinutes
        );

    }

    wpmElement.innerText = wpm;

    const correctChars =
        totalTyped - totalErrors;

    const accuracy = Math.round(
        (correctChars / totalTyped) * 100
    );

    accuracyElement.innerText =
        `${accuracy || 0}%`;

}


async function endTest(message) {

    testCompleted = true;

    hiddenInput.disabled = true;

    statusMessage.innerText = message;

    clearInterval(timerInterval);

    const weakTransitions =
        analyzeWeakTransitions();

    const recommendations =
        generateRecommendations(
            weakTransitions
        );

    renderRecommendations(
        recommendations
    );

    const sessionData = {

    wpm: parseInt(
        wpmElement.innerText
    ),

    accuracy: parseFloat(
        accuracyElement.innerText
            .replace("%", "")
    ),

    total_errors: totalErrors,

    total_typed: totalTyped,

    language: languageSelect.value,

    ghost_data: ghostRecording
};
    try {

        const response =
            await fetch("/save-session", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    sessionData
                )

            });

        const result =
            await response.json();

        console.log(result.message);

        loadDashboard();

    } catch (error) {

        console.error(
            "Failed to save session:",
            error
        );

    }

}


function resetTest() {

    clearInterval(timerInterval);

    initializeState();

    loadSnippet();

    hiddenInput.disabled = false;

    hiddenInput.value = "";

    hiddenInput.focus();

}


async function loadDashboard() {

    try {

        const response =
            await fetch("/sessions");

        const sessions =
            await response.json();

        renderDashboard(sessions);

    } catch (error) {

        console.error(
            "Failed to load dashboard:",
            error
        );

    }

}


function analyzeWeakTransitions() {

    const weakTransitions = [];

    for (const transition in keyLatencyMap) {

        const latencies =
            keyLatencyMap[transition];

        const total =
            latencies.reduce(
                (sum, value) =>
                    sum + value,
                0
            );

        const average =
            total / latencies.length;

        weakTransitions.push({

            transition,

            averageLatency: average

        });

    }

    weakTransitions.sort(
        (a, b) =>
            b.averageLatency -
            a.averageLatency
    );

    return weakTransitions.slice(0, 5);

}


function generateRecommendations(
    weakTransitions
) {

    const recommendations = [];

    weakTransitions.forEach((item) => {

        const transition =
            item.transition;

        if (
            transition.includes("{") ||
            transition.includes("}")
        ) {

            recommendations.push(
                "Practice curly brace formatting"
            );

        }

        if (
            transition.includes("[") ||
            transition.includes("]")
        ) {

            recommendations.push(
                "Practice array bracket typing"
            );

        }

        if (
            transition.includes("(") ||
            transition.includes(")")
        ) {

            recommendations.push(
                "Improve function call rhythm"
            );

        }

        if (
            transition.includes("\n")
        ) {

            recommendations.push(
                "Practice indentation consistency"
            );

        }

    });

    return [...new Set(recommendations)];

}


function renderRecommendations(
    recommendations
) {

    const recommendationList =
        document.getElementById(
            "recommendation-list"
        );

    recommendationList.innerHTML = "";

    recommendations.forEach((item) => {

        const li =
            document.createElement("li");

        li.innerText = item;

        recommendationList.appendChild(li);

    });

}


function renderDashboard(sessions) {

    const historyBody =
        document.getElementById(
            "session-history-body"
        );

    const bestWpmElement =
        document.getElementById(
            "best-wpm"
        );

    const bestAccuracyElement =
        document.getElementById(
            "best-accuracy"
        );

    const totalTestsElement =
        document.getElementById(
            "total-tests"
        );

    const averageWpmElement =
        document.getElementById(
            "average-wpm"
        );

    historyBody.innerHTML = "";

    if (sessions.length === 0) {

        return;

    }

    startGhostReplay(
        sessions[0].ghost_data
    );

    let bestWpm = 0;

    let bestAccuracy = 0;

    let totalWpm = 0;

    sessions.forEach((session) => {

        if (session.wpm > bestWpm) {

            bestWpm = session.wpm;

        }

        if (
            session.accuracy >
            bestAccuracy
        ) {

            bestAccuracy =
                session.accuracy;

        }

        totalWpm += session.wpm;

        const row =
            document.createElement("tr");

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

    bestWpmElement.innerText =
        bestWpm;

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


hiddenInput.addEventListener(
    "keydown",
    (event) => {

        if (testCompleted) return;

        const spans =
            codeDisplay.querySelectorAll(
                "span"
            );

        if (!timerStarted) {

            startTime = new Date();

            startTimer();

            timerStarted = true;

        }

        /*
        BACKSPACE
        */

        if (event.key === "Backspace") {

            event.preventDefault();

            if (currentIndex > 0) {

                currentIndex--;

                const currentSpan =
                    spans[currentIndex];

                currentSpan.classList.remove(
                    "correct"
                );

                currentSpan.classList.remove(
                    "incorrect"
                );

                updateCaret(spans);

                calculateStats();

            }

            return;

        }

        /*
        TAB SUPPORT
        */

        if (event.key === "Tab") {

            event.preventDefault();

            const startPosition =
                currentIndex;

            let spacesMatched = 0;

            while (
                snippet[currentIndex] === " " &&
                spacesMatched < 4
            ) {

                const currentSpan =
                    spans[currentIndex];

                currentSpan.classList.remove(
                    "correct"
                );

                currentSpan.classList.remove(
                    "incorrect"
                );

                currentSpan.classList.add(
                    "correct"
                );

                currentIndex++;

                totalTyped++;

                spacesMatched++;

            }

            tabInsertedPositions.push(
                startPosition
            );

            updateCaret(spans);

            calculateStats();

            return;

        }

        /*
        IGNORE SPECIAL KEYS
        */

        if (
            event.key.length > 1 &&
            event.key !== "Enter"
        ) {

            return;

        }

        event.preventDefault();

        const typedChar =
            event.key === "Enter"
                ? "\n"
                : event.key;

        const currentTime =
            Date.now();

        const expectedChar =
            snippet[currentIndex];

        /*
        LATENCY TRACKING
        */

        if (
            previousKey !== null &&
            previousKeyTime !== null
        ) {

            const latency =
                currentTime -
                previousKeyTime;

            const transition =
                `${previousKey}->${typedChar}`;

            if (
                !keyLatencyMap[
                    transition
                ]
            ) {

                keyLatencyMap[
                    transition
                ] = [];

            }

            keyLatencyMap[
                transition
            ].push(latency);

        }

        previousKey = typedChar;

        previousKeyTime = currentTime;

        const currentSpan =
            spans[currentIndex];

        totalTyped++;

        const elapsedTime =
            new Date() - startTime;

        ghostRecording.push(
            elapsedTime
        );

        currentSpan.classList.remove(
            "correct"
        );

        currentSpan.classList.remove(
            "incorrect"
        );

        /*
        MATCHING
        */

        if (
            typedChar === expectedChar
        ) {

            currentSpan.classList.add(
                "correct"
            );

        } else {

            currentSpan.classList.add(
                "incorrect"
            );

            totalErrors++;

            errorsElement.innerText =
                totalErrors;

        }

        currentIndex++;

        updateCaret(spans);

        calculateStats();

        if (
            currentIndex >=
            snippet.length
        ) {

            endTest(
                "Test Completed!"
            );

        }

    }
);


restartBtn.addEventListener(
    "click",
    () => {

        resetTest();

    }
);


document.addEventListener("click", (event) => {

    if (
        event.target !== languageSelect &&
        event.target !== hiddenInput
    ) {

        hiddenInput.focus();

    }

});


languageSelect.addEventListener(
    "change",
    () => {

        resetTest();

    }
);

initializeState();

loadSnippet();

loadDashboard();