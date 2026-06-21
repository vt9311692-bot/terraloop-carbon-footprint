/**
 * TerraLoop - Carbon Footprint Awareness Platform Logic
 * Handles calculations, state management, gamification metrics,
 * Chart.js bindings, and the "What-If" simulator.
 */

let appState = null;
let chartInstance = null;

// Initial loading
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initCharts();
  updateDashboard();
  renderQuests();
  renderBadges();
  runSimulation();
});

// Load state from localStorage or initialize defaults
function loadState() {
  const saved = localStorage.getItem('terraloop_state');
  if (saved) {
    try {
      appState = JSON.parse(saved);
      // Backfill missing fields in case of migrations
      if (!appState.quests) appState.quests = DEFAULT_STATE.quests;
      if (!appState.badges) appState.badges = DEFAULT_STATE.badges;
    } catch (e) {
      console.error("Failed to load local state", e);
      appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  } else {
    appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem('terraloop_state', JSON.stringify(appState));
}

// Clear all logs
function clearAllHistory() {
  if (confirm("Are you sure you want to delete your logged activities? This will reset your stats.")) {
    appState.activities = [];
    appState.totalSaved = 0;
    appState.xp = 0;
    appState.level = 1;
    appState.streak = 0;
    appState.lastLoggedDate = null;
    
    // Reset quests & badges
    appState.quests = JSON.parse(JSON.stringify(DEFAULT_STATE.quests));
    appState.badges = JSON.parse(JSON.stringify(DEFAULT_STATE.badges));
    
    saveState();
    updateDashboard();
    renderQuests();
    renderBadges();
    runSimulation();
    initCharts();
  }
}

// Switch navigation view
function switchView(viewId) {
  // Toggle views
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`view-${viewId}`).classList.add('active');
  
  // Toggle nav buttons active state
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelector(`.nav-item[data-view="${viewId}"]`).classList.add('active');
}

// Update primary dashboard KPIs and charts
function updateDashboard() {
  // Update totals
  let totalEmissions = 0;
  let categoryTotals = { travel: 0, energy: 0, food: 0, shopping: 0 };
  
  appState.activities.forEach(act => {
    totalEmissions += act.co2Val;
    categoryTotals[act.category] += act.co2Val;
  });

  // Calculate score based on comparison to general benchmarks
  let ecoScore = 95;
  if (totalEmissions > 100) ecoScore = Math.max(30, 95 - Math.floor((totalEmissions - 100) / 10));

  // Render values
  document.getElementById('kpi-footprint').innerText = `${totalEmissions.toFixed(1)} kg`;
  document.getElementById('kpi-saved').innerText = `${appState.totalSaved.toFixed(1)} kg`;
  document.getElementById('kpi-streak').innerText = `${appState.streak} ${appState.streak === 1 ? 'day' : 'days'}`;
  document.getElementById('kpi-score').innerText = ecoScore;
  
  // User Profile XP badge update
  document.getElementById('user-level-badge').innerText = `LVL ${appState.level} (${appState.xp} XP)`;

  // History list
  const historyList = document.getElementById('history-feed-list');
  historyList.innerHTML = '';
  
  if (appState.activities.length === 0) {
    historyList.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--text-muted); font-size: 0.85rem;"><i class="fa-solid fa-leaf"></i> No logged events yet. Start by logging travel, food, or energy!</div>`;
  } else {
    // Show newest first
    const reversed = [...appState.activities].reverse();
    reversed.forEach(act => {
      const item = document.createElement('div');
      item.className = 'history-item';
      
      let icon = 'fa-leaf';
      if (act.category === 'travel') icon = 'fa-car';
      if (act.category === 'energy') icon = 'fa-house-fire';
      if (act.category === 'food') icon = 'fa-utensils';
      if (act.category === 'shopping') icon = 'fa-bag-shopping';

      item.innerHTML = `
        <div class="history-left">
          <div class="history-icon"><i class="fa-solid ${icon}"></i></div>
          <div class="history-text">
            <span class="history-title">${escapeHTML(act.typeLabel)}</span>
            <span class="history-date">${new Date(act.date).toLocaleDateString()} &bull; ${escapeHTML(act.inputVal)}</span>
          </div>
        </div>
        <div class="history-right">
          <span class="history-value">${act.co2Val.toFixed(1)} kg CO₂e</span>
          <button class="history-delete" onclick="deleteActivity('${act.id}')" title="Delete log"><i class="fa-solid fa-xmark"></i></button>
        </div>
      `;
      historyList.appendChild(item);
    });
  }

  // Generate Insights
  generateInsights(categoryTotals, totalEmissions);
  
  // Update Chart
  if (chartInstance) {
    chartInstance.data.datasets[0].data = [
      categoryTotals.travel,
      categoryTotals.energy,
      categoryTotals.food,
      categoryTotals.shopping
    ];
    chartInstance.update();
  }
}

// Generate context-rich AI Recommendations & Insights
function generateInsights(categoryTotals, totalEmissions) {
  const container = document.getElementById('ai-insights-box');
  container.innerHTML = '';

  let insights = [];

  if (totalEmissions === 0) {
    insights.push({
      class: 'emerald',
      icon: 'fa-heart',
      text: "Log your daily actions to trigger dynamic AI analysis and get green energy saving suggestions!"
    });
  } else {
    // Compare category distribution
    let maxCat = 'travel';
    let maxVal = categoryTotals.travel;
    
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxCat = cat;
      }
    });

    if (maxCat === 'travel' && maxVal > 0) {
      insights.push({
        class: 'rose',
        icon: 'fa-car-burst',
        text: `Travel represents your largest emissions sector (${Math.round((maxVal/totalEmissions)*100)}%). Try swapping one car trip for public transit to unlock the **Eco Commuter** quest.`
      });
    } else if (maxCat === 'energy' && maxVal > 0) {
      insights.push({
        class: 'amber',
        icon: 'fa-plug-circle-bolt',
        text: `Electricity and home heating are contributing heavily to your carbon load. Check the **Simulator** tab to model solar installations.`
      });
    } else if (maxCat === 'food' && maxVal > 0) {
      insights.push({
        class: 'purple',
        icon: 'fa-bowl-food',
        text: `Your dietary intake footprint is significant. Transitioning a few high-meat meals to vegetarian or vegan dishes cuts CO2 dramatically.`
      });
    }

    // Default general advice
    if (appState.activities.length > 2) {
      insights.push({
        class: 'sky',
        icon: 'fa-chart-line',
        text: `Your streak is currently active! Maintaining daily tracking helps keep you accountable and build sustainable habits.`
      });
    }
  }

  // Inject insight elements
  insights.forEach(ins => {
    const card = document.createElement('div');
    card.className = `insight-card ${ins.class}`;
    card.innerHTML = `
      <div class="insight-icon"><i class="fa-solid ${ins.icon}"></i></div>
      <div class="insight-text">${ins.text}</div>
    `;
    container.appendChild(card);
  });
}

// Log new activity
function logActivity(category) {
  let co2 = 0;
  let typeLabel = '';
  let inputVal = '';
  
  if (category === 'travel') {
    const type = document.getElementById('travel-type').value;
    const distance = parseFloat(document.getElementById('travel-distance').value);
    if (isNaN(distance) || distance <= 0) return;
    
    const factor = EMISSION_FACTORS.travel[type] || 0.1;
    co2 = distance * factor;
    
    // Save savings calculation vs baseline average petrol car
    const baselineFactor = EMISSION_FACTORS.travel["petrol-car"];
    const potentialSavings = (distance * baselineFactor) - co2;
    if (potentialSavings > 0) {
      appState.totalSaved += potentialSavings;
    }

    typeLabel = `Travel via ${type.replace('-', ' ')}`;
    inputVal = `${distance.toFixed(1)} km`;
    
    // Reset form
    document.getElementById('travel-distance').value = '';
    
    // Quest progress: eco-commuter
    if (type === 'bus' || type === 'metro') {
      incrementQuestProgress('eco-commuter');
    }
  } 
  else if (category === 'energy') {
    const type = document.getElementById('energy-type').value;
    const amount = parseFloat(document.getElementById('energy-amount').value);
    if (isNaN(amount) || amount <= 0) return;
    
    const factor = EMISSION_FACTORS.energy[type] || 0.5;
    co2 = amount * factor;
    
    typeLabel = `Energy consumption: ${type.replace('-', ' ')}`;
    inputVal = `${amount.toFixed(1)} units`;
    
    document.getElementById('energy-amount').value = '';
    
    // Quest progress: power-saver
    incrementQuestProgress('power-saver');
  } 
  else if (category === 'food') {
    const type = document.getElementById('food-type').value;
    const quantity = parseInt(document.getElementById('food-quantity').value);
    if (isNaN(quantity) || quantity <= 0) return;
    
    const factor = EMISSION_FACTORS.food[type] || 1.0;
    co2 = quantity * factor;
    
    // Save savings vs standard high-meat diet
    const baselineFactor = EMISSION_FACTORS.food["high-meat"];
    const potentialSavings = (quantity * baselineFactor) - co2;
    if (potentialSavings > 0) {
      appState.totalSaved += potentialSavings;
    }

    typeLabel = `${type.charAt(0).toUpperCase() + type.slice(1)} meal intake`;
    inputVal = `${quantity} meals`;
    
    document.getElementById('food-quantity').value = '1';
    
    // Quest progress: green-chef
    if (type === 'vegan') {
      incrementQuestProgress('green-chef', quantity);
    }
  } 
  else if (category === 'shopping') {
    const type = document.getElementById('shopping-type').value;
    const count = parseInt(document.getElementById('shopping-count').value);
    if (isNaN(count) || count <= 0) return;
    
    const factor = EMISSION_FACTORS.shopping[type] || 1.0;
    co2 = count * factor;
    
    typeLabel = `Logged shopping: ${type.replace('-', ' ')}`;
    inputVal = `${count} units`;
    
    document.getElementById('shopping-count').value = '1';
    
    // Quest progress: waste-reducer
    if (type === 'general-waste') {
      incrementQuestProgress('waste-reducer');
    }
  }

  // Create log entry
  const entry = {
    id: 'act-' + Date.now(),
    category,
    typeLabel,
    inputVal,
    co2Val: co2,
    date: new Date().toISOString()
  };

  appState.activities.push(entry);
  
  // Award initial XP for logging activity
  addXP(20);
  
  // Update streak logic
  checkStreak();

  // Badges update
  unlockBadge('first-step');
  
  if (appState.totalSaved > 15) {
    unlockBadge('solar-knight');
  }

  saveState();
  updateDashboard();
  renderQuests();
  renderBadges();
  
  // Switch back to dashboard
  switchView('dashboard');
}

// Remove log entry
function deleteActivity(actId) {
  appState.activities = appState.activities.filter(a => a.id !== actId);
  saveState();
  updateDashboard();
}

// Calculate streak based on continuous usage dates
function checkStreak() {
  const today = new Date().toDateString();
  if (appState.lastLoggedDate === today) return; // already logged today

  if (appState.lastLoggedDate) {
    const last = new Date(appState.lastLoggedDate);
    const diffTime = Math.abs(new Date(today) - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      appState.streak += 1;
    } else if (diffDays > 1) {
      appState.streak = 1; // broken streak
    }
  } else {
    appState.streak = 1;
  }
  
  appState.lastLoggedDate = today;
}

// Select active calculator view chip
function selectCalculatorCategory(cat) {
  // Toggle active card styling
  document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`.category-card[data-cat="${cat}"]`).classList.add('active');
  
  // Toggle form layout display
  document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));
  document.getElementById(`form-${cat}`).classList.add('active');
}

// Reward XP and level up if needed
function addXP(amount) {
  appState.xp += amount;
  
  // Levels requirement: level = Math.floor(xp / 300) + 1
  const newLevel = Math.floor(appState.xp / 300) + 1;
  if (newLevel > appState.level) {
    appState.level = newLevel;
    // Highlight popup
    alert(`🎉 Level Up! You are now Level ${newLevel}!`);
    
    if (newLevel >= 3) {
      unlockBadge('eco-master');
    }
  }
}

// Quest logic: increment completion target count
function incrementQuestProgress(questId, amount = 1) {
  const quest = appState.quests.find(q => q.id === questId);
  if (!quest || quest.completed) return;
  
  quest.current = Math.min(quest.target, quest.current + amount);
  if (quest.current >= quest.target) {
    quest.completed = true;
    
    // Unlock related badges
    if (questId === 'eco-commuter') unlockBadge('transit-pro');
    if (questId === 'green-chef') unlockBadge('plant-power');
  }
}

// Claim reward of completed quests
function claimQuestReward(questId) {
  const quest = appState.quests.find(q => q.id === questId);
  if (quest && quest.completed && !quest.claimed) {
    quest.claimed = true;
    addXP(quest.xp);
    saveState();
    updateDashboard();
    renderQuests();
  }
}

// Badge unlock routine
function unlockBadge(badgeId) {
  const badge = appState.badges.find(b => b.id === badgeId);
  if (badge && !badge.unlocked) {
    badge.unlocked = true;
    // Show quick alert
    setTimeout(() => {
      alert(`🏆 Badge Unlocked: ${badge.title} (${badge.desc})`);
    }, 100);
  }
}

// Render gamified Quests UI
function renderQuests() {
  const box = document.getElementById('quests-container-box');
  box.innerHTML = '';

  appState.quests.forEach(q => {
    const card = document.createElement('div');
    card.className = `quest-card ${q.claimed ? 'completed' : ''}`;
    
    const pct = Math.min(100, Math.round((q.current / q.target) * 100));
    
    let btnHtml = '';
    if (q.completed && !q.claimed) {
      btnHtml = `<button class="btn-quest-claim" onclick="claimQuestReward('${q.id}')">Claim XP</button>`;
    } else if (q.claimed) {
      btnHtml = `<span style="font-size:0.75rem; color:var(--primary); font-weight:700;"><i class="fa-solid fa-circle-check"></i> Claimed</span>`;
    } else {
      btnHtml = `<span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${q.current}/${q.target}</span>`;
    }

    card.innerHTML = `
      <div class="quest-icon"><i class="fa-solid fa-leaf"></i></div>
      <div class="quest-details">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h3>${escapeHTML(q.title)}</h3>
          ${btnHtml}
        </div>
        <p>${escapeHTML(q.desc)}</p>
        <div class="quest-progress-bar">
          <div class="quest-progress-fill" style="width: ${pct}%"></div>
        </div>
        <div class="quest-xp">+${q.xp} XP reward</div>
      </div>
    `;
    box.appendChild(card);
  });
}

// Render dynamic Badges layout
function renderBadges() {
  const box = document.getElementById('badges-container-box');
  box.innerHTML = '';

  appState.badges.forEach(b => {
    const item = document.createElement('div');
    item.className = `badge-item ${b.unlocked ? 'unlocked' : ''}`;
    
    item.innerHTML = `
      <div class="badge-icon" title="${escapeHTML(b.desc)}">${b.icon}</div>
      <span>${escapeHTML(b.title)}</span>
    `;
    box.appendChild(item);
  });
}

// Run What-If reduction simulation computations
function runSimulation() {
  const valEv = parseInt(document.getElementById('sim-ev').value);
  const valSolar = parseInt(document.getElementById('sim-solar').value);
  const valDiet = parseInt(document.getElementById('sim-diet').value);
  const valRecycle = parseInt(document.getElementById('sim-recycle').value);

  // Update slider label fields
  document.getElementById('val-sim-ev').innerText = `${valEv}%`;
  document.getElementById('val-sim-solar').innerText = `${valSolar}%`;
  document.getElementById('val-sim-diet').innerText = `${valDiet}%`;
  document.getElementById('val-sim-recycle').innerText = `${valRecycle}%`;

  // Compute simulated yearly prevented emissions (average annual values baselines)
  // EV transition saves up to 1800 kg CO2 / year vs standard fuel car
  // Solar panels save up to 2200 kg CO2 / year vs standard grid energy mix
  // Plant-based diet saves up to 1200 kg CO2 / year vs heavy meat intake
  // High recycling saves up to 500 kg CO2 / year vs waste landfills
  const maxSavings = {
    ev: 1800,
    solar: 2200,
    diet: 1200,
    recycle: 500
  };

  const savedEv = (valEv / 100) * maxSavings.ev;
  const savedSolar = (valSolar / 100) * maxSavings.solar;
  const savedDiet = (valDiet / 100) * maxSavings.diet;
  const savedRecycle = (valRecycle / 100) * maxSavings.recycle;

  const totalSaved = savedEv + savedSolar + savedDiet + savedRecycle;
  
  // Total baseline emissions (average household total: ~11,000 kg / year)
  const yearlyBaseline = 11000;
  const savingsPct = Math.min(100, Math.round((totalSaved / yearlyBaseline) * 100));

  // Render values
  document.getElementById('sim-kg-saved').innerText = `${Math.round(totalSaved).toLocaleString()} kg`;
  document.getElementById('sim-pct-label').innerText = `${savingsPct}%`;

  // Badge trigger: sim-pioneer
  if (savingsPct >= 30) {
    unlockBadge('sim-pioneer');
    renderBadges();
  }

  // Update circular dash offset (Circumference: 2 * PI * r = 2 * 3.14159 * 75 = 471.2)
  const stroke = document.getElementById('circular-progress-stroke');
  if (stroke) {
    const circumference = 471.2;
    const offset = circumference - (savingsPct / 100) * circumference;
    stroke.style.strokeDashoffset = offset;
  }
}

// Chart.js Configuration
function initCharts() {
  const ctx = document.getElementById('emissionsChart').getContext('2d');
  
  // Compute initial metrics
  let categoryTotals = { travel: 0, energy: 0, food: 0, shopping: 0 };
  appState.activities.forEach(act => {
    categoryTotals[act.category] += act.co2Val;
  });

  // Clear previous instance to prevent overlapping glitches
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Travel & Commute', 'Home Energy', 'Food Consumption', 'Shopping & Waste'],
      datasets: [{
        data: [
          categoryTotals.travel,
          categoryTotals.energy,
          categoryTotals.food,
          categoryTotals.shopping
        ],
        backgroundColor: [
          '#0ea5e9', // Sky blue
          '#f59e0b', // Amber
          '#10b981', // Emerald green
          '#8b5cf6'  // Purple
        ],
        borderColor: '#0b111e',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#f8fafc',
            font: {
              family: 'Plus Jakarta Sans',
              size: 11
            },
            boxWidth: 10
          }
        }
      },
      cutout: '65%'
    }
  });
}

// Escape HTML utility for input sanitization
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
