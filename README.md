# TerraLoop - Carbon Footprint Awareness Platform

> **TerraLoop** is a premium, high-fidelity gamified carbon footprint tracker and "What-If" lifestyle simulator designed to help individuals understand, track, and reduce their personal carbon emissions.

---

## 🚀 Key Features

*   **Obsidian Glassmorphism Dashboard:** A modern, premium dark-mode interface featuring dynamic environmental metrics (Monthly Footprint, Carbon Saved, Streaks, Eco Score) and responsive graphs.
*   **Dynamic Calculator & Tracker:** Log daily activities across four core categories (Travel, Home Energy, Food Consumption, Shopping & Waste) with instant carbon scoring.
*   **"What-If" Lifestyle Simulator:** Interactive sliders allowing users to model future habit adjustments (EV transition, solar panels, plant-based diet, recycling) and view projected annual CO2 savings in real-time.
*   **Gamified Quests & Achievements:** Earn XP, level up your Eco Badge, maintain logging streaks, and unlock achievements for sustainable habits.
*   **HTML-Escaped Data Sanitization:** Strict input sanitization to ensure complete protection against XSS vulnerabilities.
*   **Chart.js Canvas Management:** Smart chart lifetime management that safely destroys old contexts to avoid memory leaks and overlapping glitches.

---

## 🛠️ Technology Stack

*   **Frontend Structure:** Vanilla HTML5 (semantic layout)
*   **Styling & Aesthetics:** Vanilla CSS3 (Custom properties, HSL color tokens, glassmorphism filters, responsive grids)
*   **Logic & State:** Vanilla ES6 Javascript (LocalStorage persistence, modular structure)
*   **Data Visualization:** Chart.js CDN

---

## 📁 File Structure

```text
hack2skill/
├── index.html     # Application UI containers and SVG indicators
├── styles.css     # CSS custom variables, theme properties, range sliders
├── database.js    # Emission factors, baselines, and initial quest definitions
├── app.js         # Core application logic, chart initializers, and simulator mathematical models
└── README.md      # Project documentation (this file)
```

---

## 💻 Installation & Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/terraloop.git
    cd terraloop
    ```

2.  **Run locally:**
    You can serve the directory using any static web server. For example, using Python:
    ```bash
    python3 -m http.server 8000
    ```
    Or Node.js `http-server`:
    ```bash
    npx http-server
    ```

3.  **Open in browser:**
    Navigate to `http://localhost:8000` to start tracking your footprint.

---

## 📊 Emissions Calculations Matrix

TerraLoop uses standard coefficients to calculate personal CO2e impact:

*   **Travel (per km):** Petrol Car (0.18 kg), EV (0.05 kg), Bus (0.04 kg), Train (0.015 kg), Flights (0.18–0.25 kg).
*   **Energy:** Grid Electricity (0.85 kg per kWh), Natural Gas (2.0 kg per unit).
*   **Food (per meal):** High Red Meat Diet (3.3 kg), Vegetarian (1.1 kg), Vegan (0.4 kg).
*   **Shopping & Waste:** Electronics (80 kg per item), Clothing (10 kg), General Waste (1.5 kg per kg).
