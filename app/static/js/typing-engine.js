const snippet = `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid

        elif arr[mid] < target:
            left = mid + 1

        else:
            right = mid - 1

    return -1`;


const codeDisplay = document.getElementById("code-display");

const hiddenInput = document.getElementById("hidden-input");

const timerElement = document.getElementById("timer");

const wpmElement = document.getElementById("wpm");

const accuracyElement = document.getElementById("accuracy");

const errorsElement = document.getElementById("errors");

const restartBtn = document.getElementById("restart-btn");

const statusMessage = document.getElementById("status-message");


let currentIndex;

let totalErrors;

let activeErrors;

let totalTyped;

let startTime;

let timer;

let timerStarted;

let timerInterval;

let testCompleted;


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

    const sessionData = {

        wpm: parseInt(wpmElement.innerText),

        accuracy: parseFloat(
            accuracyElement.innerText
                .replace("%", "")
        ),

        total_errors: totalErrors,

        total_typed: totalTyped
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

    } catch (error) {

        console.error("Failed to save session:", error);

    }

}


function resetTest() {

    clearInterval(timerInterval);

    initializeState();

    renderSnippet();

    const spans = codeDisplay.querySelectorAll("span");

    updateCaret(spans);

    hiddenInput.disabled = false;

    hiddenInput.value = "";

    hiddenInput.focus();

}


hiddenInput.addEventListener("keydown", (event) => {

    if (testCompleted) return;

    const spans = codeDisplay.querySelectorAll("span");

    if (!timerStarted) {

        startTime = new Date();

        startTimer();

        timerStarted = true;

    }

    if (event.key === "Backspace") {

        event.preventDefault();

        if (currentIndex > 0) {

            currentIndex--;

            totalTyped--;

            const currentSpan = spans[currentIndex];

            if (currentSpan.classList.contains("incorrect")) {

                activeErrorsrrors--;


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


initializeState();

renderSnippet();

const initialSpans = codeDisplay.querySelectorAll("span");

updateCaret(initialSpans);