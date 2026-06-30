# LEGENDEX — Football G.O.A.T. Analytics Engine

LEGENDEX is an interactive, premium football analytics dashboard built to compare, weigh, and rank the greatest football legends of all time. It features a customizable mathematical scoring algorithm, an interactive matchup simulator, tournament bracket generator, Dream XI field builder, and real-time "What-If" statistics modeling.

## 🚀 Key Features

1. **G.O.A.T. Algorithm Slider Panel**: Dynamically adjust parameters (Goals, Playmaking, Longevity, Trophies, Peak, Era, etc.) with real-time recalculations and smooth GSAP leaderboard sorting animations.
2. **Interactive "What-If" Stats Editor**: Modify a player's raw metrics on-the-fly inside the details modal to instantly calculate active rank-gain/rank-loss deltas (e.g., `+2 ↑`).
3. **Attribute Spectrum (Radar Charts)**: Fully responsive SVG-based Radar Charts that overlay stats for up to three legends simultaneously.
4. **Win Probability Matchup Arena**: Runs a head-to-head tactical comparison with a progressive win-probability percentage visualizer.
5. **Dream XI Pitch Selector**: Arrange legends in formations (4-3-3, 4-4-2, 3-5-2) on a tactical football field grid to calculate a dynamic Team OVR score.
6. **Commentary Bracket Simulator**: Play out simulated knockout tournament brackets featuring real-time commentary logs and custom Web Audio synthesizer sounds (crowd roars, referees whistles, game chimes).
7. **Interactive Data Center Grid**: Full spreadsheet data-editor allowing you to insert new players or edit stats in tabular form.
8. **Gamified Achievements**: Progression system saving unlocked badges to `localStorage` complete with slide-in toast notifications and sound cues.

## 📦 How to Run Locally

Since LEGENDEX is a static web application, you do not need any package installation or database configuration to launch it.

### Option A: Simple Local Server (Recommended)
Using Python or Node to serve the static assets correctly (prevents CORS issues with local modules):

**Using Python:**
```bash
python -m http.server 8000
```
Open **`http://localhost:8000`** in your browser.

**Using Node.js:**
```bash
npm install -g http-server
http-server -p 8000
```
Open **`http://localhost:8000`** in your browser.

### Option B: Direct Execution
Double-click and open the [index.html](index.html) file directly in any modern browser.

---

## 🎨 UI Style System & Design
- **Unified Scoreboard Capsule**: Designed around a glassmorphic dashboard frame (`backdrop-filter`) with glowing borders and futuristic monospaced values.
- **Cyberpunk Aesthetics**: Curated dark stadium background mapped with a canvas-based responsive interactive particle web reacting to cursor movements.
- **Micro-Animations**: Clean GSAP FLIP transformations for sorting lists, hovering cards, rotating logos, and pop transitions.
- **Responsive Navigation**: Horizontally swipeable scroll-locked action navigation tabs built specifically for mobile viewports.
