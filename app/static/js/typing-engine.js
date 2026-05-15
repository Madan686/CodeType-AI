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


let currentIndex = 0;

let errors = 0;

let totalTyped = 0;

let startTime = null;

let timer = 60;

let timerStarted = false;


function renderSnippet() {

    codeDisplay.innerHTML = "";

    snippet.split("").forEach((char) => {

        const span = document.createElement("span");

        span.innerText = char;

        codeDisplay.appendChild(span);

    });

}


renderSnippet();


hiddenInput.focus();


document.addEventListener("click", () => {

    hiddenInput.focus();

});


function startTimer() {

    setInterval(() => {

        if (timer > 0) {

            timer--;

            timerElement.innerText = timer;

        }

    }, 1000);

}


hiddenInput.addEventListener("input", (event) => {

    const typedChar = event.data;

    const spans = codeDisplay.querySelectorAll("span");

    if (!timerStarted) {

        startTime = new Date();

        startTimer();

        timerStarted = true;

    }

    const currentSpan = spans[currentIndex];

    const expectedChar = snippet[currentIndex];

    totalTyped++;

    if (typedChar === expectedChar) {

        currentSpan.classList.add("correct");

    } else {

        currentSpan.classList.add("incorrect");

        errors++;

        errorsElement.innerText = errors;

    }

    currentIndex++;

    updateCaret(spans);

    calculateStats();

    hiddenInput.value = "";

});


function updateCaret(spans) {

    spans.forEach((span) => {

        span.classList.remove("current");

    });

    if (spans[currentIndex]) {

        spans[currentIndex].classList.add("current");

    }

}


function calculateStats() {

    const currentTime = new Date();

    const elapsedMinutes = (currentTime - startTime) / 1000 / 60;

    const wordsTyped = totalTyped / 5;

    const wpm = Math.round(wordsTyped / elapsedMinutes);

    wpmElement.innerText = wpm || 0;

    const correctChars = totalTyped - errors;

    const accuracy = Math.round((correctChars / totalTyped) * 100);

    accuracyElement.innerText = `${accuracy || 0}%`;

}