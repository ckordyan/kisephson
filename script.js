const currency = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

const bootLines = [
  "Loaded ccType..................... 21%",
  "Loaded keyboardInput.............. 38%",
  "Loaded deskTexture................ 52%",
  "Loaded monitorSmudge.............. 66%",
  "Loaded carCalculator.............. 74%",
  "Loaded recipeArchive.............. 82%",
  "Loaded garageIndex................ 91%",
  "Loaded desktopScene............... 100%",
];

const bootScreen = document.querySelector("#boot-screen");
const bootOutput = document.querySelector("#boot-lines");
const bootReady = document.querySelector(".boot-ready");
const startButton = document.querySelector("#start-button");
const room = document.querySelector("#room");
const clock = document.querySelector("#clock");
const date = document.querySelector("#date");
const menuClock = document.querySelector("#menu-clock");
const appWindow = document.querySelector("#app-window");
const closeControl = document.querySelector(".close-control");
const launchKos = document.querySelector("#launch-kos");

function runBoot() {
  bootLines.forEach((line, index) => {
    window.setTimeout(() => {
      const p = document.createElement("p");
      p.textContent = line;
      bootOutput.append(p);
    }, 260 * (index + 1));
  });

  window.setTimeout(() => {
    bootReady.classList.add("visible");
    startButton.classList.add("visible");
  }, 260 * (bootLines.length + 2));
}

function launchRoom() {
  bootScreen.classList.add("hidden");
  room.classList.add("live");
}

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  date.textContent = now
    .toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
  menuClock.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function activatePanel(panelId) {
  document.querySelectorAll(".screen-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === panelId);
  });
}

function closeApp() {
  activatePanel("home-panel");
  appWindow.classList.add("closed");
}

function openApp() {
  appWindow.classList.remove("closed");
  activatePanel("home-panel");
}

document.querySelectorAll("[data-panel]").forEach((control) => {
  control.addEventListener("click", () => activatePanel(control.dataset.panel));
});

const fields = {
  apr: document.querySelector("#apr"),
  discount: document.querySelector("#discount"),
  down: document.querySelector("#down"),
  fees: document.querySelector("#fees"),
  price: document.querySelector("#price"),
  tax: document.querySelector("#tax"),
  term: document.querySelector("#term"),
  trade: document.querySelector("#trade"),
};

const output = {
  copy: document.querySelector("#deal-copy"),
  financed: document.querySelector("#financed"),
  interest: document.querySelector("#interest"),
  meter: document.querySelector("#deal-meter-fill"),
  monthly: document.querySelector("#monthly"),
  otd: document.querySelector("#otd"),
  score: document.querySelector("#score"),
};

function value(id) {
  return Number(fields[id].value) || 0;
}

function monthlyPayment(principal, apr, months) {
  if (principal <= 0) return 0;
  const monthlyRate = apr / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

function dealMessage(discountRate, apr) {
  if (discountRate >= 0.1 && apr <= 7) return "Strong deal. Good discount and reasonable financing.";
  if (discountRate >= 0.06) return "Promising deal. Check comps, fees, and loan terms before signing.";
  if (discountRate >= 0.03) return "Average deal. There may be room to negotiate.";
  return "Weak deal. Try pushing price, fees, trade value, or financing.";
}

function calculate() {
  const price = value("price");
  const discount = Math.min(value("discount"), price);
  const taxablePrice = Math.max(price - discount - value("trade"), 0);
  const taxAmount = taxablePrice * (value("tax") / 100);
  const outTheDoor = price - discount + taxAmount + value("fees");
  const financed = Math.max(outTheDoor - value("trade") - value("down"), 0);
  const months = Math.max(value("term"), 1);
  const payment = monthlyPayment(financed, value("apr"), months);
  const totalPaid = payment * months;
  const totalInterest = Math.max(totalPaid - financed, 0);
  const discountRate = price > 0 ? discount / price : 0;
  const meterWidth = Math.min(Math.max(discountRate * 700, 4), 100);

  output.monthly.textContent = currency.format(payment);
  output.otd.textContent = currency.format(outTheDoor);
  output.financed.textContent = currency.format(financed);
  output.interest.textContent = currency.format(totalInterest);
  output.score.textContent = `${Math.round(discountRate * 100)}%`;
  output.copy.textContent = dealMessage(discountRate, value("apr"));
  output.meter.style.width = `${meterWidth}%`;
}

Object.values(fields).forEach((field) => {
  field.addEventListener("input", calculate);
});

startButton.addEventListener("click", launchRoom);
closeControl.addEventListener("click", closeApp);
launchKos.addEventListener("click", openApp);
window.setInterval(updateClock, 1000);
updateClock();
runBoot();
calculate();
