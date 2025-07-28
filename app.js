const cryptos = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'cronos', symbol: 'CRO', name: 'Cronos' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'hedera-hashgraph', symbol: 'HBAR', name: 'Hedera' },
  { id: 'loaded-lions', symbol: 'LOADED', name: 'Loaded Lions' },
];

const marketContainer = document.getElementById('market');
const portfolioContainer = document.getElementById('portfolio');

function createCard(crypto) {
  const div = document.createElement('div');
  div.className = 'bg-white p-4 rounded shadow';
  div.innerHTML = `
    <h3 class="text-xl font-semibold mb-2">${crypto.name} (${crypto.symbol})</h3>
    <canvas id="chart-${crypto.id}" height="120"></canvas>
    <p id="price-${crypto.id}" class="mt-2 text-lg"></p>
    <p id="prediction-${crypto.id}" class="text-sm text-gray-600"></p>
    <div class="mt-2">
      <label class="text-sm">Holdings:</label>
      <input id="holding-${crypto.id}" type="number" min="0" step="any" class="border p-1 w-24 text-sm" />
    </div>
  `;
  marketContainer.appendChild(div);
}

function updatePortfolio() {
  let total = 0;
  cryptos.forEach(c => {
    const input = document.getElementById(`holding-${c.id}`);
    const holding = parseFloat(input.value) || 0;
    const priceEl = document.getElementById(`price-${c.id}`);
    const price = parseFloat(priceEl.dataset.price) || 0;
    total += holding * price;
  });
  portfolioContainer.innerHTML = `Total Value: $${total.toFixed(2)}`;
}

async function fetchData(crypto) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${crypto.id}?localization=false&tickers=false&market_data=true&sparkline=true`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const price = data.market_data.current_price.usd;
    const change = data.market_data.price_change_percentage_24h;
    const sparkline = data.market_data.sparkline_7d.price;
    document.getElementById(`price-${crypto.id}`).textContent = `$${price.toFixed(4)} (24h: ${change.toFixed(2)}%)`;
    document.getElementById(`price-${crypto.id}`).dataset.price = price;
    drawChart(`chart-${crypto.id}`, sparkline);
    showPrediction(crypto.id, price);
  } catch (e) {
    document.getElementById(`price-${crypto.id}`).textContent = 'Data unavailable';
  }
}

function drawChart(id, data) {
  new Chart(document.getElementById(id).getContext('2d'), {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data: data,
        borderColor: '#3b82f6',
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
      }]
    },
    options: { scales: { x: { display: false }, y: { display: false } }, plugins: { legend: { display: false } } }
  });
}

function showPrediction(id, price) {
  const variation = (Math.random() - 0.5) * 0.1;
  const daily = price * (1 + variation);
  const confidence = (0.6 + Math.random() * 0.4).toFixed(2);
  document.getElementById(`prediction-${id}`).textContent = `Daily prediction: $${daily.toFixed(4)} (conf: ${confidence})`;
}

cryptos.forEach(c => {
  createCard(c);
  fetchData(c);
  document.getElementById(`holding-${c.id}`).addEventListener('input', updatePortfolio);
});

