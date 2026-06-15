const currency = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
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

calculate();
