// Imports an array of valid words from words.js that the game can use as answers
import { words } from "./words.js";

// --- Game setup variables ---
const answer = words[Math.floor(Math.random() * words.length)];
let currentRow = 0;
const grid = document.getElementById("grid");
const keyboard = document.getElementById("keyboard");
const keyboardLandscape = document.getElementById("keyboard_landscape");
const overlay = document.getElementById("overlay");
const playAgain = document.getElementById("playAgain");


// --- Build the letter grid ---
// This section creates the main grid where the player enters their guesses.
// It constructs the 6 rows, and inside each row it constructs 5 boxes.
// Each box is:
//    Defined as an <input>
//    Defined as text (not number or password etc)
//    Restricted to a single character
//    Restricted to A-Z ie ^ at the start of the brackets for any characters NOT a-z and g flag for all characters
//    Converted to uppercase if not already, and labelled for accessibility.
//    Has class added for css
//    Has aria label added for accessibility
for (let r = 0; r < 6; r++) {
  const row = document.createElement("div");
  row.classList.add("row");
  for (let c = 0; c < 5; c++) {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.readOnly = true; 
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
    });
    input.classList.add("letter-box");
    input.setAttribute("aria-label", `Row ${r + 1} Letter ${c + 1}`);
    row.appendChild(input);
  }
  grid.appendChild(row);
}



// Store rows
const rows = document.querySelectorAll(".row");

// --- Restrict focus to current row only ---
function updateRowFocus() {
  rows.forEach((row, index) => {
    const boxes = row.querySelectorAll(".letter-box");
    boxes.forEach((box) => {
      if (index === currentRow) {
        box.readOnly = false;
        box.classList.remove("inactive");
      } else {
        box.readOnly = true;
        box.classList.add("inactive");
      }
    });
  });
}

updateRowFocus(); // initialise so only the first row is active

// --- Handle physical keyboard input for current row only ---
document.addEventListener("keydown", (e) => {
  const key = e.key.toUpperCase();
  const boxes = rows[currentRow].querySelectorAll(".letter-box");

  if (key === "BACKSPACE") {
    for (let i = boxes.length - 1; i >= 0; i--) {
      if (boxes[i].value) {
        boxes[i].value = "";
        boxes[i].focus();
        break;
      }
    }
  } else if (key === "ENTER") {
    submitRow();
  } else if (key.length === 1 && key >= "A" && key <= "Z") {
    for (let i = 0; i < boxes.length; i++) {
      if (!boxes[i].value) {
        boxes[i].value = key;
        boxes[i].focus();
        break;
      }
    }
  }
});





// --- Build the on-screen keyboard ---
// This section sets up the virtual keyboard that players can click to enter letters.
// `keyboardLayout` defines the arrangement of keys in three rows, including the Enter (ENT) and Delete (DEL) keys.
// The code then creates button elements for each key, organizes them into rows, and appends them to the keyboard container.
// Each key button is labelled with its letter and stores its value in a dataset for interaction with the game logic.
// This ensures the on-screen keyboard mirrors a standard layout and is fully functional for entering guesses.
// const rows = document.querySelectorAll(".row");
const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENT", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
];
const keyboardLayoutLandscape = [
  ["A", "B"],
  ["C", "D"],
  ["E", "F"],
  ["G", "H"],
  ["I", "J"],
  ["K", "L"],
  ["M", "N"],
  ["O", "P"],
  ["Q", "R"],
  ["S", "T"],
  ["U", "V"],
  ["W", "X"],
  ["Y", "Z"]
];


// Make the HTML for the keys on the keyboard. Three rows as defined in keyboardLayout
// The keys are <buttons>
// The class of key is allocated for css
// The button has the letter inserted as allocated from keyboardLayout 
// Dataset is allocated so we know what key is pushed. Its named 'data-'+ key, therefore 'data-key'
keyboardLayout.forEach((row) => {
  const rowDiv = document.createElement("div");
  rowDiv.classList.add("key-row");
  row.forEach((key) => {
    const keyBtn = document.createElement("button");
    keyBtn.classList.add("key");
    keyBtn.textContent = key;
    keyBtn.dataset.key = key;
    rowDiv.appendChild(keyBtn);
  });
  keyboard.appendChild(rowDiv);
});

// BUT HEY, WHAT ABOUT LANDSCAPE !! same same but gets keyboardLayoutLandscape
keyboardLayoutLandscape.forEach((row) => {
  const rowDiv = document.createElement("div");
  rowDiv.classList.add("key-row");
  row.forEach((key) => {
    const keyBtn = document.createElement("button");
    keyBtn.classList.add("key");
    keyBtn.textContent = key;
    keyBtn.dataset.key = key;
    rowDiv.appendChild(keyBtn);
  });
  keyboardLandscape.appendChild(rowDiv);
});

// --- Handle typing from the physical keyboard ---
// It listens for a letter being typed on the keyboard.
// When a letter is typed, it is automatically converted to uppercase, and then moves cursor to the next box in the row.
// The Backspace key moves cursor back to the previous box if the current one is empty (!box.value && i > 0).
// Pressing Enter triggers the submission of the current row.
rows.forEach((row, rowIndex) => {
  const boxes = row.querySelectorAll(".letter-box");
  boxes.forEach((box, i) => {
    box.addEventListener("input", () => {
      box.value = box.value.toUpperCase();
      if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !box.value && i > 0) boxes[i - 1].focus();
      if (e.key === "Enter" && rowIndex === currentRow) submitRow();
    });
  });
});

// --- Handle clicks from the virtual keyboard ---
// This section defines how clicking keys on the virtual keyboard affects the current row of input boxes.
// If something is clicked or pressed and it not part of the virtual keyboard, it does nothing 'if (!key) return;', otherwise, when a letter key is clicked, it fills the next empty box in the current row and moves focus there.
// Clicking the Delete (DEL) key removes the last entered letter in the row. If the box is empty, the cursor moves back to the previous box.
// Clicking Enter (ENT) submits the current row for validation.
// 'break' is needed so only one box is filled, not all the empty ones. it breaks the loooooooop
keyboard.addEventListener("click", (e) => {
  const key = e.target.dataset.key;
  if (!key) return;

  const boxes = rows[currentRow].querySelectorAll(".letter-box");

  if (key === "DEL") {
    for (let i = boxes.length - 1; i >= 0; i--) {
      if (boxes[i].value) {
        boxes[i].value = "";
        boxes[i].focus();
        break;
      }
    }
  } else if (key === "ENT") {
    submitRow();
  } else {
    for (let i = 0; i < boxes.length; i++) {
      if (!boxes[i].value) {
        boxes[i].value = key;
        boxes[i].focus();
        break;
      }
    }
  }
});

// --- submitRow ---
// This function is called when the player submits a guess for the current row by pressing enter or ENT.
// ? Have there already been 6 guesses, then dont run the function
// ? Has the player typed enough letters 
// ? Does the guessed word exist in the word list.
// Then it compares each letter to the answer, marking them as correct (right letter, right place), present (right letter, wrong place), or absent (not in the answer).
// The on-screen keyboard is updated with corresponding colours to reflect which letters are correct, present, or absent.
// ? Has the player guessed correctly? If not, cursor moves to the next row and the game continues.
function submitRow() {
  // Stop if all 6 guesses are used
  if (currentRow >= 6) return;

  const boxes = rows[currentRow].querySelectorAll(".letter-box");
  const guess = Array.from(boxes)
    .map((b) => b.value.toUpperCase())
    .join("");

  // --- Not enough letters ---
  if (guess.length < 5) {
    boxes.forEach((b) => b.classList.add("invalid"));
    setTimeout(() => boxes.forEach((b) => b.classList.remove("invalid")), 400);
    return;
  }

  // --- Word not in list ---
  if (!words.includes(guess)) {
    boxes.forEach((b) => b.classList.add("invalid"));
    setTimeout(() => boxes.forEach((b) => b.classList.remove("invalid")), 400);
    return;
  }

  const answerArr = answer.split("");
  const guessArr = guess.split("");

  // --- Color boxes ---
  guessArr.forEach((letter, i) => {
    if (letter === answerArr[i]) boxes[i].classList.add("correct");
    else if (answerArr.includes(letter)) boxes[i].classList.add("present");
    else boxes[i].classList.add("absent");
  });

  // --- Color on-screen keyboard (portrait + landscape) ---
  guessArr.forEach((letter, i) => {
    const keyBtns = document.querySelectorAll(`.key[data-key="${letter}"]`);
    keyBtns.forEach((keyBtn) => {
      if (!keyBtn) return;
      if (boxes[i].classList.contains("correct")) {
        keyBtn.classList.remove("present", "absent");
        keyBtn.classList.add("correct");
      } else if (boxes[i].classList.contains("present")) {
        if (!keyBtn.classList.contains("correct")) {
          keyBtn.classList.remove("absent");
          keyBtn.classList.add("present");
        }
      } else {
        if (
          !keyBtn.classList.contains("correct") &&
          !keyBtn.classList.contains("present")
        )
          keyBtn.classList.add("absent");
      }
    });
  });

  // --- Check win ---
  if (guess === answer) showOverlay(true);
  else {
    currentRow++;
    updateRowFocus(); // activate next row
    if (currentRow >= 6) showOverlay(false);
    else rows[currentRow].querySelector(".letter-box").focus();
  }
}


// --- showOverlay ---
// This function shows the overlay that appears when the game ends.
// If the player has won, it displays the answer and confetti and crazy stuff - Yeet.
// If the player has lost, it simply shows the correct answer.
// “Play Again” button as appended to the overlay. It waits for the browser to render first (100ms)
function showOverlay(win = true) {
  overlay.innerHTML = "";

  if (win) {
    // Animated letters
    answer.split("").forEach((l, i) => {
      const span = document.createElement("span");
      span.textContent = l;
      span.classList.add("overlay-letter");
      span.style.animationDelay = `${i * 0.1}s`;
      overlay.appendChild(span);
    });
    // Confetti
    createConfetti();
  } else {
    overlay.textContent = answer;
  }

  overlay.style.display = "flex";

  setTimeout(() => {
    overlay.appendChild(playAgain);
    playAgain.focus();
  }, 100);
}


// --- Play Again button ---
// When clicked, it reloads the page, resetting all game state and starting a new round.
playAgain.onclick = () => window.location.reload();



// --- createConfetti ---
// This function creates a colorful confetti effect when the player wins.
// It generates a number of small divs with random colors, sizes, and positions along the top of the screen.
// Each confetti piece is animated to fall and rotate down the screen, then removed after the animation ends.
function createConfetti() {
  const num = 100;
  for (let i = 0; i < num; i++) {
    const conf = document.createElement("div");
    conf.style.position = "fixed";
    conf.style.width = conf.style.height = Math.random() * 8 + 4 + "px";
    conf.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    conf.style.top = "-10px";
    conf.style.left = Math.random() * window.innerWidth + "px";
    conf.style.opacity = 0.7;
    conf.style.borderRadius = "50%";
    conf.style.zIndex = 20;
    document.body.appendChild(conf);

    const animDuration = Math.random() * 3 + 2;
    conf.animate(
      [
        { transform: `translateY(0px) rotate(0deg)`, opacity: 0.7 },
        {
          transform: `translateY(${window.innerHeight + 20}px) rotate(${
            Math.random() * 360
          }deg)`,
          opacity: 0,
        },
      ],
      {
        duration: animDuration * 1000,
        easing: "ease-out",
        iterations: 1,
      }
    );

    setTimeout(() => conf.remove(), animDuration * 1000);
  }
}

// --- Initial focus ---
// This ensures that the first input box in the top row is automatically selected when the game starts.
// By focusing the first box, the player can start typing immediately without needing to click on the grid.
// It improves usability and creates a smoother, more intuitive start to the game.
rows[0].querySelector(".letter-box").focus();
