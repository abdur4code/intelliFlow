// ==================================================================
// -------------------- AUTHENTICATION UI LOGIC ---------------------
// ==================================================================
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

authTabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    // Remove active state from all tabs
    authTabs.forEach(t => t.classList.remove('is-active'));

    // Add active state to clicked tab
    const clickedTab = e.currentTarget;
    clickedTab.classList.add('is-active');

    // Get the target form
    const targetView = clickedTab.dataset.view;

    // Toggle form visibility
    if (targetView === 'login') {
      registerForm.classList.add('is-hidden');
      loginForm.classList.remove('is-hidden');
    } else if (targetView === 'register') {
      loginForm.classList.add('is-hidden');
      registerForm.classList.remove('is-hidden');
    }
  });
});

// ==================================================================
// 1. AUTHENTICATION HELPERS & GATEKEEPER
// ==================================================================
const saveUserData = (key, data) => {
  const activeUser = localStorage.getItem('currentUser');
  if (activeUser) {
    localStorage.setItem(`${activeUser}_${key}`, JSON.stringify(data));
  }
};

const getUserData = (key) => {
  const activeUser = localStorage.getItem('currentUser');
  if (activeUser) {
    const data = localStorage.getItem(`${activeUser}_${key}`);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

// Setup the App View variables
const appView = document.querySelector('.app');
const authView = document.getElementById('authView');

const toggleAppVisibility = (showDashboard) => {
  if (showDashboard) {
    authView.classList.add('is-hidden');
    appView.classList.remove('is-hidden');
    loadUserDashboard();
  } else {
    appView.classList.add('is-hidden');
    authView.classList.remove('is-hidden');
  }
};

// Check login status immediately
document.addEventListener('DOMContentLoaded', () => {
  const activeUser = localStorage.getItem('currentUser');
  if (activeUser) {
    toggleAppVisibility(true);
  } else {
    toggleAppVisibility(false);
  }
});

// ==================================================================
// ----------------------- REGISTRATION LOGIC -----------------------
// ==================================================================

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get input values
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPass').value;

  // Fetch our global users "database" from localStorage
  const usersDB = JSON.parse(localStorage.getItem('flow_users')) || [];

  // Check if email already exists
  const userExists = usersDB.some(user => user.email === email);
  if (userExists) {
    alert('An account with this email already exists. Please log in.');
    return;
  }

  // Create the new user record
  const newUser = {
    id: 'UID-' + Date.now().toString(36),
    name: name,
    email: email,
    password: password,
    createdAt: Date.now()
  };

  //  Save to global database
  usersDB.push(newUser);
  localStorage.setItem('flow_users', JSON.stringify(usersDB));

  // Set active session pointer
  localStorage.setItem('currentUser', email);

  // Update the UI greeting with their actual name
  localStorage.setItem(`${email}_name`, name);

  // Clear form and enter dashboard
  registerForm.reset();
  toggleAppVisibility(true);
});

// ==================================================================
// -------------------------- LOGIN LOGIC ---------------------------
// ==================================================================

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  //  Get input values
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPass').value;

  //  Fetch global users database
  const usersDB = JSON.parse(localStorage.getItem('flow_users')) || [];

  //  Find the user by email
  const user = usersDB.find(u => u.email === email);

  //  Verify user exists and password matches
  if (!user || user.password !== password) {
    alert('Invalid email or password. Please try again.');
    return;
  }

  //  Success! Set active session pointer
  localStorage.setItem('currentUser', user.email);
  localStorage.setItem(`${user.email}_name`, user.name);

  //  Clear form and enter dashboard
  loginForm.reset();
  toggleAppVisibility(true);
});

// ==================================================================
// ----------------- DASHBOARD LOAD & LOGOUT LOGIC ------------------
// ==================================================================

const loadUserDashboard = () => {
  const activeEmail = localStorage.getItem('currentUser');
  const activeName = localStorage.getItem(`${activeEmail}_name`) || 'User';

  //  Update the Hero Greeting Name
  const heroNameSpan = document.querySelector('.hero__title span');
  if (heroNameSpan) {
    heroNameSpan.textContent = activeName;
  }

  //  Update the Sidebar Profile Name
  const profileName = document.querySelector('.nav__profile-name');
  if (profileName) {
    profileName.textContent = activeName;
  }

  //  Fill the global variables using the new helper
  todoDataSet = getUserData('todoData') || [];
  goalsDataSet = getUserData('goalsData') || [];
  plannerData = getUserData('plannerData') || {};
  savedData = getUserData('pomoStats');
  
  // Pomodoro needs a specific structure
  pomoStats = getUserData('pomoStats') || {
    allTimeFocusMinutes: 0,
    allTimeSessions: 0,
    todayFocusMinutes: 0,
    todaySessions: 0,
    lastDate: new Date().toDateString()
  };

  // Call your existing render functions
  renderTodo(todoDataSet);
  renderGoals();
  renderPlanner();
  updateStatsUI(); 
  updatePomoCycleUI();
};

// Logout Functionality
const logoutBtn = document.querySelector('.nav__logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // Clear the active session
    localStorage.removeItem('currentUser');

    // Send back to auth screen
    toggleAppVisibility(false);
  });
}

//==============================================
//------------Navigation shell------------------
//==============================================
const bentoCard = document.querySelector('.bento');
const navMenu = document.querySelector('.nav__menu');
const navBtns = document.querySelectorAll('.nav__item')
const backBtns = document.querySelectorAll('.back-btn')
// ==========================
// Navigation Functionality
// ==========================

// ------ShowNav functionality-----
function showView(target) {
  const view = document.getElementById(`${target}View`);
  if (!view) return;

  bentoCard.classList.add('is-hidden');
  document.querySelectorAll('.feature-view').forEach(elem => {
    elem.classList.add('is-hidden');
  })

  view.classList.remove('is-hidden');

  setActiveNav(target); //active navigation handle
}

// ------show Dashboard functionality------
function showDashboard() {
  document.querySelectorAll('.feature-view').forEach(elem => {
    elem.classList.add('is-hidden');
  })

  bentoCard.classList.remove('is-hidden');

  setActiveNav('dashboard');
}

// -------Active Nav Handle-------
function setActiveNav(target) {
  navBtns.forEach((btn) => {
    btn.classList.remove('is-active');
  })

  const activeBtn = document.querySelector(`[data-target="${target}"]`);
  if (activeBtn) {
    activeBtn.classList.add('is-active');
  }
}

// -------Event Deligation on NavMenu-------
navMenu.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-target]');

  if (!btn) return;

  const target = btn.dataset.target;
  if (target === 'dashboard') {
    showDashboard();
  } else {
    showView(target);
  }
})

// -------Event Deligation on Bento card------
bentoCard.addEventListener('click', (e) => {
  const card = e.target.closest('[data-target]');

  if (!card) return;

  showView(card.dataset.target);
})

// ---------Feature Back to dashboard handle-------
backBtns.forEach((btn) => {
  btn.addEventListener('click', showDashboard);
})

// ==================================================================
// -------------------- THEME & GREETING TOGGLE ---------------------
// ==================================================================

const themeTrigger = document.getElementById('themeTrigger');
const themeMenu = document.getElementById('themeMenu');
const themeOptions = document.querySelectorAll('.theme-option');
const heroTitle = document.querySelector('.hero__title');
const heroBg = document.querySelector('.hero');

// Toggle Dropdown Menu visibility
themeTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  themeMenu.classList.toggle('is-open');
});

// Close menu when clicking outside of it
document.addEventListener('click', (e) => {
  if (!themeTrigger.contains(e.target) && !themeMenu.contains(e.target)) {
    themeMenu.classList.remove('is-open');
  }
});

// Determine the correct theme based on the current hour
const getAutoTheme = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// Update the Welcome Greeting
const updateGreeting = (theme) => {
  let greeting = 'Hello';
  if (theme === 'morning') {
    greeting = 'Good morning';
    heroBg.style.background = "url('./assets/morning-theme.png') no-repeat center center / cover";
    document.querySelector('.hero__scrim').classList.remove('is-hidden');
  }
  else if (theme === 'afternoon') {
    greeting = 'Good afternoon';
    heroBg.style.background = "url('./assets/afternoon-theme.jpg') no-repeat center center / cover";
    document.querySelector('.hero__scrim').classList.remove('is-hidden');
  }
  else if (theme === 'evening') {
    greeting = 'Good evening';
    heroBg.style.background = "url('./assets/evening-theme.jpg') no-repeat center center / cover";
    document.querySelector('.hero__scrim').classList.remove('is-hidden');
  }
  else if (theme === 'night') {
    greeting = 'Good night';
    heroBg.style.background = "url('./assets/night-theme.png') no-repeat center center / cover";
    document.querySelector('.hero__scrim').classList.add('is-hidden');
  }

  // Keep the user name formatted inside the span
  const nameSpan = heroTitle.querySelector('span') ? heroTitle.querySelector('span').outerHTML : '<span>Abdur</span>';
  heroTitle.innerHTML = `${greeting}, ${nameSpan}`;
};

const applyTheme = (themeSelection) => {
  // If set to 'auto', calculate the real theme. Otherwise, use the manual selection.
  const activeTheme = themeSelection === 'auto' ? getAutoTheme() : themeSelection;

  // Apply CSS Root Class to <html>
  document.documentElement.setAttribute('data-theme', activeTheme);

  // Apply the matching greeting
  updateGreeting(activeTheme);

  // Update UI active state in the dropdown menu
  themeOptions.forEach(btn => {
    btn.classList.remove('is-selected');
    if (btn.dataset.theme === themeSelection) {
      btn.classList.add('is-selected');
    }
  });

  // Save preference to localStorage so it remembers the choice on reload
  localStorage.setItem('flow_theme', themeSelection);
};

// Handle clicks on Theme Menu Options
themeOptions.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const selectedTheme = e.currentTarget.dataset.theme;
    applyTheme(selectedTheme);
    themeMenu.classList.remove('is-open'); // Close menu after selection
  });
});

// Initialize on page load
const savedTheme = localStorage.getItem('flow_theme') || 'auto';
applyTheme(savedTheme);

// Keep 'Auto' updated  
setInterval(() => {
  const currentSelection = localStorage.getItem('flow_theme') || 'auto';
  if (currentSelection === 'auto') {
    applyTheme('auto');
  }
}, 60000);

// ==================================================================
// --------------------LIVE DASHBOARD CLOCK -------------------------
// ==================================================================
const updateClock = () => {
  const now = new Date();

  // Format the Time (09:41 PM)
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert 24hr time to 12hr time
  hours = hours % 12;
  hours = hours ? hours : 12;

  const paddedHours = hours.toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  // Format the Date 
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const dateNum = now.getDate();

  // Update the HTML
  const clockText = document.querySelector('#clockText');
  const dateText = document.querySelector('#dateText');
  if (clockText) {
    clockText.textContent = `${paddedHours}:${minutes} ${ampm}`;
  }
  if (dateText) {
    dateText.textContent = `${dayName}, ${dateNum} ${monthName}`;
  }
};

// --- INITIALIZE THE CLOCK ---
updateClock();

// Update every 1 second
setInterval(updateClock, 1000);


// ==================================================================
// ---------------------WEATHER WIDGET Start---------------------------
// ==================================================================

const getWeatherUI = (code, isDay) => {
  const time = isDay === 1 ? 'day' : 'night';
  const baseUrl = 'https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all';

  // We define the extra icons here so they are always available
  const uiAssets = {
    humidityIcon: `${baseUrl}/humidity.svg`,
    windIcon: `${baseUrl}/wind.svg`,
    text: 'Unknown',
    icon: `${baseUrl}/not-available.svg`
  };

  if (code === 0) { uiAssets.text = 'Clear'; uiAssets.icon = `${baseUrl}/clear-${time}.svg`; }
  else if (code >= 1 && code <= 3) { uiAssets.text = 'Partly Cloudy'; uiAssets.icon = `${baseUrl}/partly-cloudy-${time}.svg`; }
  else if (code >= 45 && code <= 48) { uiAssets.text = 'Fog'; uiAssets.icon = `${baseUrl}/fog.svg`; }
  else if (code >= 51 && code <= 67) { uiAssets.text = 'Rain'; uiAssets.icon = `${baseUrl}/rain.svg`; }
  else if (code >= 71 && code <= 77) { uiAssets.text = 'Snow'; uiAssets.icon = `${baseUrl}/snow.svg`; }
  else if (code >= 80 && code <= 82) { uiAssets.text = 'Showers'; uiAssets.icon = `${baseUrl}/rain.svg`; }
  else if (code >= 95) { uiAssets.text = 'Storm'; uiAssets.icon = `${baseUrl}/thunderstorms.svg`; }

  return uiAssets;
};



// --- WEATHER WIDGET ---
//  Grab HTML elements
const tempElement = document.querySelector('#weatherTemp');
const descElement = document.querySelector('#weatherDesc');
const iconElement = document.querySelector('#weatherIcon');
const fetchWeather = async (lat, lon) => {
  // 1. Weather URL (Now asking for humidity and wind speed!)
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day`;

  // 2. City Name URL (Free reverse geocoding)
  const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

  try {
    // Fetch both APIs simultaneously for maximum speed
    const [weatherRes, geoRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(geoUrl)
    ]);

    const weatherData = await weatherRes.json();
    const geoData = await geoRes.json();

    // --- EXTRACT DATA ---
    const temp = weatherData.current.temperature_2m;
    const humidity = weatherData.current.relative_humidity_2m;
    const wind = weatherData.current.wind_speed_10m;
    const code = weatherData.current.weather_code;
    const isDay = weatherData.current.is_day;

    // Sometimes rural areas use 'locality' instead of 'city'
    const cityName = geoData.city || geoData.locality || "Local Area";
    const weatherUI = getWeatherUI(code, isDay);

    // Show The Data in UI
    if (tempElement) tempElement.textContent = `${Math.round(temp)}°C`;
    if (descElement) descElement.textContent = `${cityName} · ${weatherUI.text}`;
    if (iconElement) {
      iconElement.src = weatherUI.icon;
    }

    const humEl = document.querySelector('#weatherHumidity');
    const windEl = document.querySelector('#weatherWind');
    if (humEl) humEl.textContent = humidity;
    if (windEl) windEl.textContent = wind;

    const humIconEl = document.querySelector('#humidityIcon');
    const windIconEl = document.querySelector('#windIcon');
    if (humIconEl) humIconEl.src = weatherUI.humidityIcon;
    if (windIconEl) windIconEl.src = weatherUI.windIcon;

  } catch (error) {
    console.error("Failed to fetch weather:", error);
    descElement.textContent = "Weather offline";
  }


};

const initWeather = () => {
  // Check if the browser supports geolocation
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // User clicked "Allow"!
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather(lat, lon);
      },
      (error) => {
        // User clicked "Block" 
        console.warn("Location denied. Using default location.");
        fetchWeather(23.2517, 77.4667); // Defaulting to Sheryians
      }
    );
  } else {
    // Browser is old not support location
    fetchWeather(23.2517, 77.4667);
  }
};

initWeather();

// Update in the background every 30 minutes
setInterval(initWeather, 30 * 60 * 1000);

// ==================================================================
// ---------------------Motivation Quotes Start---------------------------
// ==================================================================
const newQuotesBtn = document.querySelector('#newQuotesBtn');
const quoteText = document.querySelector('.quote-text');
const quoteAuthor = document.querySelector('.quote-author');

const fetchQuote = async () => {
  const url = 'https://dummyjson.com/quotes/random';

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Update the UI
    if (quoteText) quoteText.textContent = `"${data.quote}"`;
    if (quoteAuthor) quoteAuthor.textContent = `- ${data.author}`;

  } catch (error) {
    console.error("Failed to fetch quote:", error);
    // Fallback quote just in case the internet drops!
    if (quoteText) quoteText.textContent = `"Stay hungry, stay foolish."`;
    if (quoteAuthor) quoteAuthor.textContent = `- Steve Jobs`;
  }
};

// Listen for clicks on the reload button
document.querySelector('#reloadQuoteBtn').addEventListener('click', fetchQuote);

// Fetch the first quote when dashboard loads
fetchQuote();

// ==================================================================
// ---------------------Todo Section Start---------------------------
// ==================================================================

const todoForm = document.querySelector('#todoAddForm');
const todoInput = document.querySelector('#todoInput');

let todoDataSet = [];

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const task = todoInput.value.trim();

  if (task === "") {
    alert("Task can't be blank!")
    return todoForm.reset();
  }


  const getUniqueId = () => 'TID-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  const todoData = {
    task,
    id: getUniqueId(),
    complete: false,
    important: false,
    createdAt: Date.now(),
    editedAt: null,
    completedAt: null,
  }

  todoDataSet.push(todoData);
  saveUserData('todoData', todoDataSet)

  todoForm.reset();
  renderTodo(todoDataSet)
})

// =========================
// Timestamp functionality
// =========================
const formatTaskDate = (timestamp, prefix) => {
  // Fallback just in case a timestamp is missing
  if (!timestamp) return `${prefix} - Unknown date`;

  const date = new Date(timestamp);
  const now = new Date();

  // Strip the time away to compare just the calendar days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Format the time to 12-hour (e.g., "2:30pm")
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const timeString = `${hours}:${minutes} ${ampm}`;

  // Return the dynamic string
  if (taskDate.getTime() === today.getTime()) {
    return `${prefix} today · ${timeString}`;
  } else if (taskDate.getTime() === yesterday.getTime()) {
    return `${prefix} yesterday · ${timeString}`;
  } else {
    const dateString = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${prefix} · ${dateString}, at ${timeString}`;
  }
};

// ==================================
// ------Todo Render Function--------
// ==================================
const todoFullList = document.querySelector('#todoFullList');

const renderTodo = (renderData) => {
  let completedTaskCount = 0
  let importantTaskCount = 0
  let pendingTaskCount = 0
  let totalTask = todoDataSet.length;

  const taskFilterCount = () => {
    todoDataSet.forEach((elem) => {
      if (elem.complete) {
        completedTaskCount += 1;
      } else {
        pendingTaskCount += 1;
      }

      if (elem.important) {
        importantTaskCount += 1;
      }
    })
  }
  taskFilterCount();

  if (totalTask > 0 && totalTask === completedTaskCount) {
    document.querySelector('.hero__subtitle').textContent = `🎉All tasks completed!`
  } else if (pendingTaskCount > 0) {
    document.querySelector('.hero__subtitle').textContent = `⏳${pendingTaskCount} tasks left today`
  } else {
    document.querySelector('.hero__subtitle').textContent = `🎯Start focus on your goals`
  }
  // -- Filter tabs Count manage--
  document.querySelector('#todoCountBadge').textContent = `${totalTask} tasks · ${pendingTaskCount} pending`
  document.querySelector('[data-filter="all"]').innerHTML = `All <span>${totalTask}</span>`;
  document.querySelector('[data-filter="pending"]').innerHTML = `Pending <span>${pendingTaskCount}</span>`;
  document.querySelector('[data-filter="important"]').innerHTML = `Important <span>${importantTaskCount}</span>`;
  document.querySelector('[data-filter="completed"]').innerHTML = `Completed <span>${completedTaskCount}</span>`;
  let metaTimestamp = "";

  todoFullList.innerHTML = "";
  for (i = renderData.length - 1; i >= 0; i--) {
    elem = renderData[i];

    if (elem.complete && elem.completedAt) {
      metaTimestamp = formatTaskDate(elem.completedAt, "Completed");
    }
    else if (elem.editedAt) {
      metaTimestamp = formatTaskDate(elem.editedAt, "Edited");
    } else {
      metaTimestamp = formatTaskDate(elem.createdAt, "Added");
    }

    todoFullList.innerHTML += ` <li class="todo-row" data-key="${elem.id}" data-important="${elem.important}" data-completed="${elem.complete}">
              <button onclick="taskComplete('${elem.id}')" class="todo-row__check ${elem.complete ? 'is-checked' : ''}" title="Mark complete"></button>
              <div class="todo-row__body">
                <p class="todo-row__text" contenteditable="false">
                  ${elem.task}
                </p>
                <span class="todo-row__meta">${metaTimestamp}</span>
              </div>
              <div class="todo-row__actions">
                <button
                  onclick="taskImportant('${elem.id}')"
                  class="todo-row__action is-star ${elem.important ? "is-active" : ""}"
                  title="Mark as important"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="16"
                    height="16"
                  >
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                </button>
                <button type="button" onclick="taskEdit(event, '${elem.id}')" class="todo-row__action is-edit" title="Edit task">
                  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                    <path
                      d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <button onclick="taskDelete('${elem.id}')" class="todo-row__action is-delete" title="Delete task">
                  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                    <path
                      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M10 11v6M14 11v6"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>
            </li>`
  }

  // ----------Dashboard Todo Preview Render--------
  const dashTodoList = document.querySelector('.todo-list');
  const todoCardBadge = document.querySelector("#todoCardBadge");

  todoCardBadge.textContent = `${pendingTaskCount} pending`
  dashTodoList.innerHTML = "";

  count = 0;
  let taskDashTimeMeta = "";

  for (i = todoDataSet.length - 1; i >= 0; i--) {
    count += 1;
    if (count > 3) {
      break;
    }
    elem = todoDataSet[i];

    if (elem.complete && elem.completedAt) {
      taskDashTimeMeta = formatTaskDate(elem.completedAt, "Completed");
    }
    else if (elem.editedAt) {
      taskDashTimeMeta = formatTaskDate(elem.editedAt, "Edited");
    } else {
      taskDashTimeMeta = formatTaskDate(elem.createdAt, "Added");
    }

    dashTodoList.innerHTML += `<li class="todo-item" data-key="${elem.id}" data-important="${elem.important}" data-completed="${elem.complete}">
              <button onclick="taskComplete('${elem.id}')" class="todo-row__check ${elem.complete ? 'is-checked' : ''}" title="Mark complete"></button>
              <div class="todo-row__body">
                <p class="todo-row__text" contenteditable="false">
                  ${elem.task}
                </p>
                <span class="todo-row__meta">${taskDashTimeMeta}</span>
              </div>
                <button
                  onclick="taskImportant('${elem.id}')"
                  class="todo-row__action is-star ${elem.important ? "is-active" : ""}"
                  title="Mark as important"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="16"
                    height="16"
                  >
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
            </li>`
  }


  const todoEmptyState = document.querySelectorAll(".todoEmptyState");

  todoEmptyState.forEach(elem => {
    if (totalTask === 0) {
      elem.classList.remove('is-hidden');
    } else {
      elem.classList.add('is-hidden');
    }
  })

}
renderTodo(todoDataSet)

// =============Task Complete Functionality=======
const taskComplete = (id) => {
  todoDataSet.forEach(elem => {
    if (elem.id === id) {
      elem.complete = !elem.complete;
      if (elem.complete) {
        elem.completedAt = Date.now();
      }
    }

  })
  saveUserData('todoData', todoDataSet)
  renderTodo(todoDataSet)
}
// =============Task Important Functionality=======
const taskImportant = (id) => {
  todoDataSet.forEach(elem => {
    if (elem.id === id) {
      elem.important = !elem.important;
    }
  })
  saveUserData('todoData', todoDataSet)
  renderTodo(todoDataSet)
}

// =========Edit Task Functionality============
const taskEdit = (event, id) => {
  event.stopPropagation();

  const todoRow = event.target.closest('.todo-row');

  if (!todoRow) return;

  todoRow.innerHTML = `
    <div class="task-edit-container">
      <form class="taskEditForm">
        <input class="todo-add__input taskEditInput" type="text" placeholder="Edit task…" />
        <button type="submit" class="btn-primary">Save Edit</button>
        <button type="button" class="btn-primary cancelBtn">Cancel</button>
      </form>
    </div>`;

  // Search only inside this specific row
  const taskEditForm = todoRow.querySelector('.taskEditForm');
  const taskEditInput = todoRow.querySelector('.taskEditInput');
  const cancelBtn = todoRow.querySelector('.cancelBtn');

  // Pre-fill the input
  todoDataSet.forEach(elem => {
    if (elem.id == id) {
      taskEditInput.value = elem.task;
    }
  });

  taskEditInput.focus();

  // Cancel Event
  cancelBtn.addEventListener('click', () => {
    renderTodo(todoDataSet);
  });

  // Submit Event
  taskEditForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const editedTask = taskEditInput.value.trim();

    if (editedTask === "") {
      alert("Task can't be blank!");
      return;
    }

    todoDataSet.forEach(elem => {
      if (elem.id == id) {
        // Only trigger an update if they actually changed the text
        if (elem.task !== editedTask) {
          elem.task = editedTask;
          elem.editedAt = Date.now();
        }
      }
    });

    saveUserData('todoData', todoDataSet)
    renderTodo(todoDataSet);
  });
};
// =============Task Delete Functionality=======
const taskDelete = (id) => {
  let filteredData = todoDataSet.filter(elem => {
    if (elem.id !== id) {
      return true;
    }
  })
  todoDataSet = filteredData;
  saveUserData('todoData', todoDataSet)
  renderTodo(todoDataSet)
}

//=======Filter Task by All/Completed/Important Functionality========= 
const todoFilter = document.querySelectorAll('.todo-filter');

const filterActive = (activeCat) => {
  const activeFilter = document.querySelector(`[data-filter="${activeCat}"]`)
  todoFilter.forEach(e => e.classList.remove('is-active'));
  activeFilter.classList.add('is-active');
}

const filterTaskByCat = (cat) => {
  let filteredDataCat = [];
  if (cat === 'pending') {
    filterActive(cat);
    filteredDataCat = todoDataSet.filter(elem => {
      if (!elem.complete) {
        return true;
      }
    })
  } else if (cat === 'completed') {
    filterActive(cat);
    filteredDataCat = todoDataSet.filter(elem => {
      if (elem.complete) {
        return true;
      }
    })
  } else if (cat === 'important') {
    filterActive(cat);
    filteredDataCat = todoDataSet.filter(elem => {
      if (elem.important) {
        return true;
      }
    })
  } else {
    filterActive('all');
    filteredDataCat = todoDataSet;
  }

  renderTodo(filteredDataCat);
}
// ==================================================================
// ---------------------Goals Section Start---------------------------
// ==================================================================
const goalsAddForm = document.querySelector('#goalsAddForm');
const goalsInput = document.querySelector('#goalsInput');
const goalsFullList = document.querySelector('#goalsFullList');

let goalsDataSet = [];

// ----------Goals form input-----
goalsAddForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const goals = goalsInput.value.trim();

  if (goals === "") {
    alert("Task can't be blank!")
    return goalsAddForm.reset();
  }


  const getUniqueId = () => 'GID-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  const goalsData = {
    goals,
    id: getUniqueId(),
    complete: false,
    createdAt: Date.now(),
    completedAt: null,
  }

  goalsDataSet.push(goalsData);
  saveUserData('goalsData', goalsDataSet)

  goalsAddForm.reset();
  renderGoals(goalsDataSet)
})

// ==================================
// ------Goals Render Function--------
// ==================================
const renderGoals = () => {
  let completedGoalsCount = 0;
  let pendingGoalsCount = 0;
  let totalGoalsCount = goalsDataSet.length;

  const goalsFilterCount = () => {
    goalsDataSet.forEach((elem) => {
      if (elem.complete) {
        completedGoalsCount += 1;
      } else {
        pendingGoalsCount += 1;
      }
    });
  };
  goalsFilterCount();



  // 1. Calculate Percentage
  let progressPercentage = 0;
  if (totalGoalsCount > 0) {
    progressPercentage = Math.round((completedGoalsCount / totalGoalsCount) * 100);
  }

  // 2. Update Stats & Percentage Text
  document.querySelector('#goalsDoneCount').textContent = `${completedGoalsCount}`;
  document.querySelector('#goalsRemainingCount').textContent = `${pendingGoalsCount}`;
  document.querySelector('#goalsPct').textContent = `${progressPercentage}%`;

  // 3. Update the SVG Ring Offset
  const circumference = 314; // Based on r="50" in your HTML
  const offset = circumference - (progressPercentage / 100) * circumference;
  document.querySelector('#goalsRingProgress').style.strokeDashoffset = offset;

  // 4. Toggle the Celebration Banner
  const goalsCelebrate = document.querySelector('#goalsCelebrate');
  if (progressPercentage === 100 && totalGoalsCount > 0) {
    goalsCelebrate.classList.remove('is-hidden');
  } else {
    goalsCelebrate.classList.add('is-hidden');
  }

  // 5. Render the List
  let goalsTimestampMeta = "";
  const goalsFullList = document.querySelector('#goalsFullList');
  goalsFullList.innerHTML = "";

  goalsDataSet.forEach(elem => {
    if (elem.complete && elem.completedAt) {
      goalsTimestampMeta = formatTaskDate(elem.completedAt, "Completed");
    } else {
      goalsTimestampMeta = formatTaskDate(elem.createdAt, "Added");
    }

    goalsFullList.innerHTML += `<li data-key="${elem.id}" class="goal-row ${elem.complete ? "is-done" : ""}" data-completed="${elem.complete}">
              <button
                onclick="goalsComplete('${elem.id}')" 
                class="goal-row__check ${elem.complete ? "is-checked" : ""}"
                title="Mark incomplete"
              >
                <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div class="goal-row__body">
                <p class="goal-row__text">${elem.goals}</p>
                <span class="goal-row__meta">${goalsTimestampMeta}</span>
              </div>
              <button onclick="goalsDelete('${elem.id}')" class="goal-row__delete" title="Delete goal">
                <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                  <path
                    d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M10 11v6M14 11v6"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </li>`;
  });

  // =======Goals Dashboar Preview Render=======
  const goalDashList = document.querySelector('.goal-list');
  const goalBarFill = document.querySelector('.goal-bar__fill');

  goalBarFill.style.width = `${progressPercentage}%`;

  document.querySelector('#goalsCardBadge').textContent = `${completedGoalsCount} / ${totalGoalsCount}`

  goalDashList.innerHTML = "";
  let dashGoalsTimestamp = "";
  count = 0;

  for (i = 0; i < goalsDataSet.length; i++) {
    elem = goalsDataSet[i];
    count++;
    if (count > 6) {
      document.querySelector('.goals-see-more').classList.remove('is-hidden')
      break
    }
    document.querySelector('.goals-see-more').classList.add('is-hidden')
    if (elem.complete && elem.completedAt) {
      dashGoalsTimestamp = formatTaskDate(elem.completedAt, "Completed");
    } else {
      dashGoalsTimestamp = formatTaskDate(elem.createdAt, "Added");
    }

    goalDashList.innerHTML += `<li data-key="${elem.id}" class="goal-item ${elem.complete ? "is-done" : ""}" data-completed="${elem.complete}">
              <button
                onclick="goalsComplete('${elem.id}')" 
                class="goal-item__dot ${elem.complete ? "is-checked" : ""}"
                title="Mark complete"
              >
                ${elem.complete ? `<svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>` : ""}
              </button>
              <div class="goal-row__body">
                <p class="">${elem.goals}</p>
                <span class="goal-row__meta">${dashGoalsTimestamp}</span>
              </div>
            </li>`
  }

  // 6. Manage Empty State
  const goalsEmptyState = document.querySelectorAll(".goalsEmptyState");
  goalsEmptyState.forEach(elem => {
    if (totalGoalsCount === 0) {
      elem.classList.remove('is-hidden');
    } else {
      elem.classList.add('is-hidden');
    }
  })
};

renderGoals();

// =========Goals complete functionality=====
const goalsComplete = (id) => {
  goalsDataSet.forEach(elem => {
    if (elem.id === id) {
      elem.complete = !elem.complete;
      if (elem.complete) {
        elem.completedAt = Date.now();
      }
    }
  })
  saveUserData('goalsData', goalsDataSet)
  renderGoals()
}

// =============Goals Delete Functionality=======
const goalsDelete = (id) => {
  let filteredData = goalsDataSet.filter(elem => {
    if (elem.id !== id) {
      return true;
    }
  })
  goalsDataSet = filteredData;
  saveUserData('goalsData', goalsDataSet)
  renderGoals()
}

// ==================================================================
// ------------------- Daily Planner Section Start ------------------
// ==================================================================

let plannerData = [];

const plannerTimeline = document.querySelector('#plannerTimeline');

const renderPlanner = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  let plannedCount = 0;
  let emptyCount = 0;

  const hourSlots = document.querySelectorAll('#plannerTimeline .planner-hour');

  const existingLine = document.querySelector('.planner-now-line');
  if (existingLine) existingLine.remove();

  hourSlots.forEach(slot => {
    const hour = slot.dataset.hour;
    const noteElem = slot.querySelector('.planner-hour__note');

    // 1. Populate data from localStorage
    const taskText = plannerData[hour] || "";
    noteElem.textContent = taskText;

    // 2. Handle empty vs filled states
    if (taskText === "") {
      noteElem.classList.add('planner-hour__note--empty');
      emptyCount++;
    } else {
      noteElem.classList.remove('planner-hour__note--empty');
      plannedCount++;
    }

    // 3. Highlight current hour & inject the dynamic timeline
    if (parseInt(hour) === currentHour) {
      slot.classList.add('is-now');

      // Calculate how far down the line should be based on current minutes
      const percentage = (currentMinutes / 60) * 100;

      // Create and inject the live tracking line
      const nowLine = document.createElement('div');
      nowLine.classList.add('planner-now-line');
      // Offset slightly to align with the top of the block
      nowLine.style.top = `calc(${percentage}% + 12px)`;
      slot.appendChild(nowLine);

    } else {
      slot.classList.remove('is-now');
    }
  })

  document.querySelector('#plannerPlannedCount').textContent = plannedCount;
  document.querySelector('#plannerEmptyCount').textContent = emptyCount;

  // 5. Update the "Right now" clock and Date Badge
  let displayHours = currentHour % 12;
  displayHours = displayHours ? displayHours : 12;
  const displayMins = currentMinutes < 10 ? '0' + currentMinutes : currentMinutes;
  const ampm = currentHour >= 12 ? 'PM' : 'AM';

  document.querySelector('#plannerNowText').textContent = `${displayHours}:${displayMins} ${ampm}`;

  const dateString = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  document.querySelector('#plannerDateBadge').textContent = dateString;

  // ==========================================
  // 6. Dashboard Planner Preview Render
  // ==========================================
  const dashPlannerRow = document.querySelector('.planner-row');

  let slotsToShow = [];
  const allPlannedHours = Object.keys(plannerData).map(Number).sort((a, b) => a - b);
  let upcomingPlanned = allPlannedHours.filter(h => h >= currentHour);

 
  slotsToShow = [...upcomingPlanned];

  if (slotsToShow.length > 4) {
  
    slotsToShow = slotsToShow.slice(0, 4);
  } else {
   
    let h = currentHour;
    while (slotsToShow.length < 4 && h <= 23) {
      if (!slotsToShow.includes(h)) {
        slotsToShow.push(h);
      }
      h++;
    }

    let fallbackHour = currentHour - 1;
    while (slotsToShow.length < 4 && fallbackHour >= 6) {
      if (!slotsToShow.includes(fallbackHour)) {
        slotsToShow.push(fallbackHour);
      }
      fallbackHour--;
    }
  }

  // Sort all 4 slots chronologically
  slotsToShow.sort((a, b) => a - b);

  dashPlannerRow.innerHTML = "";

  slotsToShow.forEach(hour => {
    // Format the 24hr key into 12hr AM/PM format
    let dispHour = hour % 12;
    dispHour = dispHour ? dispHour : 12;
    const dispHourStr = dispHour < 10 ? '0' + dispHour : dispHour;
    const ampm = hour >= 12 ? 'PM' : 'AM';

    const isNowClass = hour === currentHour ? 'is-now' : '';

    // If there is no data, use the fallback text and add the empty CSS class
    const taskText = plannerData[hour] || "No plan set";
    const emptyClass = !plannerData[hour] ? 'planner-slot--empty' : '';

    dashPlannerRow.innerHTML += `
      <div class="planner-slot ${isNowClass} ${emptyClass}">
        <span class="planner-slot__time">${dispHourStr} ${ampm}</span>
        <span class="planner-slot__text">${taskText}</span>
      </div>`;
  });
}

renderPlanner();

// ==========================
// Planner Edit Functionality
// ==========================

// Click to edit
plannerTimeline.addEventListener('click', (e) => {
  if (e.target.classList.contains('planner-hour__note')) {
    e.target.setAttribute('contenteditable', 'true');
    e.target.focus();

    // Optional: Remove empty class immediately so styling looks normal while typing
    e.target.classList.remove('planner-hour__note--empty');
  }
});

// Save when clicking away
plannerTimeline.addEventListener('focusout', (e) => {
  if (e.target.classList.contains('planner-hour__note')) {
    e.target.setAttribute('contenteditable', 'false');

    const slot = e.target.closest('.planner-hour');
    const hour = slot.dataset.hour;
    const newText = e.target.textContent.trim();

    // Save to dataset
    if (newText === "") {
      delete plannerData[hour]; // If they erased it, delete the key to save space
    } else {
      plannerData[hour] = newText;
    }

    saveUserData('plannerData', plannerData)
    renderPlanner(); // Re-render to update the stats at the top!
  }
});

// Prevent "Enter" from making new lines; force it to save instead
plannerTimeline.addEventListener('keydown', (e) => {
  if (e.target.classList.contains('planner-hour__note') && e.key === 'Enter') {
    e.preventDefault();
    e.target.blur(); // Blurring triggers the 'focusout' event above, saving the data
  }
});

// Update the current time and tracking line every 60 seconds
setInterval(renderPlanner, 60000);

// ==================================================================
// -------------------- Pomodoro Section Start ----------------------
// ==================================================================
let pomoTotalSec = 25 * 60;
let timerInterval;
let isPlaying = false;
let maxSeconds = 25 * 60;
let currentMode = 'pomodoro';
let isAutoStartOn = false;
let isSoundOn = true;

let pomoStats = {
  allTimeFocusMinutes: 0,
  allTimeSessions: 0,
  todayFocusMinutes: 0,
  todaySessions: 0,
  lastDate: new Date().toDateString()
};

const pomoDigits = document.querySelector('#pomoDigits');
const pomoDashDigits = document.querySelector('.pomodoro__digits');
const pomoPlayPauseBtn = document.querySelector('#pomoPlayPauseBtn');
const pomoPlayPauseText = document.querySelector('#pomoPlayPauseText');
const pomoPlayIcon = document.querySelectorAll('.pomoPlayIcon');
const pomoProgressCircle = document.querySelector('#pomoProgressCircle');
const dashPomoProgressCircle = document.querySelector('#dashPomoProgressCircle');
const pomoTab = document.querySelectorAll('.pomo-tab');
const pomoTabs = document.querySelector('#pomoTabs');
const pomoLabel = document.querySelectorAll('.pomoLabel');

// preview-only: Pomodoro stats range toggle (Today / All-time)
document.querySelectorAll('.pomo-range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const range = btn.dataset.range;

    document.querySelectorAll('.pomo-range-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    document.querySelectorAll('[data-range-panel]').forEach(panel => {
      panel.classList.toggle('is-hidden', panel.dataset.rangePanel !== range);
    });
  });
});

// =========Session Cycle Functionality=======
const pomoCycleDots = document.querySelectorAll('.pomo-cycle__dot');

const updatePomoCycleUI = () => {
  const currentCyclePosition = pomoStats.todaySessions % 4;

  document.querySelector('#pomoSessionBadge').textContent = `Session ${currentCyclePosition} of 4`

  pomoCycleDots.forEach((dot, index) => {
    if (index < currentCyclePosition) {
      dot.classList.remove('is-active');
      dot.classList.add('is-done');
    } else if (index === currentCyclePosition) {
      dot.classList.add('is-active');
      dot.classList.remove('is-done');
    } else {
      dot.classList.remove('is-done');
      dot.classList.remove('is-active');
    }
  })

  // --- NEW: Dynamic Encouragement Message ---
  const messageEl = document.querySelector('#pomoCycleMessage');

  if (messageEl) {
    if (currentMode === 'pomodoro') {
      const sessionsLeft = 4 - currentCyclePosition;

      if (sessionsLeft === 4) {
        messageEl.textContent = "Fresh cycle! 4 sessions until a long break. 💪";
      } else if (sessionsLeft === 3) {
        messageEl.textContent = "3 to go. Keep the momentum up! ✨";
      } else if (sessionsLeft === 2) {
        messageEl.textContent = "Halfway there! 2 left. ✨";
      } else if (sessionsLeft === 1) {
        messageEl.textContent = "Just 1 left until a long break! Bring it home. 🔥";
      }
    } else if (currentMode === 'short') {
      messageEl.textContent = "Quick break. Breathe! 🌬️";
    } else {
      messageEl.textContent = "Enjoy your long break! You've earned it. ☕";
    }
  }
}

// ---------Update Stats UI and Data Persistance functionality------
// 1. Update the HTML
const updateStatsUI = () => {
  // Make sure these selectors match your actual HTML IDs or classes!
  const todayTimeEl = document.querySelector('#todayFocusTime');
  const todayCountEl = document.querySelector('#todaySessionCount');
  const allTimeEl = document.querySelector('#allTimeFocusTime');
  const allCountEl = document.querySelector('#allSessionCount');

  const todayHours = Math.floor(pomoStats.todayFocusMinutes / 60);
  const todayMins = pomoStats.todayFocusMinutes % 60;

  const allTimeHours = Math.floor(pomoStats.allTimeFocusMinutes / 60);
  const allTimeMins = pomoStats.allTimeFocusMinutes % 60;

  if (todayTimeEl) todayTimeEl.innerHTML = `${todayHours}<small>h</small> ${todayMins}<small>m</small>`;
  if (todayCountEl) todayCountEl.textContent = pomoStats.todaySessions;
  if (allTimeEl) allTimeEl.innerHTML = `${allTimeHours}<small>h</small> ${allTimeMins}<small>m</small>`;
  if (allCountEl) allCountEl.textContent = pomoStats.allTimeSessions;

};

// 2. Save to Browser
const saveStats = () => {
  saveUserData('pomoStats', pomoStats)
  updateStatsUI();
};

// 3. Load from Browser (and check for a new day!)
const loadStats = () => {
  let savedData = {}; //localStorage.getItem('pomoStats');

  if (savedData) {
    pomoStats = savedData;
    // NEW: Migration safety check! Prevents 'NaN' errors.
    pomoStats.allTimeSessions = pomoStats.allTimeSessions || 0;

    const today = new Date().toDateString();
    if (pomoStats.lastDate !== today) {
      pomoStats.todayFocusMinutes = 0;
      pomoStats.todaySessions = 0;
      pomoStats.lastDate = today;
      saveStats();
    }
    updatePomoCycleUI();
    updateStatsUI();
  }
};
loadStats();

// ---------Digits Update and circle progress functionality------
const updatePomoDisplay = () => {
  const circumference = 880;
  const percentageRing = pomoTotalSec / maxSeconds;
  const offset = circumference - (percentageRing * circumference);
  pomoProgressCircle.style.strokeDashoffset = offset;

  // Dashboard Preview Progress Circle
  const dashCircumference = 337;
  const dashPercentageRing = pomoTotalSec / maxSeconds;
  const dashOffset = dashCircumference - (dashPercentageRing * dashCircumference);
  dashPomoProgressCircle.style.strokeDashoffset = dashOffset;

  let minutes = Math.floor(pomoTotalSec / 60);
  let seconds = pomoTotalSec % 60;

  let displayMin = minutes.toString().padStart(2, '0');
  let displaySec = seconds.toString().padStart(2, '0');

  let displayTime = `${displayMin}:${displaySec}`;

  pomoDigits.textContent = displayTime;
  pomoDashDigits.textContent = displayTime;

  if (currentMode === 'pomodoro') {
    document.title = `${displayTime} | Focus Timer!`;
  } else {
    document.title = `${displayTime} | Break ☕`;
  }

}
updatePomoDisplay()
// =========AdvanceSession for skip and auto switch Functionality========
const advancePomoSession = () => {
  if (currentMode === 'pomodoro') {
    updatePomoCycleUI();

    // --- Add points to the scoreboard! ---
    const minutesCompleted = Math.floor(maxSeconds / 60);

    pomoStats.todayFocusMinutes += minutesCompleted;
    pomoStats.allTimeFocusMinutes += minutesCompleted;

    pomoStats.todaySessions++;
    pomoStats.allTimeSessions++;

    saveStats();
    // ------------------------------------------

    updatePomoCycleUI();

    if (pomoStats.todaySessions % 4 === 0) {
      changePomoMode('long', 15);
    } else {
      changePomoMode('short', 5);
    }
  } else {
    changePomoMode('pomodoro', 25);
  }
}

// =========Pomodoro Toggle Play/Pause Functionality========
const iconPlay = `<path d="M8 5v14l11-7z" fill="currentColor"/>`;
const iconPause = `<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>`;


const togglePomoTimer = () => {
  if (isPlaying) {
    clearInterval(timerInterval);
    isPlaying = false;
    pomoPlayPauseText.textContent = "Start";
    pomoPlayIcon.forEach(e => e.innerHTML = iconPlay)
  } else {
    isPlaying = true;
    pomoPlayPauseText.textContent = "Pause"
    pomoPlayIcon.forEach(e => e.innerHTML = iconPause)


    if (isSoundOn) {
      
      const startSound = new Audio('assets/madara_uchiha_reality.mp3');
      startSound.play();
    }

    timerInterval = setInterval(() => {
      if (pomoTotalSec > 0) {
        pomoTotalSec--;
        updatePomoDisplay();
      } else {
        clearInterval(timerInterval);
        isPlaying = false;
        pomoPlayPauseText.textContent = "Start";
        pomoPlayIcon.forEach(e => e.innerHTML = iconPlay)

        advancePomoSession();

        // --------------------------------------------------
        // Play the Sound
        // --------------------------------------------------
        if (isSoundOn) {
          const timerAlarm = new Audio('assets/i_am_the_ghoust_of_the.mp3');
          timerAlarm.play();
        }

        // Rewind the clock and refresh the screen
        pomoTotalSec = maxSeconds;
        updatePomoDisplay();

        // --------------------------------------------------
        // Auto-Start
        // --------------------------------------------------
        if (isAutoStartOn) {
          setTimeout(() => {
            togglePomoTimer();
          }, 6000);
        }
      }
    }, 1000)
  }
}

// =======Reset Functionality=========
const resetPomoTimer = () => {
  clearInterval(timerInterval);
  isPlaying = false;
  pomoPlayPauseText.textContent = "Start";
  pomoPlayIcon.forEach(e => e.innerHTML = iconPlay)

  pomoTotalSec = maxSeconds;
  updatePomoDisplay();
}

// ---------Mode Change time functionality-----
const changePomoMode = (mode, minutes) => {
  currentMode = mode;
  maxSeconds = minutes * 60;

  if (mode === 'short') {
    pomoLabel.forEach(e => e.textContent = 'Short Break');
  } else if (mode === 'long') {
    pomoLabel.forEach(e => e.textContent = 'Long Break');
  } else {
    pomoLabel.forEach(e => e.textContent = 'Work session');
  }

  pomoTab.forEach(tab => {
    tab.classList.remove('is-active');
    if (tab.dataset.mode === mode) {
      tab.classList.add('is-active');
    }
  })

  resetPomoTimer();
  updatePomoCycleUI();
}

// ------Mode tabs Change functionality--------
pomoTabs.addEventListener('click', e => {
  let mode = e.target.dataset.mode;

  if (mode === 'short') {
    minutes = 5;
  }
  else if (mode === 'long') {
    minutes = 15;
  } else {
    minutes = 25;
  }

  pomoTab.forEach(tab => {
    tab.classList.remove('is-active');
    if (tab.dataset.mode === mode) {
      tab.classList.add('is-active');
    }
  })

  changePomoMode(mode, minutes);
})

// ========Preset Time chip functionality=========
const pomoChip = document.querySelectorAll('.pomo-chip');
const pomoPresetChips = document.querySelector('#pomoPresetChips')

pomoPresetChips.addEventListener('click', e => {


  let dataMinutes = parseInt(e.target.dataset.minutes);
  if (e.target.classList.contains('pomoCustomChip')) {
    // 1. Pop up a text box asking for a number
    const userInput = prompt("Enter custom time in minutes:");

    // 2. Convert their text into a pure number
    const customMinutes = parseInt(userInput, 10);

    // 3. Validation: Did they enter a real number greater than 0?
    if (!isNaN(customMinutes) && customMinutes > 0) {

      // Remove active class from all chips
      pomoChip.forEach(chip => {
        chip.classList.remove('is-active');
      })
      // Add active class to this Custom chip
      e.target.classList.remove('is-custom');
      e.target.classList.add('is-active');

      // Change the timer!
      changePomoMode('pomodoro', customMinutes);

    } else if (userInput !== null) {
      
      alert("Please enter a valid number greater than 0.");
    }

    // Stop the rest of the function from running so don't hit the standard chip logic!
    return;
  }

  if (dataMinutes) {
    changePomoMode('pomodoro', dataMinutes);

    pomoChip.forEach(chip => {
      chip.classList.remove('is-active');
      if (chip.classList.contains('pomoCustomChip')) {
        chip.classList.add('is-custom');
      }

      if (parseInt(chip.dataset.minutes) === dataMinutes) {
        chip.classList.add('is-active');
      }
    })
  }
})




// ======Pomo settings Sounds / next session Toggle=======
const pomoAutoStartToggle = document.querySelector('#pomoAutoStartToggle');
const pomoSoundToggle = document.querySelector('#pomoSoundToggle');

pomoAutoStartToggle.addEventListener('click', (e) => {
  const isPressed = e.currentTarget.getAttribute('aria-pressed') === 'true';
  const statePressStr = isPressed ? "false" : "true";
  e.currentTarget.setAttribute('aria-pressed', statePressStr);

  if (isPressed) {
    pomoAutoStartToggle.classList.remove('is-on');
  } else {
    pomoAutoStartToggle.classList.add('is-on');
  }

  isAutoStartOn = !isPressed;
})

pomoSoundToggle.addEventListener('click', (e) => {
  const isPressed = e.currentTarget.getAttribute('aria-pressed') === 'true';
  const statePressStr = isPressed ? "false" : "true";
  e.currentTarget.setAttribute('aria-pressed', statePressStr);

  if (isPressed) {
    pomoSoundToggle.classList.remove('is-on');
  } else {
    pomoSoundToggle.classList.add('is-on');
  }

  isSoundOn = !isPressed;
})

// ==========Skip funtionality========
const pomoSkipBtn = document.querySelector('#pomoSkipBtn');

pomoSkipBtn.addEventListener('click', () => {
  advancePomoSession();
})

