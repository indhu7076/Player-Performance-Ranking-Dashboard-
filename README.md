# Player Performance Ranking Dashboard 🏆
> **A Professional Sports Analytics Web Application & Mathematical Ranking Engine**

Built with **Python (Flask), HTML5, CSS3, JavaScript, Chart.js, Three.js (WebGL), and CSV/JSON Data Engines**.

---

## 1. Project Overview
Evaluating sports players across multiple distinct statistical attributes (e.g. goals/runs scored, playmaking assists, execution accuracy percentages, defensive contributions, and recent form) manually is complex and often subject to bias.

The **Player Performance Ranking Dashboard** converts multi-variable raw player performance data into normalized scores and dynamic leaderboards. It provides real-time ranking adjustments based on configurable algorithm weights, interactive multi-chart visual analytics, side-by-side player comparison, CSV dataset management with schema validation, and presentation modes.

---

## 2. Key Problem & Solution
* **Problem**: Raw metrics operate on completely different numerical scales (e.g. Goals range 0-30 while Accuracy ranges 70-98%). Comparing raw totals leads to metric imbalance and inaccurate ranking.
* **Solution**: The platform applies **Min-Max Normalization** to map all attributes into a standard $[0, 100]$ scale. Weighted sub-scores are aggregated to form a unified composite **Performance Score (0-100)**.

---

## 3. Core Objectives & Features
1. **Dynamic Ranking Engine**: Dynamic recalculation of player positions when algorithm weights are modified.
2. **Min-Max Data Normalization**: Prevents division-by-zero errors and scales metrics cleanly.
3. **8 Live Dashboard KPIs**: Dynamic computation of total players, matches, average scores, leaderboards, highest scorer, assister, accuracy, and rank movers.
4. **6 Interactive Visual Analytics**: Chart.js horizontal bar charts, score distribution doughnut charts, performance curves, team comparisons, radar sub-scores, and recent match rating line charts.
5. **Side-by-Side Player Comparison**: Attribute radar comparison, grouped bar chart, and automated factual non-biased takeaways.
6. **Data Management & CSV Validation**: Player CRUD operations, CSV dataset upload with schema validation, error detection, preview, and CSV rankings exporter.
7. **Subtle 3D WebGL Background**: Three.js ambient rotating sports data geometry with accessibility reduced motion controls.
8. **Bottom "Technologies Used" Footer Bar**: Expandable footer on **every single page** explaining each technology's role in one line.
9. **Presentation Mode**: Fullscreen projector presentation mode hiding unnecessary administrative controls.
10. **Demo Mode**: One-click quick reset to preset sample data for live college reviews.

---

## 4. System Architecture & Workflow

```
[ RAW CSV DATA ]
       ↓
[ DATA VALIDATION & ERROR REPORT ]
       ↓
[ MIN-MAX NORMALIZATION (0-100 Scale) ]
       ↓
[ WEIGHTED COMPOSITE SCORING ]
       ↓
[ DYNAMIC PLAYER RANKING ]
       ↓
[ CHART.JS VISUAL ANALYTICS & INSIGHTS ]
       ↓
[ CSV REPORT EXPORT ]
```

---

## 5. Mathematical Methodology & Formulas

### A. Min-Max Normalization Formula
$$\text{Normalized Value} = \left( \frac{\text{Value} - \text{Minimum}}{\text{Maximum} - \text{Minimum}} \right) \times 100$$
*(If Maximum == Minimum, normalized value defaults safely to 50.0 to prevent division by zero).*

### B. Weighted Performance Score Formula
$$\text{Performance Score} = (w_1 \times \text{Scoring}) + (w_2 \times \text{Assists}) + (w_3 \times \text{Accuracy}) + (w_4 \times \text{Consistency}) + (w_5 \times \text{Defensive}) + (w_6 \times \text{Form})$$

**Default Weights**:
* $w_1$ Scoring Contribution: **30%** (0.30)
* $w_2$ Assists / Playmaking: **20%** (0.20)
* $w_3$ Accuracy Percentage: **15%** (0.15)
* $w_4$ Match Consistency: **15%** (0.15)
* $w_5$ Defensive / Supporting: **10%** (0.10)
* $w_6$ Recent Form Score: **10%** (0.10)

---

## 6. Project Directory Structure
```
player-performance-dashboard/
│
├── app.py                     # Flask web server & REST API endpoints
├── requirements.txt           # Python dependency requirements
├── README.md                  # Team project manual & Viva guide
│
├── data/
│   ├── players.csv            # Detailed player statistics dataset
│   └── matches.csv            # Historical match-by-match log records
│
├── utils/
│   ├── __init__.py
│   ├── ranking.py             # Ranking engine & dynamic score aggregator
│   ├── normalization.py       # Min-Max statistical normalization engine
│   └── validation.py          # CSV schema & form validation logic
│
├── static/
│   ├── css/
│   │   └── style.css          # Dark Navy Sports Analytics UI Design System
│   └── js/
│       ├── background3d.js    # Three.js 3D WebGL ambient background
│       ├── main.js            # Navbar, theme, presentation mode & toasts
│       ├── dashboard.js       # Chart.js analytics & KPI cards
│       ├── rankings.js        # Podium, dynamic table, search & sorting
│       ├── comparison.js      # Player comparison & radar charts
│       └── algorithm.js       # Interactive weight sliders & recalculation
│
└── templates/
    ├── base.html              # Master layout with global nav & Tech Footer
    ├── home.html              # Hero section & workflow diagram
    ├── dashboard.html         # 8 KPI cards & 6 Chart.js charts
    ├── rankings.html          # Podium & dynamic rankings table
    ├── player_profile.html    # Detailed player stats & trend charts
    ├── comparison.html        # Side-by-side comparative analytics
    ├── analytics.html         # Dynamic dataset insight cards
    ├── data_management.html   # Player CRUD & CSV import/export
    ├── algorithm.html         # Weight configuration & math breakdown
    ├── about.html             # Project specifications & future scope
    └── settings.html          # Theme, 3D controls & dataset resets
```

---

## 7. Technologies Used & Purpose

* **HTML5**: Used to structure the web application and page content.
* **CSS3**: Used to create the visual design, layout, responsiveness, and animations.
* **JavaScript (ES6+)**: Used to provide interactivity, filtering, calculations, and dynamic UI updates.
* **Python**: Used for backend processing and ranking calculations.
* **Flask**: Used to connect the frontend with the Python backend and handle application routes.
* **CSV / JSON**: Used for storing and managing player and match data.
* **Chart.js**: Used to create interactive performance charts and visual analytics.
* **Lucide Icons**: Used to provide clean and consistent interface icons.
* **Three.js / WebGL**: Used to create the subtle animated 3D sports-data background.

---

## 8. Quick Start / Installation & Execution

### Prerequisites
* Python 3.8+ installed on system

### Installation Steps
1. Navigate to the project root directory:
   ```bash
   cd C:\Users\JYOSHAVI\.gemini\antigravity\scratch\player-performance-dashboard
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Flask application server:
   ```bash
   python app.py
   ```
4. Open your web browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

---

## 9. Recommended Demo Presentation Flow
1. **Home (`/`)**: Show hero section, problem statement, and workflow flowchart.
2. **Dashboard (`/dashboard`)**: Highlight 8 dynamic KPIs and 6 interactive Chart.js visualizations. Filter by team/position.
3. **Player Rankings (`/rankings`)**: Show podium #1, #2, #3, search filtering, and rank movement indicators.
4. **Player Profile (`/player/PL001`)**: Inspect player stats, strengths, and historical match logs.
5. **Player Comparison (`/comparison`)**: Select two players, view comparative radar chart, bar chart, and factual takeaways.
6. **Ranking Algorithm (`/algorithm`)**: Adjust sliders (e.g. increase Defensive weight to 40%), click "Recalculate Rankings", and observe immediate score updates.
7. **Data Management (`/data_management`)**: Demonstrate adding a new player record or uploading a custom CSV file with live validation.
8. **Presentation Mode**: Click the **Presentation Mode** button in the top navbar to demonstrate projector mode.

---

## 10. Future Scope & Roadmap
* **Machine Learning Predictive Analytics**: Integrating Regression models to predict future player ratings.
* **Live API Integration**: Streaming real-time sports telemetry data from external APIs.
* **AI-Assisted Scouting**: Automated natural language scouting reports based on anomaly detection.
* **Mobile App**: Porting frontend to React Native / Flutter for mobile devices.
* **Cloud Deployment**: Containerizing with Docker and deploying to AWS / GCP.

---

## 11. Viva Voice Questions & Answers 🎓

### Q1: What is the main objective of this project?
**Answer**: To eliminate manual bias in evaluating sports players by converting multi-dimensional raw statistics into normalized performance scores (0-100) and dynamic leaderboards.

### Q2: Why is Min-Max Normalization necessary in sports analytics?
**Answer**: Raw sports statistics have vastly different units and scales (e.g., goals range 0-30 while accuracy percentage ranges 70-99%). Min-Max normalization maps all metrics onto a uniform scale $[0, 100]$, ensuring no single large-magnitude metric skews the calculation.

### Q3: How do you handle division-by-zero during normalization?
**Answer**: If a metric has zero variance across the dataset ($\text{Maximum} = \text{Minimum}$), the code detects this boundary condition and safely returns a baseline constant value ($50.0$), preventing runtime errors.

### Q4: How does dynamic weight recalculation work?
**Answer**: The frontend sends updated weight parameters via a POST request to `/api/algorithm/recalculate`. The Python backend normalizes the weight ratios, re-runs Min-Max scaling on all players, recalculates the composite performance score, sorts players descending, updates rank movements, and returns the new dataset to update the UI dynamically.

### Q5: What backend framework is used and why?
**Answer**: Python Flask. It is lightweight, fast to set up, provides clean RESTful API routing, and seamlessly integrates with Python data processing modules.

### Q6: How is data persisted?
**Answer**: Data is loaded into memory from `data/players.csv` and `data/matches.csv` on server startup. Any CRUD operation or valid CSV import updates memory state and writes back to `data/players.csv`.

### Q7: What libraries are used for charts and 3D effects?
**Answer**: **Chart.js** for rendering interactive 2D charts (radar, bar, line, doughnut) and **Three.js (WebGL)** for rendering the subtle rotating particle canvas background.

### Q8: How does CSV validation protect system stability?
**Answer**: Before importing CSV files, `utils/validation.py` inspects required column headers, validates numeric types and boundary ranges (e.g. Accuracy 0-100%), and checks for duplicate Player IDs. Corrupted files trigger detailed user error reports instead of crashing the server.

### Q9: How are player rank movements calculated?
**Answer**: Each player tracks `Previous Rank` alongside `Current Rank`. If `Previous Rank > Current Rank`, the player has improved ($\uparrow$). If `Previous Rank < Current Rank`, the player has declined ($\downarrow$).

### Q10: How does Presentation Mode work?
**Answer**: Clicking "Presentation Mode" toggles a CSS class `.presentation-mode` on the `<body>` element, which hides sidebars and extra controls while scaling up KPI typography for projector screens.

### Q11: What design principles were prioritized?
**Answer**: A modern Sports Analytics UI using a dark navy base (`#0b0f19`), sleek slate cards (`#1e293b`), cyan primary accents (`#06b6d4`), gold rank badges (`#f59e0b`), positive green indicators (`#10b981`), high typography contrast, and smooth micro-interactions.

### Q12: How are strengths and areas for improvement generated on the Player Profile page?
**Answer**: They are computed dynamically by evaluating the normalized sub-scores for each metric (e.g. if scoring sub-score $\ge 70$, a positive scoring insight is added; if accuracy sub-score $< 75$, an improvement tip is generated).

### Q13: How does the Technologies Used footer work?
**Answer**: It is built into the master `base.html` template so it renders on every single page. It is expandable/collapsible when clicked and features 9 cards detailing each tech tool and its exact one-line purpose.

### Q14: Is the web application responsive?
**Answer**: Yes, CSS flexbox, CSS grid, and media queries transform the multi-column sidebar into a mobile hamburger menu and stack table rows/podium cards cleanly on smaller screens.

### Q15: How can this project be scaled in the future?
**Answer**: By implementing SQL database storage (PostgreSQL), adding Machine Learning models (Scikit-Learn) for predictive performance analytics, and ingesting live sports telemetry APIs.
