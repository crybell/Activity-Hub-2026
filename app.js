const questions = [
  {
    prompt:
      "Which US State was the very first to officially declare Juneteenth a state holiday back in 1980?",
    choices: ["Texas", "New York", "Georgia", "Pennsylvania"],
    answer: "Texas",
    note: "Juneteenth did not become a United States federal holiday until June 17, 2021.",
  },
  {
    prompt:
      'Juneteenth is traditionally celebrated with "red foods." This culinary tradition traces back to which specific plant indigenous to West Africa that was used to brew red ceremonial drinks?',
    choices: ["The Hibiscus flower", "Rooibos", "Rosehip", "Kola Nut"],
    answer: "The Hibiscus flower",
    note: "Hibiscus is often used to make traditional drinks like bissap or sorrel.",
  },
  {
    prompt:
      "In Black car culture, particularly originating in Los Angeles, what is the name given to customized classic cars fitted with hydraulic jacks that allow the vehicle to raise, lower, or hop?",
    choices: ["Lowriders", "Donks", "Slabs", "Hot Rods"],
    answer: "Lowriders",
    note: "",
  },
  {
    prompt:
      "Long before modern car culture, Black trailblazer Charlie Wiggins helped create a celebrated racing circuit for Black drivers. What was the name of this historic race?",
    choices: [
      "The Gold and Glory Sweepstakes",
      "The Black Diamond Derby",
      "The Gold Leaf Sweepstakes",
      "The Indy Freedom 100",
    ],
    answer: "The Gold and Glory Sweepstakes",
    note: "",
  },
  {
    prompt:
      'Who is the legendary "Grandmother of Juneteenth," the activist who walked from Fort Worth, Texas, to Washington, D.C. at age 89 to campaign for Juneteenth to become a federal holiday?',
    choices: ["Opal Lee", "Coretta Scott King", "Dorothy Height", "Fannie Lou Hamer"],
    answer: "Opal Lee",
    note: "",
  },
  {
    prompt:
      "At the 2024 Paris Olympics, which three athletes stood on the floor exercise podium in the widely shared image marking the first time all three medalists were Black women?",
    choices: [
      "Rebeca Andrade, Simone Biles, and Jordan Chiles",
      "Gabby Douglas, Sunisa Lee, and Shilese Jones",
      "Rebeca Andrade, Simone Biles, and Ana Maria Barbosu",
      "Shilese Jones, Jordan Chiles, and Konnor McClain",
    ],
    answer: "Rebeca Andrade, Simone Biles, and Jordan Chiles",
    note: "The image of Biles and Chiles bowing to Andrade became a global symbol of joy and sisterhood.",
  },
  {
    prompt:
      "In 1872, Black community leaders in Texas purchased land to safely host Juneteenth celebrations, creating the oldest public park in Texas. What is the name of this historic park in Houston?",
    choices: ["Emancipation Park", "Freedom Plaza", "Jubilee Grounds", "Lincoln Heritage Park"],
    answer: "Emancipation Park",
    note: "During segregation, Black Americans were banned from many public parks, so they bought land of their own.",
  },
  {
    prompt:
      'In 2023, the global music community celebrated the 50th anniversary of hip-hop. Who was the pioneering DJ credited with hosting the 1973 Bronx party that launched the culture and popularized the "breakbeat" style of DJing?',
    choices: ["DJ Kool Herc", "Grandmaster Flash", "Afrika Bambaataa", "DJ Screw"],
    answer: "DJ Kool Herc",
    note: "Cindy Campbell, his sister, organized the original back-to-school party.",
  },
  {
    prompt:
      "Who made history as the first African American woman to travel into space, blasting off aboard the Space Shuttle Endeavour in September 1992?",
    choices: ["Dr. Mae Jemison", "Jeanette Epps", "Joan Higginbotham", "Jessica Watkins"],
    answer: "Dr. Mae Jemison",
    note: "She later became the first real-life astronaut to appear on Star Trek.",
  },
  {
    prompt:
      "Lewis Hamilton is widely regarded as one of the greatest drivers ever. Which elite racing circuit does he compete in?",
    choices: ["Formula 1 (F1)", "NASCAR", "IndyCar", "Le Mans"],
    answer: "Formula 1 (F1)",
    note: "Hamilton became Formula 1's first Black driver in 2007 and has won seven world championships.",
  },
];

const leaderboardKey = "juneteenth-trivia-leaderboard";
const maxLeaderboardEntries = 10;
const config = window.TRIVIA_CONFIG || {};
const backendConfig = config.backend || {};
let firebaseServicesPromise = null;

const screens = {
  welcome: document.getElementById("welcome-screen"),
  game: document.getElementById("game-screen"),
  results: document.getElementById("results-screen"),
};

const startButton = document.getElementById("start-game");
const quizForm = document.getElementById("quiz-form");
const questionNumber = document.getElementById("question-number");
const questionHeading = document.getElementById("question-heading");
const choicesContainer = document.getElementById("choices");
const progressText = document.getElementById("progress-text");
const scoreText = document.getElementById("score-text");
const progressBar = document.getElementById("quiz-progress");
const feedback = document.getElementById("feedback");
const submitButton = document.getElementById("submit-answer");
const nextButton = document.getElementById("next-question");
const finalScore = document.getElementById("final-score");
const leaderboardForm = document.getElementById("leaderboard-form");
const playerNameInput = document.getElementById("player-name");
const leaderboardMessage = document.getElementById("leaderboard-message");
const leaderboardList = document.getElementById("leaderboard-list");
const playAgainButton = document.getElementById("play-again");

const state = {
  currentIndex: 0,
  score: 0,
  submitted: false,
  choices: [],
  savedScore: false,
  leaderboard: [],
};

startButton.addEventListener("click", startGame);
quizForm.addEventListener("change", handleChoiceChange);
quizForm.addEventListener("submit", handleSubmit);
nextButton.addEventListener("click", goToNextQuestion);
leaderboardForm.addEventListener("submit", saveLeaderboardEntry);
playAgainButton.addEventListener("click", resetGame);

initializeApp();

async function initializeApp() {
  state.leaderboard = await loadLeaderboard();
  renderLeaderboard();
}

function startGame() {
  state.currentIndex = 0;
  state.score = 0;
  state.submitted = false;
  state.savedScore = false;
  leaderboardMessage.textContent = "";
  showScreen("game");
  renderQuestion();
}

function handleChoiceChange() {
  if (!state.submitted) {
    submitButton.disabled = !getSelectedChoice();
  }
}

function handleSubmit(event) {
  event.preventDefault();

  if (state.submitted) {
    return;
  }

  const selectedChoice = getSelectedChoice();

  if (!selectedChoice) {
    setFeedback("Choose an answer before continuing.", "warning");
    return;
  }

  const currentQuestion = questions[state.currentIndex];
  const isCorrect = selectedChoice === currentQuestion.answer;

  if (isCorrect) {
    state.score += 1;
  }

  state.submitted = true;
  submitButton.disabled = true;
  nextButton.hidden = false;
  nextButton.textContent =
    state.currentIndex === questions.length - 1 ? "See results" : "Next question";

  disableChoices();
  scoreText.textContent = `Score: ${state.score}`;

  const noteText = currentQuestion.note ? ` ${currentQuestion.note}` : "";

  if (isCorrect) {
    setFeedback(`Correct. ${noteText}`.trim(), "success");
  } else {
    setFeedback(
      `Not quite. The correct answer is ${currentQuestion.answer}.${noteText}`,
      "warning",
    );
  }
}

function goToNextQuestion() {
  if (state.currentIndex === questions.length - 1) {
    renderResults();
    return;
  }

  state.currentIndex += 1;
  state.submitted = false;
  renderQuestion();
}

function renderQuestion() {
  const currentQuestion = questions[state.currentIndex];
  state.choices = shuffle([...currentQuestion.choices]);

  questionNumber.textContent = String(state.currentIndex + 1);
  questionHeading.textContent = currentQuestion.prompt;
  progressText.textContent = `Question ${state.currentIndex + 1} of ${questions.length}`;
  scoreText.textContent = `Score: ${state.score}`;
  progressBar.max = questions.length;
  progressBar.value = state.currentIndex + 1;

  choicesContainer.innerHTML = "";

  state.choices.forEach((choice, index) => {
    const label = document.createElement("label");
    label.className = "choice";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = choice;
    input.id = `choice-${index}`;

    const text = document.createElement("span");
    text.textContent = choice;

    label.append(input, text);
    choicesContainer.appendChild(label);
  });

  submitButton.disabled = true;
  nextButton.hidden = true;
  setFeedback("", "");
  questionHeading.focus();
}

function renderResults() {
  showScreen("results");

  const percent = Math.round((state.score / questions.length) * 100);
  finalScore.textContent = `You scored ${state.score} out of ${questions.length} (${percent}%).`;
  leaderboardMessage.textContent = "";
  leaderboardMessage.dataset.tone = "";
  leaderboardForm.hidden = state.savedScore;
  playerNameInput.value = "";
  playerNameInput.disabled = false;
  renderLeaderboard();
  playerNameInput.focus();
}

async function saveLeaderboardEntry(event) {
  event.preventDefault();

  const name = playerNameInput.value.trim();

  if (!name) {
    setLeaderboardMessage("Enter a name before saving your score.", "warning");
    return;
  }

  const leaderboard = state.leaderboard;
  const nameTaken = leaderboard.some(
    (entry) => entry.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
  );

  if (nameTaken) {
    setLeaderboardMessage("That name has already played on this device. Please use a different name.", "warning");
    return;
  }

  playerNameInput.disabled = true;
  setLeaderboardMessage("Saving score...", "success");

  const saveResult = await saveScore({
    name,
    score: state.score,
    total: questions.length,
  });

  playerNameInput.disabled = false;

  if (!saveResult.ok) {
    setLeaderboardMessage(saveResult.message, "warning");
    return;
  }

  state.savedScore = true;
  state.leaderboard = await loadLeaderboard();
  leaderboardForm.hidden = true;
  setLeaderboardMessage(saveResult.message, "success");
  renderLeaderboard();
  playAgainButton.focus();
}

function resetGame() {
  showScreen("welcome");
  feedback.textContent = "";
  feedback.dataset.tone = "";
  leaderboardMessage.textContent = "";
  leaderboardMessage.dataset.tone = "";
  startButton.focus();
}

function showScreen(screenName) {
  Object.entries(screens).forEach(([name, screen]) => {
    screen.hidden = name !== screenName;
  });
}

function disableChoices() {
  const inputs = choicesContainer.querySelectorAll("input");
  inputs.forEach((input) => {
    input.disabled = true;
  });
}

function getSelectedChoice() {
  const selected = choicesContainer.querySelector('input[name="answer"]:checked');
  return selected ? selected.value : "";
}

function setFeedback(message, tone) {
  feedback.textContent = message;
  feedback.dataset.tone = tone;
}

function setLeaderboardMessage(message, tone) {
  leaderboardMessage.textContent = message;
  leaderboardMessage.dataset.tone = tone;
}

function renderLeaderboard() {
  const leaderboard = state.leaderboard;
  leaderboardList.innerHTML = "";

  if (!leaderboard.length) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No scores yet. Be the first person on the board.";
    leaderboardList.appendChild(emptyItem);
    return;
  }

  leaderboard.forEach((entry) => {
    const item = document.createElement("li");
    const wrapper = document.createElement("div");
    wrapper.className = "leaderboard-entry";

    const name = document.createElement("strong");
    name.textContent = entry.name;

    const score = document.createElement("span");
    score.textContent = `${entry.score}/${entry.total}`;

    wrapper.append(name, score);
    item.appendChild(wrapper);
    leaderboardList.appendChild(item);
  });
}

function getLeaderboard() {
  try {
    const stored = localStorage.getItem(leaderboardKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

async function loadLeaderboard() {
  if (isFirebaseConfigured()) {
    const remoteResult = await fetchFirebaseLeaderboard();
    if (remoteResult.ok) {
      return remoteResult.data;
    }
  }

  if (isSupabaseConfigured()) {
    const remoteResult = await fetchSupabaseLeaderboard();
    if (remoteResult.ok) {
      return remoteResult.data;
    }
  }

  return getLeaderboard();
}

async function saveScore(entry) {
  if (isFirebaseConfigured()) {
    return saveFirebaseScore(entry);
  }

  if (isSupabaseConfigured()) {
    return saveSupabaseScore(entry);
  }

  const leaderboard = getLeaderboard();
  leaderboard.push({
    name: entry.name,
    score: entry.score,
    total: entry.total,
    createdAt: Date.now(),
  });

  leaderboard.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.createdAt - b.createdAt;
  });

  localStorage.setItem(
    leaderboardKey,
    JSON.stringify(leaderboard.slice(0, maxLeaderboardEntries)),
  );

  return {
    ok: true,
    message: "Score saved to the local leaderboard on this device.",
  };
}

async function fetchFirebaseLeaderboard() {
  try {
    const { db, collection, getDocs } = await getFirebaseServices();
    const snapshot = await getDocs(collection(db, getLeaderboardCollectionName()));
    const rows = snapshot.docs.map((document) => document.data());

    rows.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (a.created_at || 0) - (b.created_at || 0);
    });

    return {
      ok: true,
      data: rows.slice(0, maxLeaderboardEntries).map((row) => ({
        name: row.player_name,
        score: row.score,
        total: row.total,
        createdAt: row.created_at,
      })),
    };
  } catch (error) {
    return { ok: false, data: [] };
  }
}

async function saveFirebaseScore(entry) {
  try {
    const { db, doc, runTransaction } = await getFirebaseServices();
    const normalizedName = normalizePlayerName(entry.name);
    const docRef = doc(
      db,
      getLeaderboardCollectionName(),
      encodeURIComponent(normalizedName),
    );

    await runTransaction(db, async (transaction) => {
      const existingEntry = await transaction.get(docRef);

      if (existingEntry.exists()) {
        throw new Error("duplicate-name");
      }

      transaction.set(docRef, {
        player_name: entry.name,
        player_name_normalized: normalizedName,
        score: entry.score,
        total: entry.total,
        created_at: Date.now(),
      });
    });

    return {
      ok: true,
      message: "Score saved to the shared leaderboard.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "duplicate-name") {
      return {
        ok: false,
        message: "That name has already played. Please use a different name.",
      };
    }

    return {
      ok: false,
      message: "The shared leaderboard is unavailable right now.",
    };
  }
}

async function fetchSupabaseLeaderboard() {
  const table = encodeURIComponent(getLeaderboardTable());
  const url = `${stripTrailingSlash(backendConfig.supabaseUrl)}/rest/v1/${table}?select=player_name,score,total,created_at&order=score.desc,created_at.asc&limit=${maxLeaderboardEntries}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: createSupabaseHeaders(),
    });

    if (!response.ok) {
      return { ok: false, data: [] };
    }

    const rows = await response.json();
    return {
      ok: true,
      data: rows.map((row) => ({
        name: row.player_name,
        score: row.score,
        total: row.total,
        createdAt: row.created_at,
      })),
    };
  } catch (error) {
    return { ok: false, data: [] };
  }
}

async function saveSupabaseScore(entry) {
  const table = encodeURIComponent(getLeaderboardTable());
  const url = `${stripTrailingSlash(backendConfig.supabaseUrl)}/rest/v1/${table}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...createSupabaseHeaders(),
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        player_name: entry.name,
        score: entry.score,
        total: entry.total,
      }),
    });

    if (response.ok) {
      return {
        ok: true,
        message: "Score saved to the shared leaderboard.",
      };
    }

    const errorText = await response.text();

    if (response.status === 409 || errorText.toLowerCase().includes("duplicate")) {
      return {
        ok: false,
        message: "That name has already played. Please use a different name.",
      };
    }

    return {
      ok: false,
      message: "The shared leaderboard could not save this score right now.",
    };
  } catch (error) {
    return {
      ok: false,
      message: "The shared leaderboard is unavailable right now.",
    };
  }
}

function isSupabaseConfigured() {
  return (
    backendConfig.provider === "supabase" &&
    Boolean(backendConfig.supabaseUrl) &&
    Boolean(backendConfig.supabasePublishableKey)
  );
}

function isFirebaseConfigured() {
  const firebaseConfig = backendConfig.firebaseConfig || {};
  return (
    backendConfig.provider === "firebase" &&
    Boolean(firebaseConfig.apiKey) &&
    Boolean(firebaseConfig.projectId) &&
    Boolean(firebaseConfig.appId)
  );
}

function createSupabaseHeaders() {
  return {
    apikey: backendConfig.supabasePublishableKey,
    Authorization: `Bearer ${backendConfig.supabasePublishableKey}`,
  };
}

function getLeaderboardTable() {
  return backendConfig.leaderboardTable || "trivia_leaderboard";
}

function getLeaderboardCollectionName() {
  return backendConfig.leaderboardCollection || "trivia_leaderboard";
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

async function getFirebaseServices() {
  if (!firebaseServicesPromise) {
    firebaseServicesPromise = loadFirebaseServices();
  }

  return firebaseServicesPromise;
}

async function loadFirebaseServices() {
  const [{ initializeApp }, { getFirestore, collection, getDocs, doc, runTransaction }] =
    await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js"),
    ]);

  const app = initializeApp(backendConfig.firebaseConfig);
  const db = getFirestore(app);

  return {
    db,
    collection,
    getDocs,
    doc,
    runTransaction,
  };
}

function normalizePlayerName(value) {
  return value.trim().toLocaleLowerCase();
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}
