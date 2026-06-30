/**
 * Football GOAT Ranking Dashboard - Logic & UI Controller
 * Features FLIP sorting animations, dynamic calculations, dynamic attribute sliders,
 * G.O.A.T. Data Center spreadsheet editor, Local Storage persistence, dynamic presets saving,
 * interactive SVG radar chart hover highlights, canvas PNG export, Windows-compatible SVG flag badges,
 * slider progress filling tracks, table progressive indicators, search filtering, URL hash sharing,
 * holographic mouse-tracking card tilts on Rank #1, G.O.A.T match commentary simulation,
 * blinking LIVE broadcast indicators, and dynamic SVG circular progress gauges.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Core State variables (will load from Local Storage if available)
  let currentWeights = {
    goals: 5,
    assists: 5,
    clubTitles: 5,
    internationalTitles: 5,
    ballondOr: 5,
    individualAwards: 5,
    longevityScore: 5,
    peakScore: 5
  };

  let activeMetrics = ['goals', 'assists', 'clubTitles', 'internationalTitles', 'ballondOr', 'individualAwards', 'longevityScore', 'peakScore'];
  
  let metricLabels = {
    goals: 'Goals',
    assists: 'Assists',
    clubTitles: 'Club Titles',
    internationalTitles: 'Int. Titles',
    ballondOr: "Ballon d'Or",
    individualAwards: 'Indiv. Awards',
    longevityScore: 'Longevity',
    peakScore: 'Peak Performance'
  };

  let customPresets = {};
  let searchQuery = '';
  let isSimulating = false;

  // Default Preset definitions
  const defaultPresets = {
    balanced: { goals: 5, assists: 5, clubTitles: 5, internationalTitles: 5, ballondOr: 5, individualAwards: 5, longevityScore: 5, peakScore: 5 },
    scorers: { goals: 10, assists: 3, clubTitles: 5, internationalTitles: 6, ballondOr: 7, individualAwards: 8, longevityScore: 7, peakScore: 9 },
    playmakers: { goals: 4, assists: 10, clubTitles: 6, internationalTitles: 6, ballondOr: 7, individualAwards: 6, longevityScore: 8, peakScore: 8 },
    trophies: { goals: 4, assists: 4, clubTitles: 8, internationalTitles: 10, ballondOr: 6, individualAwards: 5, longevityScore: 7, peakScore: 8 },
    peak: { goals: 5, assists: 5, clubTitles: 4, internationalTitles: 6, ballondOr: 9, individualAwards: 8, longevityScore: 3, peakScore: 10 },
    longevity: { goals: 7, assists: 6, clubTitles: 7, internationalTitles: 5, ballondOr: 6, individualAwards: 5, longevityScore: 10, peakScore: 5 }
  };

  // Load state from local storage before initialize
  loadStateFromLocalStorage();

  // Load weights from URL hash (if shared)
  loadStateFromUrlHash();

  const maxValues = {};
  calculateMaxValues();

  // 3. Selectors & DOM elements
  const weightControlsContainer = document.getElementById('weight-controls');
  const presetsContainer = document.getElementById('presets-container');
  const savePresetBtn = document.getElementById('save-preset-btn');
  const shareAlgoBtn = document.getElementById('share-algo-btn');
  const resetDbBtn = document.getElementById('reset-db-btn');
  const leaderboardContainer = document.getElementById('leaderboard-list');
  const searchInput = document.getElementById('leaderboard-search');
  
  // Comparison & Simulator selectors
  const p1Select = document.getElementById('compare-p1');
  const p2Select = document.getElementById('compare-p2');
  const p3Select = document.getElementById('compare-p3');
  const radarChartWrapper = document.getElementById('radar-chart-container');
  const comparisonTableBody = document.getElementById('comparison-table-body');
  const exportChartBtn = document.getElementById('export-chart-btn');
  
  // Simulator Arena DOM Elements
  const simulateMatchBtn = document.getElementById('simulate-match-btn');
  const simulationConsole = document.getElementById('simulation-console');
  const commentaryFeed = document.getElementById('commentary-feed');
  const liveDot = document.getElementById('live-dot');
  const statusText = document.getElementById('status-text');
  const simulationScoreboard = document.getElementById('simulation-scoreboard');

  // G.O.A.T. Data Center elements
  const spreadsheetTable = document.getElementById('spreadsheet-table');
  const addMetricBtn = document.getElementById('add-metric-btn');
  const addPlayerBtn = document.getElementById('add-player-btn');
  
  // Modal Elements
  const modalOverlay = document.getElementById('player-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalPlayerName = document.getElementById('modal-player-name');
  const modalPlayerMeta = document.getElementById('modal-player-meta-info');
  const modalBio = document.getElementById('modal-bio');
  const modalStatsGrid = document.getElementById('modal-stats-grid');
  const modalAchievementsList = document.getElementById('modal-achievements');
  const modalRadarContainer = document.getElementById('modal-radar-container');

  // What-If Scenario Engine State
  const whatifToggle = document.getElementById('whatif-toggle');
  const whatifActions = document.getElementById('whatif-actions-panel');
  const whatifApply = document.getElementById('whatif-apply-btn');
  const whatifReset = document.getElementById('whatif-reset-btn');
  const whatifDelta = document.getElementById('whatif-rank-delta');

  let isWhatIfActive = false;
  let whatIfPlayerId = null;
  let originalPlayerStats = null;

  // ==========================================================================
  // WORKSPACE TABS ENGINE
  // ==========================================================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      
      // Deactivate all buttons
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      
      // Hide all tabs
      tabContents.forEach(tc => {
        tc.classList.remove('active');
        tc.style.display = 'none';
      });
      
      // Activate clicked button and target content
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      
      const targetTab = document.getElementById(targetId);
      if (targetTab) {
        targetTab.style.display = 'block';
        targetTab.classList.add('active');
        // Fluid framer-motion style spring transition using GSAP
        gsap.fromTo(targetTab, 
          { opacity: 0, y: 15, scale: 0.99 }, 
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power2.out", clearProps: "transform,scale,opacity" }
        );
      }
      
      // Play tab switch sound
      if (typeof SoundFX !== 'undefined') SoundFX.playCardFlip();
      
      // Reflow SVG charts and spreadsheets when switching tabs
      if (targetId === 'tab-comparison') {
        updateComparison();
      } else if (targetId === 'tab-datacenter') {
        renderSpreadsheet();
        if (typeof Achievements !== 'undefined') Achievements.unlock('data_analyst');
      }
    });
  });

  // 4. Initial Setup
  initializeDashboard();

  // ==========================================================================
  // DYNAMIC CIRCULAR PROGRESS GAUGE GENERATOR
  // ==========================================================================
  
  function getRadialProgressSVG(value) {
    const r = 28;
    const c = 2 * Math.PI * r;
    const offset = c - (Math.min(Math.max(value, 0), 100) / 100) * c;
    return `
      <div class="radial-progress-gauge">
        <svg>
          <circle class="gauge-bg" cx="34" cy="34" r="${r}"></circle>
          <circle class="gauge-fill" cx="34" cy="34" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${offset}"></circle>
        </svg>
        <span class="gauge-value">${value}</span>
      </div>
    `;
  }

  // ==========================================================================
  // WINDOWS COMPATIBLE SVG FLAG GENERATOR
  // ==========================================================================
  
  function getSVGFlag(countryCode) {
    const code = (countryCode || '').toUpperCase().trim();
    
    const svgMap = {
      AR: `<svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg"><rect width="3" height="2" fill="#74acdf"/><rect y="0.67" width="3" height="0.67" fill="#fff"/><rect y="1.33" width="3" height="0.67" fill="#74acdf"/><circle cx="1.5" cy="1" r="0.15" fill="#f6b426"/></svg>`,
      PT: `<svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg"><rect width="1.2" height="2" fill="#006600"/><rect x="1.2" width="1.8" height="2" fill="#ff0000"/><circle cx="1.2" cy="1" r="0.3" fill="#ffff00"/></svg>`,
      BR: `<svg viewBox="0 0 220 154" xmlns="http://www.w3.org/2000/svg"><rect width="220" height="154" fill="#009c3b"/><polygon points="110,8 212,77 110,146 8,77" fill="#ffdf00"/><circle cx="110" cy="77" r="31" fill="#0021b0"/></svg>`,
      FR: `<svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="2" fill="#002395"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ed2939"/></svg>`,
      NL: `<svg viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg"><rect width="3" height="0.67" fill="#ae1c28"/><rect y="0.67" width="3" height="0.67" fill="#fff"/><rect y="1.33" width="3" height="0.67" fill="#21468b"/></svg>`,
      DE: `<svg viewBox="0 0 5 3" xmlns="http://www.w3.org/2000/svg"><rect width="5" height="1" fill="#000"/><rect y="1" width="5" height="1" fill="#dd0000"/><rect y="2" width="5" height="1" fill="#ffce00"/></svg>`
    };

    const inlineSvg = svgMap[code] || `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="#3b4252"/><path d="M50,15 L75,35 L65,75 L35,75 L25,35 Z" fill="#eceff4"/><circle cx="50" cy="50" r="10" fill="#f59e0b"/></svg>`;
    return `<div class="flag-badge" title="${code}">${inlineSvg}</div>`;
  }

  // ==========================================================================
  // STATE MANAGEMENT & LOCAL STORAGE SYNC & HASH SHARING
  // ==========================================================================
  
  function saveStateToLocalStorage() {
    localStorage.setItem('goat_players_data', JSON.stringify(window.playersData));
    localStorage.setItem('goat_active_metrics', JSON.stringify(activeMetrics));
    localStorage.setItem('goat_metric_labels', JSON.stringify(metricLabels));
    localStorage.setItem('goat_current_weights', JSON.stringify(currentWeights));
    localStorage.setItem('goat_custom_presets', JSON.stringify(customPresets));
  }

  function loadStateFromLocalStorage() {
    try {
      const storedPlayers = localStorage.getItem('goat_players_data');
      if (storedPlayers) {
        const parsed = JSON.parse(storedPlayers);
        // Sync cached players data with current static dataset to prevent countryCode missing bugs
        window.playersData = parsed.map(p => {
          const original = window.playersData.find(orig => orig.id === p.id);
          if (original) {
            return {
              ...original,
              ...p,
              stats: { ...original.stats, ...p.stats },
              countryCode: original.countryCode || p.countryCode,
              achievements: original.achievements || p.achievements
            };
          }
          return p;
        });
      }
      
      const storedMetrics = localStorage.getItem('goat_active_metrics');
      if (storedMetrics) {
        activeMetrics = JSON.parse(storedMetrics);
      }
      
      const storedLabels = localStorage.getItem('goat_metric_labels');
      if (storedLabels) {
        metricLabels = JSON.parse(storedLabels);
      }
      
      const storedWeights = localStorage.getItem('goat_current_weights');
      if (storedWeights) {
        currentWeights = JSON.parse(storedWeights);
      }

      const storedPresets = localStorage.getItem('goat_custom_presets');
      if (storedPresets) {
        customPresets = JSON.parse(storedPresets);
      }
    } catch (e) {
      console.error("Failed to load local storage state.", e);
    }
  }

  function loadStateFromUrlHash() {
    if (window.location.hash && window.location.hash.startsWith('#w=')) {
      try {
        const hashVal = window.location.hash.substring(3);
        const decoded = decodeURIComponent(hashVal);
        const parts = decoded.split(',');
        parts.forEach(part => {
          const [key, val] = part.split(':');
          if (key && val !== undefined) {
            currentWeights[key] = parseInt(val);
          }
        });
        saveStateToLocalStorage();
      } catch (e) {
        console.error("Failed to parse URL hash weights.", e);
      }
    }
  }

  function shareAlgorithm() {
    const weightsString = activeMetrics.map(k => `${k}:${currentWeights[k] || 0}`).join(',');
    const hash = `#w=${encodeURIComponent(weightsString)}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}${hash}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("G.O.A.T. Algorithm Share Link Copied!");
    }).catch(err => {
      console.error('Could not copy link: ', err);
      prompt("Copy your custom algorithm link:", shareUrl);
    });
  }

  function showToast(message) {
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<span>🔗</span> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  function showCustomDialog({ title, message, type = 'alert', defaultValue = '' }) {
    return new Promise((resolve) => {
      const overlay = document.getElementById('custom-dialog-overlay');
      const titleEl = document.getElementById('custom-dialog-title');
      const msgEl = document.getElementById('custom-dialog-message');
      const inputContainer = document.getElementById('custom-dialog-input-container');
      const inputEl = document.getElementById('custom-dialog-input');
      const confirmBtn = document.getElementById('dialog-confirm-btn');
      const cancelBtn = document.getElementById('dialog-cancel-btn');

      if (!overlay) return resolve(null);

      titleEl.textContent = title || "System Message";
      msgEl.textContent = message || "";

      if (type === 'prompt') {
        inputContainer.style.display = 'block';
        inputEl.value = defaultValue;
        setTimeout(() => inputEl.focus(), 50);
      } else {
        inputContainer.style.display = 'none';
      }

      if (type === 'confirm' || type === 'prompt') {
        cancelBtn.style.display = 'inline-block';
      } else {
        cancelBtn.style.display = 'none';
      }

      overlay.style.display = 'flex';
      setTimeout(() => overlay.classList.add('active'), 10);

      const cleanup = () => {
        overlay.classList.remove('active');
        setTimeout(() => { overlay.style.display = 'none'; }, 250);
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
      };

      confirmBtn.onclick = () => {
        cleanup();
        if (type === 'prompt') {
          resolve(inputEl.value.trim());
        } else {
          resolve(true);
        }
      };

      cancelBtn.onclick = () => {
        cleanup();
        resolve(null);
      };
    });
  }

  async function resetDashboard() {
    const ok = await showCustomDialog({
      title: "⚠️ RESET DATABASE",
      message: "Are you sure you want to reset all modifications, custom players, and custom presets back to factory defaults?",
      type: 'confirm'
    });
    if (ok) {
      localStorage.removeItem('goat_players_data');
      localStorage.removeItem('goat_active_metrics');
      localStorage.removeItem('goat_metric_labels');
      localStorage.removeItem('goat_current_weights');
      localStorage.removeItem('goat_custom_presets');
      window.location.href = window.location.pathname;
    }
  }

  function calculateMaxValues() {
    activeMetrics.forEach(key => {
      maxValues[key] = Math.max(...window.playersData.map(p => p.stats[key] || 0));
    });
  }

  function initializeDashboard() {
    renderSliders();
    renderPresets();
    if (typeof Achievements !== 'undefined' && typeof Achievements.renderGallery === 'function') {
      Achievements.renderGallery();
    }

    exportChartBtn.addEventListener('click', exportComparisonChart);
    simulateMatchBtn.addEventListener('click', startMatchSimulation);

    addMetricBtn.addEventListener('click', addCustomMetric);
    addPlayerBtn.addEventListener('click', addCustomPlayer);
    resetDbBtn.addEventListener('click', resetDashboard);
    shareAlgoBtn.addEventListener('click', shareAlgorithm);

    renderSpreadsheet();

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      updateLeaderboard();
      if (searchQuery.length >= 3 && typeof Achievements !== 'undefined') {
        Achievements.unlock('search_scout');
      }
    });

    // Sub-tab toggling between Roster List and Tactical Soccer Pitch views
    const toggleListBtn = document.getElementById('toggle-list-btn');
    const togglePitchBtn = document.getElementById('toggle-pitch-btn');
    const leaderboardSearchContainer = document.getElementById('leaderboard-search-container');
    const leaderboardList = document.getElementById('leaderboard-list');
    const tacticalPitch = document.getElementById('tactical-pitch');

    if (toggleListBtn && togglePitchBtn && leaderboardList && tacticalPitch) {
      toggleListBtn.addEventListener('click', () => {
        toggleListBtn.classList.add('active');
        toggleListBtn.style.background = 'var(--accent-green-glow)';
        toggleListBtn.style.borderColor = 'var(--border-focus)';
        toggleListBtn.style.color = 'var(--accent-green)';
        
        togglePitchBtn.classList.remove('active');
        togglePitchBtn.style.background = 'none';
        togglePitchBtn.style.borderColor = 'transparent';
        togglePitchBtn.style.color = 'var(--text-secondary)';
        
        leaderboardList.style.display = 'flex';
        tacticalPitch.style.display = 'none';
        if (leaderboardSearchContainer) leaderboardSearchContainer.style.display = 'block';
      });

      togglePitchBtn.style.borderColor = 'transparent'; // Reset default border on loading
      togglePitchBtn.addEventListener('click', () => {
        togglePitchBtn.classList.add('active');
        togglePitchBtn.style.background = 'var(--accent-green-glow)';
        togglePitchBtn.style.borderColor = 'var(--border-focus)';
        togglePitchBtn.style.color = 'var(--accent-green)';
        
        toggleListBtn.classList.remove('active');
        toggleListBtn.style.background = 'none';
        toggleListBtn.style.borderColor = 'transparent';
        toggleListBtn.style.color = 'var(--text-secondary)';
        
        leaderboardList.style.display = 'none';
        tacticalPitch.style.display = 'block';
        if (leaderboardSearchContainer) leaderboardSearchContainer.style.display = 'none';
      });
    }

    populateSelect(p1Select, "messi");
    populateSelect(p2Select, "ronaldo");
    populateSelect(p3Select, "");

    p1Select.addEventListener('change', updateComparison);
    p2Select.addEventListener('change', updateComparison);
    p3Select.addEventListener('change', updateComparison);

    updateLeaderboard(true);
    updateComparison();
    updateDataCenterSummary();

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // What-If Listeners
    if (whatifToggle) {
      whatifToggle.addEventListener('click', () => {
        const player = window.playersData.find(p => p.id === whatIfPlayerId);
        if (!player) return;
        isWhatIfActive = !isWhatIfActive;
        whatifToggle.classList.toggle('active', isWhatIfActive);
        if (whatifActions) whatifActions.style.display = isWhatIfActive ? 'flex' : 'none';
        renderModalStats(player, isWhatIfActive);
        if (typeof SoundFX !== 'undefined') SoundFX.playCardFlip();
      });
    }

    if (whatifApply) {
      whatifApply.addEventListener('click', () => {
        const player = window.playersData.find(p => p.id === whatIfPlayerId);
        if (!player) return;
        
        if (!originalPlayerStats) {
          originalPlayerStats = JSON.parse(JSON.stringify(player.stats));
        }

        const initialRank = getPlayerRank(player.id);

        const inputs = modalStatsGrid.querySelectorAll('.whatif-stat-input');
        inputs.forEach(input => {
          const key = input.dataset.statKey;
          const val = parseInt(input.value) || 0;
          player.stats[key] = val;
        });

        updateLeaderboard();
        updateComparison();
        updateDataCenterSummary();
        renderSpreadsheet();

        const newRank = getPlayerRank(player.id);
        const rankDiff = initialRank - newRank;

        if (whatifDelta) {
          if (rankDiff > 0) {
            whatifDelta.className = 'whatif-rank-delta positive';
            whatifDelta.textContent = `+${rankDiff} ↑`;
          } else if (rankDiff < 0) {
            whatifDelta.className = 'whatif-rank-delta negative';
            whatifDelta.textContent = `${rankDiff} ↓`;
          } else {
            whatifDelta.className = 'whatif-rank-delta neutral';
            whatifDelta.textContent = `0`;
          }
        }

        renderRadarChart(modalRadarContainer, [player]);

        if (typeof SoundFX !== 'undefined') {
          if (rankDiff > 0) SoundFX.playCrowdRoar();
          else SoundFX.playWhistle();
        }
      });
    }

    if (whatifReset) {
      whatifReset.addEventListener('click', () => {
        const player = window.playersData.find(p => p.id === whatIfPlayerId);
        if (!player) return;

        if (originalPlayerStats) {
          player.stats = JSON.parse(JSON.stringify(originalPlayerStats));
          originalPlayerStats = null;
        }

        updateLeaderboard();
        updateComparison();
        updateDataCenterSummary();
        renderSpreadsheet();

        isWhatIfActive = false;
        whatifToggle.classList.remove('active');
        if (whatifActions) whatifActions.style.display = 'none';
        if (whatifDelta) {
          whatifDelta.className = 'whatif-rank-delta neutral';
          whatifDelta.textContent = '—';
        }

        renderModalStats(player, false);
        renderRadarChart(modalRadarContainer, [player]);

        if (typeof SoundFX !== 'undefined') SoundFX.playCardFlip();
      });
    }
    
    // Add custom legend registration bindings
    const addPlayerClose = document.getElementById('add-player-modal-close');
    const addPlayerOverlay = document.getElementById('add-player-modal');
    if (addPlayerClose) {
      addPlayerClose.addEventListener('click', closeAddPlayerModal);
    }
    if (addPlayerOverlay) {
      addPlayerOverlay.addEventListener('click', (e) => {
        if (e.target === addPlayerOverlay) closeAddPlayerModal();
      });
    }

    const addPlayerForm = document.getElementById('add-player-form');
    if (addPlayerForm) {
      addPlayerForm.addEventListener('submit', handleRegisterPlayerSubmit);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === "Escape") {
        closeModal();
        closeAddPlayerModal();
      }
    });
  }

  // ==========================================================================
  // PRESETS ENGINE
  // ==========================================================================
  
  function renderPresets() {
    const presetButtons = Array.from(presetsContainer.querySelectorAll('.btn-preset'));
    presetButtons.forEach(btn => {
      if (btn.id !== 'save-preset-btn' && !btn.dataset.preset) {
        btn.remove();
      }
    });

    Object.keys(customPresets).forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'btn-preset';
      btn.textContent = name;
      btn.addEventListener('click', (e) => {
        applyPreset(name, true);
        
        presetsContainer.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
      
      presetsContainer.insertBefore(btn, savePresetBtn);
    });

    presetButtons.forEach(btn => {
      if (btn.dataset.preset) {
        btn.onclick = (e) => {
          const presetKey = e.target.dataset.preset;
          applyPreset(presetKey, false);
          presetsContainer.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
        };
      }
    });

    savePresetBtn.onclick = async () => {
      const name = await showCustomDialog({
        title: "💾 SAVE CUSTOM PRESET",
        message: "Enter Custom Preset Name:",
        type: 'prompt'
      });
      if (!name || name.trim() === '') return;
      if (defaultPresets[name.toLowerCase()] || customPresets[name]) {
        await showCustomDialog({
          title: "❌ ERROR",
          message: "A preset with this name already exists!",
          type: 'alert'
        });
        return;
      }

      customPresets[name] = { ...currentWeights };
      saveStateToLocalStorage();
      renderPresets();
    };
  }

  function applyPreset(presetKey, isCustom = false) {
    const preset = isCustom ? customPresets[presetKey] : defaultPresets[presetKey];
    if (!preset) return;
    
    if (typeof SoundFX !== 'undefined') SoundFX.playCardFlip();
    
    if (!window._presetsUsed) window._presetsUsed = new Set();
    window._presetsUsed.add(presetKey);
    if (window._presetsUsed.size >= 3 && typeof Achievements !== 'undefined') {
      Achievements.unlock('algorithm_dj');
    }
    
    activeMetrics.forEach(metric => {
      currentWeights[metric] = preset[metric] !== undefined ? preset[metric] : 0;
    });
    
    saveStateToLocalStorage();
    renderSliders();
    updateLeaderboard();
    updateComparison();
  }

  function deactivatePresets() {
    presetsContainer.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
  }

  // ==========================================================================
  // SLIDERS & MATH RENDER
  // ==========================================================================

  function renderSliders() {
    weightControlsContainer.innerHTML = '';
    activeMetrics.forEach(metric => {
      if (currentWeights[metric] === undefined) {
        currentWeights[metric] = 5;
      }
      
      const label = metricLabels[metric] || metric;
      const controlGroup = document.createElement('div');
      controlGroup.className = 'control-group';
      controlGroup.innerHTML = `
        <div class="control-label-row">
          <label for="weight-${metric}" class="control-label">${label}</label>
          <span class="control-value" id="val-${metric}">${currentWeights[metric] * 10}%</span>
        </div>
        <input type="range" id="weight-${metric}" class="weight-slider" data-metric="${metric}" min="0" max="10" value="${currentWeights[metric]}">
      `;
      
      const slider = controlGroup.querySelector('input');
      updateSliderProgress(slider);

      slider.addEventListener('input', (e) => {
        currentWeights[metric] = parseInt(e.target.value);
        document.getElementById(`val-${metric}`).textContent = `${currentWeights[metric] * 10}%`;
        updateSliderProgress(e.target);
        deactivatePresets();
        saveStateToLocalStorage();
        updateLeaderboard();
        updateComparison();
        
        if (typeof SoundFX !== 'undefined') SoundFX.playTick();
        
        if (!window._movedSliders) window._movedSliders = new Set();
        window._movedSliders.add(metric);
        if (window._movedSliders.size === activeMetrics.length && typeof Achievements !== 'undefined') {
          Achievements.unlock('slider_master');
        }
      });

      weightControlsContainer.appendChild(controlGroup);
    });
  }

  function updateSliderProgress(input) {
    const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty('--value-percent', pct + '%');
  }

  function populateSelect(selectEl, defaultValue) {
    selectEl.innerHTML = selectEl.id === 'compare-p3' ? '<option value="">-- None --</option>' : '';
    window.playersData.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.flag} ${p.name} (${p.position})`;
      if (p.id === defaultValue) {
        opt.selected = true;
      }
      selectEl.appendChild(opt);
    });
  }

  function getNormalizedScore(player, metric) {
    const val = player.stats[metric] || 0;
    const max = maxValues[metric];
    if (max === 0 || !max) return 0;
    return (val / max) * 100;
  }

  function calculateWeightedScore(player) {
    let weightedSum = 0;
    let weightSum = 0;

    activeMetrics.forEach(metric => {
      const weight = currentWeights[metric] !== undefined ? currentWeights[metric] : 5;
      const normScore = getNormalizedScore(player, metric);
      weightedSum += normScore * weight;
      weightSum += weight;
    });

    if (weightSum === 0) return 0;
    return parseFloat((weightedSum / weightSum).toFixed(1));
  }

  function updateLeaderboard(isInitial = false) {
    const scoredPlayers = window.playersData.map(p => ({
      ...p,
      currentScore: calculateWeightedScore(p)
    }));

    scoredPlayers.sort((a, b) => {
      if (b.currentScore !== a.currentScore) {
        return b.currentScore - a.currentScore;
      }
      const peakB = b.stats.peakScore || 0;
      const peakA = a.stats.peakScore || 0;
      if (peakB !== peakA) {
        return peakB - peakA;
      }
      const bdOB = b.stats.ballondOr || 0;
      const bdOA = a.stats.ballondOr || 0;
      if (bdOB !== bdOA) {
        return bdOB - bdOA;
      }
      const intB = b.stats.internationalTitles || 0;
      const intA = a.stats.internationalTitles || 0;
      if (intB !== intA) {
        return intB - intA;
      }
      const goalsB = b.stats.goals || 0;
      const goalsA = a.stats.goals || 0;
      if (goalsB !== goalsA) {
        return goalsB - goalsA;
      }
      const assistsB = b.stats.assists || 0;
      const assistsA = a.stats.assists || 0;
      return assistsB - assistsA;
    });

    let filteredPlayers = scoredPlayers;
    if (window._eraFilter && window._eraFilter !== 'all') {
      const era = window._eraFilter;
      filteredPlayers = filteredPlayers.filter(p => {
        let startYear = p.eraStart || 2000;
        let endYear = new Date().getFullYear();
        if (p.years) {
          const parts = p.years.split('-');
          if (parts.length === 2) {
            const startPart = parts[0].trim();
            const endPart = parts[1].trim();
            const parsedStart = parseInt(startPart, 10);
            if (!isNaN(parsedStart)) startYear = parsedStart;
            if (endPart.toLowerCase().includes('present')) {
              endYear = new Date().getFullYear();
            } else {
              const parsedEnd = parseInt(endPart, 10);
              if (!isNaN(parsedEnd)) endYear = parsedEnd;
            }
          }
        }

        if (era === '1950') {
          return startYear < 1970 && endYear >= 1950;
        }
        if (era === '1970') {
          return startYear < 1990 && endYear >= 1970;
        }
        if (era === '1990') {
          return startYear < 2010 && endYear >= 1990;
        }
        if (era === '2000') {
          return endYear >= 2000;
        }
        return true;
      });
    }
    if (searchQuery) {
      filteredPlayers = filteredPlayers.filter(p => {
        return p.name.toLowerCase().includes(searchQuery) ||
               p.nationality.toLowerCase().includes(searchQuery) ||
               p.position.toLowerCase().includes(searchQuery) ||
               p.achievements.some(ach => ach.toLowerCase().includes(searchQuery));
      });
    }

    // Update header HUD stats
    const rank1Player = filteredPlayers[0];
    const headerScore = document.getElementById('hero-rank1-score');
    const headerLeaderName = document.getElementById('header-leader-name');
    const headerPlayerCount = document.getElementById('header-player-count');
    if (rank1Player) {
      const targetScore = Math.round(rank1Player.currentScore);
      if (headerScore) headerScore.textContent = targetScore;
      if (headerLeaderName) headerLeaderName.textContent = rank1Player.name.toUpperCase();
      
      // Update AI Verdict text
      const verdictEl = document.getElementById('ai-verdict-text');
      if (verdictEl && typeof generateGOATVerdict === 'function') {
        verdictEl.textContent = generateGOATVerdict(rank1Player, currentWeights);
      }
      
      // Update live broadcast scrolling ticker text dynamically
      const tickerContent = document.getElementById('broadcast-ticker-content');
      if (tickerContent) {
        tickerContent.innerHTML = `
          ⚡ ALGORITHM UPDATE: ${rank1Player.name.toUpperCase()} LEADS G.O.A.T. ROSTER WITH ${targetScore} OVR! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          ⚽ GOALS RECORD: Pelé holds historical record, Messi and Ronaldo lead active tallies... &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          🏆 TROPHY LEAGUE: Combined trophies calculated live based on active coefficients... &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          🎮 LIVE FEED: Adjust sliders to trigger instant global database recalculation.
        `;
      }
    }
    if (headerPlayerCount) headerPlayerCount.textContent = window.playersData.length;

    updateTacticalPitch(scoredPlayers.slice(0, 5));

    if (isInitial) {
      leaderboardContainer.innerHTML = '';
      filteredPlayers.forEach((p, idx) => {
        leaderboardContainer.appendChild(createPlayerCardElement(p, idx + 1));
      });
      setupHolographicTiltListener();
      
      // Stagger entrance on load
      gsap.from(leaderboardContainer.children, {
        opacity: 0,
        y: 20,
        scale: 0.98,
        duration: 0.5,
        stagger: 0.04,
        ease: "power2.out",
        clearProps: "opacity,transform,scale"
      });
      return;
    }

    // --- FLIP Animation Logic ---
    const cards = Array.from(leaderboardContainer.children);
    const firstPositions = {};
    cards.forEach(card => {
      const id = card.dataset.playerId;
      firstPositions[id] = card.getBoundingClientRect();
    });

    leaderboardContainer.innerHTML = '';
    filteredPlayers.forEach((p, idx) => {
      leaderboardContainer.appendChild(createPlayerCardElement(p, idx + 1));
    });

    const newCards = Array.from(leaderboardContainer.children);
    const sizeChanged = cards.length !== newCards.length;
    
    if (sizeChanged) {
      // Stagger entrance on search/filter changes
      gsap.from(newCards, {
        opacity: 0,
        y: 15,
        scale: 0.99,
        duration: 0.4,
        stagger: 0.03,
        ease: "power2.out",
        clearProps: "opacity,transform,scale"
      });
    } else {
      // Smooth FLIP rank transition using GSAP
      newCards.forEach(card => {
        const id = card.dataset.playerId;
        const firstRect = firstPositions[id];
        if (firstRect) {
          const lastRect = card.getBoundingClientRect();
          const deltaY = firstRect.top - lastRect.top;
          if (deltaY !== 0) {
            gsap.fromTo(card,
              { y: deltaY },
              { y: 0, duration: 0.5, ease: "power2.out", clearProps: "y" }
            );
          }
        }
      });
    }

    setupHolographicTiltListener();
    updateTacticalPitch(scoredPlayers.slice(0, 5));
  }
  window.updateLeaderboard = updateLeaderboard;

  function createPlayerCardElement(p, rank, layout = 'row') {
    const card = document.createElement('div');
    card.className = layout === 'vertical' ? 'player-card vertical-card' : 'player-card';
    card.dataset.playerId = p.id;
    card.dataset.rank = rank;

    const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const flagHtml = getSVGFlag(p.countryCode);
    
    if (layout === 'vertical') {
      const slotClass = typeof rank === 'string' ? rank.toLowerCase() : 'normal';
      card.innerHTML = `
        <!-- Top Header (Slot and Flag) -->
        <div class="vcard-header">
          <span class="vcard-slot-badge ${slotClass}">${typeof rank === 'number' ? `#${rank}` : rank}</span>
          <span class="vcard-flag">${flagHtml}</span>
        </div>

        <!-- Middle Body (Avatar & Name & OVR) -->
        <div class="vcard-profile">
          <div class="vcard-avatar-wrapper">
            <div class="vcard-avatar" style="background: linear-gradient(135deg, ${p.themeColor || 'rgba(77, 232, 232, 0.15)'});">
              ${initials}
            </div>
            <div class="vcard-ovr-badge">${Math.round(p.currentScore)}</div>
          </div>
          <div class="vcard-name">${p.name}</div>
          <div class="vcard-subtext">${p.position}</div>
        </div>

        <!-- Bottom Stats List (Real Stats) -->
        <div class="vcard-stats-list">
          <div class="vcard-stat-row">
            <span class="lbl">GOALS</span>
            <span class="val">${p.stats.goals}</span>
          </div>
          <div class="vcard-stat-row">
            <span class="lbl">ASSISTS</span>
            <span class="val">${p.stats.assists}</span>
          </div>
          <div class="vcard-stat-row">
            <span class="lbl">TROPHIES</span>
            <span class="val">${(p.stats.clubTitles || 0) + (p.stats.internationalTitles || 0)}</span>
          </div>
        </div>
      `;
    } else {
      let rankBadgeClass = 'rank-badge-normal';
      let rankBadge = `#${rank}`;
      if (rank === 1) {
        rankBadgeClass = 'rank-badge-gold';
        rankBadge = '👑';
      } else if (rank === 2) {
        rankBadgeClass = 'rank-badge-silver';
        rankBadge = '🥈';
      } else if (rank === 3) {
        rankBadgeClass = 'rank-badge-bronze';
        rankBadge = '🥉';
      }

      card.innerHTML = `
        <!-- Sleek Side Glow Accent -->
        <div class="row-glow-bar" data-rank="${rank}"></div>

        <!-- Rank Indicator Badge -->
        <div class="row-rank-container">
          <div class="rank-circle-badge ${rankBadgeClass}">${rankBadge}</div>
        </div>

        <!-- Player Avatar & Flag -->
        <div class="row-avatar-area">
          <div class="player-avatar-container">
            <div class="player-avatar-fallback">
              <span style="z-index: 2;">${initials}</span>
              <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(135deg, ${p.themeColor || 'rgba(255,255,255,0.1)'}); z-index: 1;"></div>
            </div>
          </div>
          <div class="row-flag">${flagHtml}</div>
        </div>

        <!-- Player Identity -->
        <div class="row-identity-area">
          <span class="row-player-name">${p.name}</span>
          <div class="row-player-subrow">
            <span class="pos-tag">${p.position.toUpperCase()}</span>
            <span class="years-text">${p.years}</span>
          </div>
        </div>

        <!-- Alignable Stats Columns -->
        <div class="row-stats-grid">
          <div class="row-stat-col">
            <span class="lbl">goals</span>
            <span class="val">${p.stats.goals || 0}</span>
          </div>
          <div class="row-stat-col">
            <span class="lbl">assists</span>
            <span class="val">${p.stats.assists || 0}</span>
          </div>
          <div class="row-stat-col">
            <span class="lbl">trophies</span>
            <span class="val">${(p.stats.clubTitles || 0) + (p.stats.internationalTitles || 0)}</span>
          </div>
        </div>

        <!-- Score rating block -->
        <div class="row-score-rating">
          <span class="score-val">${Math.round(p.currentScore)}</span>
          <span class="score-lbl">OVR</span>
        </div>
      `;
    }

    card.addEventListener('click', () => showPlayerModal(p.id));
    return card;
  }

  function setupHolographicTiltListener() {
    const rank1Card = leaderboardContainer.querySelector('.player-card[data-rank="1"]');
    if (!rank1Card) return;

    rank1Card.addEventListener('mousemove', (e) => {
      const rect = rank1Card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      
      const tiltX = ((y / rect.height) - 0.5) * -12;
      const tiltY = ((x / rect.width) - 0.5) * 12;
      
      rank1Card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px) scale(1.02)`;
      rank1Card.style.setProperty('--sheen-x', `${100 - pctX}%`);
      rank1Card.style.setProperty('--sheen-y', `${100 - pctY}%`);
    });

    rank1Card.addEventListener('mouseleave', () => {
      rank1Card.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease';
      rank1Card.style.transform = '';
      rank1Card.style.setProperty('--sheen-x', '50%');
      rank1Card.style.setProperty('--sheen-y', '50%');
      
      setTimeout(() => {
        rank1Card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
      }, 500);
    });
  }

  // ==========================================================================
  // INTERACTIVE TACTICAL FIELD LINEUP (GAMIFIED PITCH)
  // ==========================================================================
  
  function updateTacticalPitch(topPlayers) {
    const pitchContainer = document.getElementById('pitch-players-container');
    if (!pitchContainer) return;
    pitchContainer.innerHTML = '';

    const posCounts = { FW: 0, MF: 0, DF: 0, GK: 0 };
    const posIndices = { FW: 0, MF: 0, DF: 0, GK: 0 };

    topPlayers.forEach(p => {
      let grp = 'MF';
      const pos = (p.position || '').toUpperCase();
      if (pos.includes('FORWARD') || pos.includes('STRIKER') || pos.includes('FW') || pos.includes('WING')) {
        grp = 'FW';
      } else if (pos.includes('DEFEND') || pos.includes('DF') || pos.includes('BACK')) {
        grp = 'DF';
      } else if (pos.includes('GOAL') || pos.includes('GK')) {
        grp = 'GK';
      }
      p.posGroup = grp;
      posCounts[grp]++;
    });

    topPlayers.forEach((p, idx) => {
      const grp = p.posGroup;
      const count = posCounts[grp];
      const currentIdx = posIndices[grp]++;

      let x = 50;
      if (count > 1) {
        x = 15 + (currentIdx / (count - 1)) * 70;
      }

      let y = 50;
      if (grp === 'FW') {
        y = 20 + (idx * 2);
      } else if (grp === 'DF') {
        y = 78 - (idx * 2);
      } else if (grp === 'GK') {
        y = 90;
      } else {
        y = 48 + (idx % 2 === 0 ? 3 : -3);
      }

      const isLeader = idx === 0;
      const playerDot = document.createElement('div');
      playerDot.className = `pitch-player-dot ${isLeader ? 'leader' : ''}`;
      playerDot.style.left = `${x}%`;
      playerDot.style.top = `${y}%`;
      playerDot.title = `${p.name} (${p.position}) - OVR: ${p.currentScore}`;
      playerDot.addEventListener('click', () => {
        showPlayerModal(p.id);
      });

      const flagHtml = getSVGFlag(p.countryCode);
      const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      playerDot.innerHTML = `
        <div class="dot-rating">${Math.round(p.currentScore)}</div>
        <div class="dot-avatar-container">
          ${isLeader ? '<div class="leader-crown">👑</div>' : ''}
          <div class="dot-avatar">${initials}</div>
        </div>
        <div class="dot-flag-badge">${flagHtml}</div>
        <div class="dot-name">${p.name.split(' ').pop()}</div>
      `;

      pitchContainer.appendChild(playerDot);

      // Bounce-in spring stagger animation for pitch dots using GSAP
      gsap.fromTo(playerDot,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.55, delay: idx * 0.07, ease: "back.out(1.6)", clearProps: "scale,opacity" }
      );
    });
  }

  // ==========================================================================
  // COMPARISON ARENA & SVG RADAR HOVER HIGHLIGHTS
  // ==========================================================================
  
  function updateComparison() {
    const p1Id = p1Select.value;
    const p2Id = p2Select.value;
    const p3Id = p3Select.value;

    if (p1Id && p2Id && typeof Achievements !== 'undefined') {
      Achievements.unlock('comparator');
    }

    const selectedPlayers = [];
    if (p1Id) selectedPlayers.push(window.playersData.find(p => p.id === p1Id));
    if (p2Id) selectedPlayers.push(window.playersData.find(p => p.id === p2Id));
    if (p3Id) selectedPlayers.push(window.playersData.find(p => p.id === p3Id));

    renderRadarChart(radarChartWrapper, selectedPlayers);
    renderComparisonTable(selectedPlayers);
    renderComparisonLegend(selectedPlayers);
    setupRadarHighlightListeners();

    // DOM selectors for cards deck
    const vsP1Card = document.getElementById('vs-player1-card');
    const vsP2Card = document.getElementById('vs-player2-card');
    const vsP3Card = document.getElementById('vs-player3-card');
    const vsCenterBadge = document.getElementById('vs-center-badge-floating');
    const vsLiveScore = document.getElementById('vs-live-score');

    // Slot 1
    if (p1Id && vsP1Card) {
      const p1 = window.playersData.find(p => p.id === p1Id);
      p1.currentScore = calculateWeightedScore(p1);
      const isNew = vsP1Card.style.display !== 'flex' || vsP1Card.innerHTML === '';
      vsP1Card.style.display = 'flex';
      vsP1Card.innerHTML = '';
      vsP1Card.appendChild(createPlayerCardElement(p1, 'P1', 'vertical'));
      if (isNew) {
        gsap.fromTo(vsP1Card, { opacity: 0, x: -30, scale: 0.98 }, { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: "power2.out" });
      }
    } else if (vsP1Card) {
      vsP1Card.style.display = 'none';
      vsP1Card.innerHTML = '';
    }

    // Slot 2
    if (p2Id && vsP2Card) {
      const p2 = window.playersData.find(p => p.id === p2Id);
      p2.currentScore = calculateWeightedScore(p2);
      const isNew = vsP2Card.style.display !== 'flex' || vsP2Card.innerHTML === '';
      vsP2Card.style.display = 'flex';
      vsP2Card.innerHTML = '';
      vsP2Card.appendChild(createPlayerCardElement(p2, 'P2', 'vertical'));
      if (isNew) {
        gsap.fromTo(vsP2Card, { opacity: 0, x: 30, scale: 0.98 }, { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: "power2.out" });
      }
    } else if (vsP2Card) {
      vsP2Card.style.display = 'none';
      vsP2Card.innerHTML = '';
    }

    // Slot 3
    if (p3Id && vsP3Card) {
      const p3 = window.playersData.find(p => p.id === p3Id);
      p3.currentScore = calculateWeightedScore(p3);
      const isNew = vsP3Card.style.display !== 'flex' || vsP3Card.innerHTML === '';
      vsP3Card.style.display = 'flex';
      vsP3Card.innerHTML = '';
      vsP3Card.appendChild(createPlayerCardElement(p3, 'P3', 'vertical'));
      if (isNew) {
        gsap.fromTo(vsP3Card, { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power2.out" });
      }
    } else if (vsP3Card) {
      vsP3Card.style.display = 'none';
      vsP3Card.innerHTML = '';
    }

    // VS Center floating badge
    if (vsCenterBadge) {
      const isNew = vsCenterBadge.style.display !== 'flex';
      if (p1Id && p2Id && !p3Id) {
        vsCenterBadge.style.display = 'flex';
        if (isNew) {
          gsap.fromTo(vsCenterBadge, { opacity: 0, scale: 0.5, rotate: -35 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.55, ease: "back.out(1.7)" });
        }
      } else {
        vsCenterBadge.style.display = 'none';
      }
    }

    // Win Predictor calculations
    if (vsLiveScore) {
      if (p1Id && p2Id) {
        const p1 = window.playersData.find(p => p.id === p1Id);
        const p2 = window.playersData.find(p => p.id === p2Id);
        
        if (!isSimulating) {
          const getPowerRating = (player) => {
            const gRating = (player.stats.goals || 0) * (currentWeights.goals || 1);
            const pRating = (player.stats.peakScore || 50) * (currentWeights.peakScore || 1);
            const tRating = ((player.stats.internationalTitles || 0) + (player.stats.clubTitles || 0)) * (currentWeights.internationalTitles || 1);
            return gRating + pRating + tRating;
          };
          const p1Rating = getPowerRating(p1);
          const p2Rating = getPowerRating(p2);
          const ratio = p1Rating / (p1Rating + p2Rating || 1);
          const p1Prob = Math.round(ratio * 100);
          const p2Prob = 100 - p1Prob;
          
          vsLiveScore.innerHTML = `
            <div class="match-predictor-wrapper">
              <div class="predictor-bar-labels">
                <span>${p1.name.split(' ').pop()}: ${p1Prob}%</span>
                <span class="predictor-vs-text">WIN PROBABILITY</span>
                <span>${p2.name.split(' ').pop()}: ${p2Prob}%</span>
              </div>
              <div class="predictor-bar-track">
                <div class="predictor-bar-fill p1" style="width: 0%;"></div>
              </div>
            </div>
          `;
          const fillEl = vsLiveScore.querySelector('.predictor-bar-fill');
          if (fillEl) {
            gsap.to(fillEl, { width: `${p1Prob}%`, duration: 0.8, ease: "power2.out" });
          }
        }
      } else {
        if (!isSimulating) {
          vsLiveScore.innerHTML = `<div class="predictor-empty-msg">SELECT PLAYER 1 & 2 TO START MATCH PREDICTION</div>`;
        }
      }
    }
  }

  function renderRadarChart(container, players) {
    container.innerHTML = '';

    const width = 320;
    const height = 320;
    const cx = width / 2;
    const cy = height / 2;
    const r = 105;

    const metrics = activeMetrics.map(key => ({
      key: key,
      label: metricLabels[key] || key
    }));

    const numAxes = metrics.length;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "radar-svg");

    const gridLevels = 5;
    for (let level = 1; level <= gridLevels; level++) {
      const radiusLevel = r * (level / gridLevels);
      const points = [];
      for (let i = 0; i < numAxes; i++) {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;
        const x = cx + radiusLevel * Math.cos(angle);
        const y = cy + radiusLevel * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      poly.setAttribute("points", points.join(" "));
      poly.setAttribute("class", "radar-grid");
      svg.appendChild(poly);
    }

    metrics.forEach((m, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;
      
      const ax = cx + r * Math.cos(angle);
      const ay = cy + r * Math.sin(angle);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", cx);
      line.setAttribute("y1", cy);
      line.setAttribute("x2", ax);
      line.setAttribute("y2", ay);
      line.setAttribute("class", "radar-grid-axis");
      svg.appendChild(line);

      const labelDistance = r + 16;
      const lx = cx + labelDistance * Math.cos(angle);
      const ly = cy + labelDistance * Math.sin(angle) + 3;
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", lx);
      text.setAttribute("y", ly);
      text.setAttribute("class", "radar-axis-label");
      
      if (angle === -Math.PI / 2) text.setAttribute("y", ly - 5);
      if (angle === Math.PI / 2) text.setAttribute("y", ly + 5);
      if (Math.cos(angle) > 0.1) text.setAttribute("style", "text-anchor: start;");
      else if (Math.cos(angle) < -0.1) text.setAttribute("style", "text-anchor: end;");
      else text.setAttribute("style", "text-anchor: middle;");

      text.textContent = m.label;
      svg.appendChild(text);
    });

    const classColors = ['player1-radar', 'player2-radar', 'player3-radar'];
    const classPoints = ['player1-radar-pt', 'player2-radar-pt', 'player3-radar-pt'];

    players.forEach((player, playerIdx) => {
      const points = [];
      const ptElements = [];

      metrics.forEach((m, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;
        const score = getNormalizedScore(player, m.key);
        const radiusLevel = r * (score / 100);
        const x = cx + radiusLevel * Math.cos(angle);
        const y = cy + radiusLevel * Math.sin(angle);
        points.push(`${x},${y}`);

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 4);
        circle.setAttribute("class", `radar-point ${classPoints[playerIdx % classPoints.length]} player-pt-${player.id}`);
        circle.dataset.playerId = player.id;
        
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        const valStr = player.stats[m.key] !== undefined ? player.stats[m.key] : 0;
        title.textContent = `${player.name} - ${m.label}: ${valStr}`;
        circle.appendChild(title);
        
        ptElements.push(circle);
      });

      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      poly.setAttribute("points", points.join(" "));
      poly.setAttribute("class", `radar-polygon ${classColors[playerIdx % classColors.length]} player-poly-${player.id}`);
      poly.dataset.playerId = player.id;
      svg.appendChild(poly);

      ptElements.forEach(el => svg.appendChild(el));
    });

    container.appendChild(svg);
  }

  function renderComparisonTable(players) {
    comparisonTableBody.innerHTML = '';
    if (players.length === 0) {
      comparisonTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Select players above to compare stats</td></tr>`;
      return;
    }

    const metrics = activeMetrics.map(key => ({
      key: key,
      label: metricLabels[key] || key
    }));

    metrics.forEach(m => {
      const tr = document.createElement('tr');
      
      const labelTd = document.createElement('td');
      labelTd.className = 'stat-label';
      labelTd.textContent = m.label;
      tr.appendChild(labelTd);

      const values = players.map(p => p.stats[m.key] || 0);
      const maxVal = Math.max(...values);
      const isMultipleMax = values.filter(v => v === maxVal).length > 1;

      // Find the absolute maximum in the database to scale the bar
      const dbMax = maxValues[m.key] || 1;

      players.forEach((p, playerIdx) => {
        const val = p.stats[m.key] !== undefined ? p.stats[m.key] : 0;
        const pct = Math.min(Math.max((val / dbMax) * 100, 0), 100);
        
        const td = document.createElement('td');
        const colorClass = ['p1-color', 'p2-color', 'p3-color'][playerIdx % 3];
        const isWinner = val === maxVal && val > 0 && (!isMultipleMax || players.length > 1);

        td.innerHTML = `
          <div class="table-bar-container">
            <span class="table-bar-val ${isWinner ? 'winner-bold' : ''}">${val}</span>
            <div class="table-bar-track">
              <div class="table-bar-fill ${colorClass}" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
        
        if (isWinner) {
          td.className = 'winner-cell';
        }
        tr.appendChild(td);
      });

      for (let i = players.length; i < 3; i++) {
        const td = document.createElement('td');
        td.innerHTML = `
          <div class="table-bar-container">
            <span class="table-bar-val">-</span>
            <div class="table-bar-track" style="opacity: 0.25;">
              <div class="table-bar-fill" style="width: 0%"></div>
            </div>
          </div>
        `;
        td.style.color = 'var(--text-muted)';
        tr.appendChild(td);
      }

      comparisonTableBody.appendChild(tr);
    });
  }

  function renderComparisonLegend(players) {
    const legendContainer = document.querySelector('.comparison-legend');
    legendContainer.innerHTML = '';
    
    const classColors = ['p1', 'p2', 'p3'];
    players.forEach((p, idx) => {
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.dataset.playerId = p.id;
      
      const flagHtml = getSVGFlag(p.countryCode);
      legendItem.innerHTML = `
        <div class="legend-color ${classColors[idx]}"></div>
        ${flagHtml}
        <span>${p.name}</span>
      `;
      legendContainer.appendChild(legendItem);
    });
  }

  function setupRadarHighlightListeners() {
    const legendItems = document.querySelectorAll('.comparison-legend .legend-item');
    const polygons = radarChartWrapper.querySelectorAll('.radar-polygon');
    const points = radarChartWrapper.querySelectorAll('.radar-point');

    const focusPlayer = (playerId) => {
      polygons.forEach(p => {
        p.classList.add('dimmed');
        p.classList.remove('focused');
      });
      points.forEach(pt => {
        pt.classList.add('dimmed');
        pt.classList.remove('focused');
      });

      const targetPoly = radarChartWrapper.querySelector(`.player-poly-${playerId}`);
      if (targetPoly) {
        targetPoly.classList.remove('dimmed');
        targetPoly.classList.add('focused');
      }
      
      const targetPoints = radarChartWrapper.querySelectorAll(`.player-pt-${playerId}`);
      targetPoints.forEach(pt => {
        pt.classList.remove('dimmed');
        pt.classList.add('focused');
      });

      legendItems.forEach(item => {
        if (item.dataset.playerId === playerId) {
          item.classList.add('active-hover');
        } else {
          item.classList.remove('active-hover');
        }
      });
    };

    const clearFocus = () => {
      polygons.forEach(p => {
        p.classList.remove('dimmed');
        p.classList.remove('focused');
      });
      points.forEach(pt => {
        pt.classList.remove('dimmed');
        pt.classList.remove('focused');
      });
      legendItems.forEach(item => {
        item.classList.remove('active-hover');
      });
    };

    legendItems.forEach(item => {
      item.addEventListener('mouseenter', () => focusPlayer(item.dataset.playerId));
      item.addEventListener('mouseleave', clearFocus);
    });

    polygons.forEach(poly => {
      poly.addEventListener('mouseenter', () => focusPlayer(poly.dataset.playerId));
      poly.addEventListener('mouseleave', clearFocus);
    });
  }

  // ==========================================================================
  // G.O.A.T. MATCH COMMENTARY SIMULATOR
  // ==========================================================================
  
  function startMatchSimulation() {
    if (isSimulating) return;
    
    const p1Id = p1Select.value;
    const p2Id = p2Select.value;
    
    if (p1Id === p2Id) {
      alert("Please select two different legends to simulate a match!");
      return;
    }
    
    isSimulating = true;
    simulateMatchBtn.disabled = true;
    simulateMatchBtn.style.opacity = '0.5';
    
    const p1 = window.playersData.find(p => p.id === p1Id);
    const p2 = window.playersData.find(p => p.id === p2Id);
    
    commentaryFeed.innerHTML = '';
    simulationScoreboard.style.display = 'none';
    
    // Toggle blinking live dot indicators
    liveDot.style.display = 'inline-block';
    statusText.textContent = 'LIVE MATCH';
    statusText.style.color = '#ef4444';
    
    simulationConsole.style.display = 'block';
    simulationConsole.scrollIntoView({ behavior: 'smooth' });

    const getPowerRating = (player) => {
      const gRating = (player.stats.goals || 0) * (currentWeights.goals || 1);
      const pRating = (player.stats.peakScore || 50) * (currentWeights.peakScore || 1);
      const tRating = ((player.stats.internationalTitles || 0) + (player.stats.clubTitles || 0)) * (currentWeights.internationalTitles || 1);
      return gRating + pRating + tRating;
    };
    
    const p1Rating = getPowerRating(p1);
    const p2Rating = getPowerRating(p2);
    const ratio = p1Rating / (p1Rating + p2Rating);
    
    const baseGoals = Math.floor(Math.random() * 3);
    let p1Goals = baseGoals;
    let p2Goals = baseGoals;
    
    const totalMatchEvents = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < totalMatchEvents; i++) {
      if (Math.random() < ratio) {
        p1Goals++;
      } else {
        p2Goals++;
      }
    }

    const commentsList = [
      {
        min: "00'",
        text: `🏁 KICKOFF! The referee blows the whistle. The virtual arena lights up as ${p1.flag} ${p1.name} takes on ${p2.flag} ${p2.name} in this G.O.A.T matchup!`,
        type: 'whistle'
      },
      {
        min: "18'",
        text: Math.random() > 0.5 
          ? `⚡ Midfield brilliance! ${p1.name} performs a magical sequence, breaking away from the defensive line, but his shot sweeps just wide of the post.`
          : `⚡ Speed attack! ${p2.name} cuts inside from the wing, blasting a powerful shot that rattles the crossbar! Spectacular effort.`,
        type: 'regular'
      },
      {
        min: "44'",
        text: p1Goals > 0 
          ? `⚽ GOAAAAAL! ${p1.name} finds space on the edge of the box and curls an absolute beauty into the top corner! Dynamic playmaking in action. [${p1.name} scores]`
          : `⚽ GOAL FOR THE OPPOSITION! ${p2.name} rises highest inside the box to connect with a towering header, burying it into the net! [${p2.name} scores]`,
        type: 'goal'
      },
      {
        min: "68'",
        text: Math.random() > 0.5
          ? `⚠️ Tactically tight. ${p1.name} is fouled near the box. The referee issues a warning. Free kick incoming... but it is saved cleanly!`
          : `⚠️ Physical play. ${p2.name} slides in with a hard challenge. Yellow card! The tactical stakes are rising in this second half.`,
        type: 'regular'
      },
      {
        min: "85'",
        text: p2Goals > 0 
          ? `⚽ BALL IN THE NET! ${p2.name} intercepts a loose pass, executes a clinical nutmeg, and chips the keeper in a pure stroke of peak genius! [${p2.name} scores]`
          : `⚽ DRAMATIC GOAL! ${p1.name} weaves past three defenders inside the box and slots it home with ice-cold composure! Magnificent individual effort. [${p1.name} scores]`,
        type: 'goal'
      },
      {
        min: "90'",
        text: `🏁 FULL TIME! The referee blows the whistle. What an epic clash of football philosophies. The G.O.A.T Match Simulator comes to a close!`,
        type: 'whistle'
      }
    ];

    let liveP1Goals = 0;
    let liveP2Goals = 0;
    let step = 0;
    const printCommentary = () => {
      if (step < commentsList.length) {
        const comm = commentsList[step];
        const row = document.createElement('div');
        row.className = `commentary-row ${comm.type}`;
        row.innerHTML = `<strong>[${comm.min}]</strong> ${comm.text}`;
        commentaryFeed.appendChild(row);
        commentaryFeed.scrollTop = commentaryFeed.scrollHeight;

        gsap.fromTo(row,
          { opacity: 0, y: 12, scaleY: 0.95 },
          { opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease: "power2.out" }
        );
        
        const vsLiveScore = document.getElementById('vs-live-score');
        const p1Card = document.getElementById('vs-player1-card');
        const p2Card = document.getElementById('vs-player2-card');

        // Trigger goal score increments and shake animations on specific commentary milestones
        if (comm.type === 'goal') {
          if (step === 2) {
            // First goal at 44'
            if (p1Goals > 0) {
              liveP1Goals++;
              if (p1Card) { gsap.fromTo(p1Card, { x: -8 }, { x: 0, duration: 0.08, repeat: 5, yoyo: true, ease: "power1.inOut", clearProps: "x" }); }
            } else {
              liveP2Goals++;
              if (p2Card) { gsap.fromTo(p2Card, { x: -8 }, { x: 0, duration: 0.08, repeat: 5, yoyo: true, ease: "power1.inOut", clearProps: "x" }); }
            }
          } else if (step === 4) {
            // Second goal at 85'
            if (p2Goals > 0) {
              liveP2Goals++;
              if (p2Card) { gsap.fromTo(p2Card, { x: -8 }, { x: 0, duration: 0.08, repeat: 5, yoyo: true, ease: "power1.inOut", clearProps: "x" }); }
            } else {
              liveP1Goals++;
              if (p1Card) { gsap.fromTo(p1Card, { x: -8 }, { x: 0, duration: 0.08, repeat: 5, yoyo: true, ease: "power1.inOut", clearProps: "x" }); }
            }
          }
          if (vsLiveScore) {
            vsLiveScore.innerHTML = `
              <div class="sim-score-hud">
                <span class="sim-score-val">${liveP1Goals}</span>
                <span class="sim-score-dash">-</span>
                <span class="sim-score-val">${liveP2Goals}</span>
              </div>
            `;
            // Framer motion style springy scale zoom on scoring
            gsap.fromTo(vsLiveScore,
              { scale: 0.6, opacity: 0.5 },
              { scale: 1.25, opacity: 1, duration: 0.3, ease: "back.out(2)" }
            );
            gsap.to(vsLiveScore, { scale: 1, delay: 0.3, duration: 0.2, ease: "power1.out" });
          }
        }

        step++;
        setTimeout(printCommentary, 1200);
      } else {
        // Complete, hide blinking live dot indicator
        liveDot.style.display = 'none';
        statusText.textContent = 'MATCH FINISHED';
        statusText.style.color = 'var(--accent-green)';
        
        // Final Score Correction (ensures ultimate sync)
        const vsLiveScore = document.getElementById('vs-live-score');
        if (vsLiveScore) {
          vsLiveScore.innerHTML = `
            <div class="sim-score-hud">
              <span class="sim-score-val">${p1Goals}</span>
              <span class="sim-score-dash">-</span>
              <span class="sim-score-val">${p2Goals}</span>
            </div>
          `;
        }

        showSimulationScoreboard(p1, p1Goals, p2, p2Goals);
      }
    };

    printCommentary();
  }

  function showSimulationScoreboard(p1, p1Goals, p2, p2Goals) {
    const flag1 = getSVGFlag(p1.countryCode);
    const flag2 = getSVGFlag(p2.countryCode);

    simulationScoreboard.innerHTML = `
      <div class="sim-scoreboard-player">
        ${flag1}
        <span style="font-weight: 700; font-size: 1.1rem; text-align: center; margin-top: 4px;">${p1.name}</span>
        <span class="score-num" style="color: ${p1Goals >= p2Goals ? 'var(--accent-green)' : 'var(--text-muted)'};">${p1Goals}</span>
      </div>
      <div class="sim-scoreboard-divider">VS</div>
      <div class="sim-scoreboard-player">
        ${flag2}
        <span style="font-weight: 700; font-size: 1.1rem; text-align: center; margin-top: 4px;">${p2.name}</span>
        <span class="score-num" style="color: ${p2Goals >= p1Goals ? 'var(--accent-green)' : 'var(--text-muted)'};">${p2Goals}</span>
      </div>
    `;

    simulationScoreboard.style.display = 'flex';
    gsap.fromTo(simulationScoreboard, 
      { opacity: 0, scale: 0.9, y: 15 }, 
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)", clearProps: "transform,scale" }
    );
    isSimulating = false;
    simulateMatchBtn.disabled = false;
    simulateMatchBtn.style.opacity = '1';
  }

  // ==========================================================================
  // DETAILS MODAL & ATTRIBUTE GAUGES
  // ==========================================================================

  function getPlayerRank(playerId) {
    const scored = window.playersData.map(p => ({
      id: p.id,
      currentScore: calculateWeightedScore(p)
    })).sort((a, b) => b.currentScore - a.currentScore);
    return scored.findIndex(p => p.id === playerId) + 1;
  }

  function renderModalStats(player, isEditable) {
    modalStatsGrid.innerHTML = '';
    activeMetrics.forEach(key => {
      const label = metricLabels[key] || key;
      const val = player.stats[key] !== undefined ? player.stats[key] : 0;
      
      const statBox = document.createElement('div');
      statBox.className = 'stat-box-modal';
      
      if (isEditable) {
        statBox.innerHTML = `
          <input type="number" class="whatif-stat-input" data-stat-key="${key}" value="${val}" min="0" max="999">
          <div class="lbl" style="margin-top:6px;">${label}</div>
        `;
      } else {
        if (key === 'longevityScore' || key === 'peakScore') {
          statBox.innerHTML = `
            <div style="display:flex; justify-content:center; margin-bottom:8px;">${getRadialProgressSVG(val)}</div>
            <div class="lbl" style="margin-top:0;">${label}</div>
          `;
        } else {
          statBox.innerHTML = `
            <div class="val">${val}</div>
            <div class="lbl">${label}</div>
          `;
        }
      }
      modalStatsGrid.appendChild(statBox);
    });
  }

  function showPlayerModal(playerId) {
    const player = window.playersData.find(p => p.id === playerId);
    if (!player) return;

    whatIfPlayerId = playerId;
    isWhatIfActive = false;
    originalPlayerStats = null;
    if (whatifToggle) whatifToggle.classList.remove('active');
    if (whatifActions) whatifActions.style.display = 'none';
    if (whatifDelta) {
      whatifDelta.className = 'whatif-rank-delta neutral';
      whatifDelta.textContent = '—';
    }

    modalPlayerName.textContent = player.name;
    
    const flagHtml = getSVGFlag(player.countryCode);
    modalPlayerMeta.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px; font-weight:600;">
        ${flagHtml} ${player.nationality} | ${player.position} | ${player.years}
      </div>
    `;
    modalBio.textContent = player.bio;

    renderModalStats(player, false);

    modalAchievementsList.innerHTML = '';
    player.achievements.forEach(ach => {
      const li = document.createElement('div');
      li.className = 'achievement-item';
      li.textContent = ach;
      modalAchievementsList.appendChild(li);
    });

    const headerHero = document.querySelector('.modal-header-hero');
    headerHero.style.borderImage = `linear-gradient(to right, ${player.themeColor || 'var(--accent-green)'}) 1`;

    renderRadarChart(modalRadarContainer, [player]);

    modalOverlay.style.display = 'flex';
    const modalContent = modalOverlay.querySelector('.modal-content');
    
    // Animate overlay fade and 3D content scale spring pop
    gsap.killTweensOf([modalOverlay, modalContent]);
    gsap.fromTo(modalOverlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(modalContent, 
      { scale: 0.9, y: 30 }, 
      { scale: 1, y: 0, duration: 0.45, ease: "back.out(1.5)", clearProps: "transform" }
    );
  }

  function closeModal() {
    const modalContent = modalOverlay.querySelector('.modal-content');
    gsap.killTweensOf([modalOverlay, modalContent]);
    gsap.to(modalOverlay, { opacity: 0, duration: 0.25, onComplete: () => { modalOverlay.style.display = 'none'; } });
    gsap.to(modalContent, { scale: 0.93, y: 20, duration: 0.25, ease: "power2.in" });
  }

  // ==========================================================================
  // G.O.A.T. DATA CENTER (Spreadsheet Stats Grid & Modifiability)
  // ==========================================================================
  
  function renderSpreadsheet() {
    spreadsheetTable.innerHTML = '';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const thName = document.createElement('th');
    thName.textContent = 'Legend Name';
    headerRow.appendChild(thName);
    
    const thNation = document.createElement('th');
    thNation.textContent = 'Nation';
    headerRow.appendChild(thNation);

    const thPos = document.createElement('th');
    thPos.textContent = 'Position';
    headerRow.appendChild(thPos);
    
    activeMetrics.forEach(metric => {
      const th = document.createElement('th');
      th.textContent = metricLabels[metric] || metric;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    spreadsheetTable.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    window.playersData.forEach(player => {
      const row = document.createElement('tr');
      row.dataset.playerId = player.id;
      
      const tdName = document.createElement('td');
      tdName.className = 'player-name-cell editable';
      tdName.dataset.field = 'name';
      tdName.textContent = player.name;
      row.appendChild(tdName);
      
      const tdNation = document.createElement('td');
      tdNation.className = 'editable';
      tdNation.dataset.field = 'nationality';
      
      const flagHtml = getSVGFlag(player.countryCode);
      tdNation.innerHTML = `<div style="display:flex; align-items:center; gap:6px;">${flagHtml} <span>${player.nationality}</span></div>`;
      row.appendChild(tdNation);

      const tdPos = document.createElement('td');
      tdPos.className = 'editable';
      tdPos.dataset.field = 'position';
      tdPos.textContent = player.position;
      row.appendChild(tdPos);
      
      activeMetrics.forEach(metric => {
        const td = document.createElement('td');
        td.className = 'editable';
        td.dataset.field = 'stat';
        td.dataset.metric = metric;
        td.textContent = player.stats[metric] !== undefined ? player.stats[metric] : 0;
        row.appendChild(td);
      });
      
      tbody.appendChild(row);
    });
    
    spreadsheetTable.appendChild(tbody);
    
    const editableCells = spreadsheetTable.querySelectorAll('td.editable');
    editableCells.forEach(cell => {
      cell.addEventListener('click', () => makeCellEditable(cell));
    });
    
    updateDataCenterSummary();
  }

  function makeCellEditable(cell) {
    if (cell.querySelector('input')) return;
    
    const field = cell.dataset.field;
    const playerId = cell.parentElement.dataset.playerId;
    const player = window.playersData.find(p => p.id === playerId);
    let originalText = cell.textContent.trim();
    
    if (field === 'nationality') {
      originalText = player.nationality;
    }
    
    const input = document.createElement('input');
    input.className = 'spreadsheet-cell-input';
    
    if (field === 'stat') {
      input.type = 'number';
      input.value = originalText;
      input.min = '0';
    } else {
      input.type = 'text';
      input.value = originalText;
    }
    
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    
    const saveChanges = () => {
      const newValue = input.value.trim();
      
      if (field === 'stat') {
        const metric = cell.dataset.metric;
        const numVal = parseInt(newValue) || 0;
        player.stats[metric] = numVal;
        cell.textContent = numVal;
      } else if (field === 'name') {
        player.name = newValue || player.name;
        cell.textContent = player.name;
      } else if (field === 'position') {
        player.position = newValue || player.position;
        cell.textContent = player.position;
      } else if (field === 'nationality') {
        player.nationality = newValue || player.nationality;
        const flagHtml = getSVGFlag(player.countryCode);
        cell.innerHTML = `<div style="display:flex; align-items:center; gap:6px;">${flagHtml} <span>${player.nationality}</span></div>`;
      }
      
      calculateMaxValues();
      saveStateToLocalStorage();
      updateLeaderboard();
      updateComparison();
      
      populateSelect(p1Select, p1Select.value);
      populateSelect(p2Select, p2Select.value);
      populateSelect(p3Select, p3Select.value);

      // Cyan flash transition animation on edited cell
      cell.style.transition = 'none';
      cell.style.backgroundColor = 'var(--accent-green-glow)';
      cell.offsetHeight; // trigger browser reflow
      cell.style.transition = 'background-color 1s ease';
      cell.style.backgroundColor = '';

      updateDataCenterSummary();
    };
    
    input.addEventListener('blur', saveChanges);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      } else if (e.key === 'Escape') {
        if (field === 'nationality') {
          const flagHtml = getSVGFlag(player.countryCode);
          cell.innerHTML = `<div style="display:flex; align-items:center; gap:6px;">${flagHtml} <span>${player.nationality}</span></div>`;
        } else {
          cell.textContent = originalText;
        }
      }
    });
  }

  function updateDataCenterSummary() {
    if (!window.playersData || window.playersData.length === 0) return;

    const topScorerName = document.getElementById('top-scorer-name');
    const topScorerVal = document.getElementById('top-scorer-val');
    const topPlaymakerName = document.getElementById('top-playmaker-name');
    const topPlaymakerVal = document.getElementById('top-playmaker-val');
    const topTrophiesName = document.getElementById('top-trophies-name');
    const topTrophiesVal = document.getElementById('top-trophies-val');

    if (!topScorerName) return;

    let maxGoals = -1;
    let topScorer = null;
    let maxAssists = -1;
    let topPlaymaker = null;
    let maxTrophies = -1;
    let topDecorated = null;

    window.playersData.forEach(p => {
      const g = p.stats.goals || 0;
      if (g > maxGoals) {
        maxGoals = g;
        topScorer = p;
      }

      const a = p.stats.assists || 0;
      if (a > maxAssists) {
        maxAssists = a;
        topPlaymaker = p;
      }

      const t = (p.stats.clubTitles || 0) + (p.stats.internationalTitles || 0);
      if (t > maxTrophies) {
        maxTrophies = t;
        topDecorated = p;
      }
    });

    const updateCard = (cardId, nameEl, valEl, newName, newVal) => {
      const oldVal = valEl.textContent;
      const card = document.getElementById(cardId);
      
      nameEl.textContent = newName;
      valEl.textContent = newVal;

      if (oldVal !== String(newVal) && oldVal !== '0' && oldVal !== 'Loading...') {
        if (card) {
          card.classList.add('flash-green');
          setTimeout(() => card.classList.remove('flash-green'), 800);
        }
      }
    };

    if (topScorer) {
      const nameParts = topScorer.name.split(' ');
      const initials = nameParts[nameParts.length - 1];
      updateCard('summary-top-scorer', topScorerName, topScorerVal, `${topScorer.nationality.substring(0,3).toUpperCase()} | ${initials}`, maxGoals);
    }
    if (topPlaymaker) {
      const nameParts = topPlaymaker.name.split(' ');
      const initials = nameParts[nameParts.length - 1];
      updateCard('summary-top-playmaker', topPlaymakerName, topPlaymakerVal, `${topPlaymaker.nationality.substring(0,3).toUpperCase()} | ${initials}`, maxAssists);
    }
    if (topDecorated) {
      const nameParts = topDecorated.name.split(' ');
      const initials = nameParts[nameParts.length - 1];
      updateCard('summary-top-trophies', topTrophiesName, topTrophiesVal, `${topDecorated.nationality.substring(0,3).toUpperCase()} | ${initials}`, maxTrophies);
    }
  }

  async function addCustomMetric() {
    const metricName = await showCustomDialog({
      title: "📊 ADD CUSTOM METRIC",
      message: "Enter Custom Metric Name (e.g. UCL Goals, Pass Accuracy %):",
      type: 'prompt'
    });
    if (!metricName || metricName.trim() === '') return;
    
    const key = metricName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (activeMetrics.includes(key)) {
      await showCustomDialog({
        title: "❌ ERROR",
        message: "This metric already exists!",
        type: 'alert'
      });
      return;
    }
    
    activeMetrics.push(key);
    metricLabels[key] = metricName;
    
    window.playersData.forEach(p => {
      p.stats[key] = 0;
    });
    
    calculateMaxValues();
    saveStateToLocalStorage();
    renderSliders();
    renderSpreadsheet();
    updateLeaderboard();
    updateComparison();
  }

  function addCustomPlayer() {
    const modal = document.getElementById('add-player-modal');
    if (!modal) return;
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
  }

  function closeAddPlayerModal() {
    const modal = document.getElementById('add-player-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => { modal.style.display = 'none'; }, 250);
    }
  }

  async function handleRegisterPlayerSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('new-player-name').value.trim();
    const nationality = document.getElementById('new-player-nationality').value.trim();
    const countryCode = document.getElementById('new-player-countrycode').value.trim().toUpperCase();
    const position = document.getElementById('new-player-position').value.trim();
    const years = document.getElementById('new-player-years').value.trim();

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (window.playersData.some(p => p.id === id)) {
      await showCustomDialog({
        title: "❌ REGISTRATION ERROR",
        message: `A legend named "${name}" already exists in the database!`,
        type: 'alert'
      });
      return;
    }

    let parsedEraStart = 2000;
    if (years) {
      const match = years.match(/\d{4}/);
      if (match) {
        parsedEraStart = parseInt(match[0], 10);
      }
    }

    const newPlayer = {
      id: id,
      name: name,
      nationality: nationality,
      countryCode: countryCode,
      flag: "🏳️",
      position: position,
      years: years,
      eraStart: parsedEraStart,
      photo: "assets/images/default.jpg",
      bio: `${name} is a legendary football player from ${nationality}.`,
      stats: {
        longevityScore: 50,
        peakScore: 50
      },
      achievements: [
        "Added dynamically via G.O.A.T. Data Center"
      ],
      themeColor: "from-gray-700 via-gray-500 to-gray-900"
    };

    activeMetrics.forEach(metric => {
      if (newPlayer.stats[metric] === undefined) {
        newPlayer.stats[metric] = 0;
      }
    });

    window.playersData.push(newPlayer);
    
    calculateMaxValues();
    saveStateToLocalStorage();
    renderSpreadsheet();
    updateLeaderboard();
    updateComparison();
    
    populateSelect(p1Select, p1Select.value);
    populateSelect(p2Select, p2Select.value);
    populateSelect(p3Select, p3Select.value);

    closeAddPlayerModal();
    showToast(`Registered ${name} to the Squad!`);
  }

  // ==========================================================================
  // RADAR CHART EXPORT ENGINE (SVG Serialization to Canvas PNG)
  // ==========================================================================
  
  async function exportComparisonChart() {
    const svgEl = radarChartWrapper.querySelector('svg');
    if (!svgEl) {
      await showCustomDialog({
        title: "❌ EXPORT ERROR",
        message: "No active comparison chart to export! Please select players first.",
        type: 'alert'
      });
      return;
    }

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgEl);

    const svgStyles = `
      <style>
        .radar-svg { background: #0a1a20; }
        .radar-grid { stroke: rgba(166, 238, 240, 0.06); stroke-width: 1px; fill: none; }
        .radar-grid-axis { stroke: rgba(166, 238, 240, 0.12); stroke-width: 1px; }
        .radar-axis-label { font-family: sans-serif; font-size: 9px; font-weight: bold; fill: #36a5a5; text-anchor: middle; }
        .radar-polygon { stroke-width: 2.5px; fill-opacity: 0.15; }
        .radar-point { stroke-width: 2px; fill: #0f3039; }
        .player1-radar { stroke: #4de8e8; fill: #4de8e8; }
        .player1-radar-pt { stroke: #4de8e8; }
        .player2-radar { stroke: #1e9ea6; fill: #1e9ea6; }
        .player2-radar-pt { stroke: #1e9ea6; }
        .player3-radar { stroke: #e83c3c; fill: #e83c3c; }
        .player3-radar-pt { stroke: #e83c3c; }
      </style>
    `;
    
    svgString = svgString.replace(/>/, `>${svgStyles}`);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const canvasSize = 1000;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const gradient = ctx.createRadialGradient(canvasSize/2, canvasSize/2, 20, canvasSize/2, canvasSize/2, canvasSize);
    gradient.addColorStop(0, '#0c2025');
    gradient.addColorStop(1, '#0a1a20');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    ctx.strokeStyle = 'rgba(77, 232, 232, 0.05)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvasSize/2, canvasSize/2, 250, 0, 2*Math.PI);
    ctx.stroke();
    
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      const imgWidth = 720;
      const imgHeight = 720;
      const dx = (canvasSize - imgWidth) / 2;
      const dy = (canvasSize - imgHeight) / 2 - 30;
      ctx.drawImage(img, dx, dy, imgWidth, imgHeight);
      
      ctx.fillStyle = '#e9f4f9';
      ctx.font = "bold 34px sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText("G.O.A.T. SPEC COMPARISON", canvasSize / 2, 80);
      
      ctx.fillStyle = '#a1aeb3';
      ctx.font = "18px sans-serif";
      ctx.fillText("Dynamic Attribute Comparison Arena", canvasSize / 2, 125);
      
      const p1Id = p1Select.value;
      const p2Id = p2Select.value;
      const p3Id = p3Select.value;
      
      const p1Name = window.playersData.find(p => p.id === p1Id)?.name || 'Player 1';
      const p2Name = window.playersData.find(p => p.id === p2Id)?.name || 'Player 2';
      const p3Name = p3Id ? window.playersData.find(p => p.id === p3Id)?.name : null;
      
      ctx.font = "bold 22px sans-serif";
      
      const legendY = canvasSize - 120;
      if (p3Name) {
        ctx.fillStyle = '#46acd3';
        ctx.fillText(`● ${p1Name}`, canvasSize/2 - 250, legendY);
        ctx.fillStyle = '#e9cc80';
        ctx.fillText(`● ${p2Name}`, canvasSize/2, legendY);
        ctx.fillStyle = '#2b6d9d';
        ctx.fillText(`● ${p3Name}`, canvasSize/2 + 250, legendY);
      } else {
        ctx.fillStyle = '#46acd3';
        ctx.fillText(`● ${p1Name}`, canvasSize/2 - 150, legendY);
        ctx.fillStyle = '#e9cc80';
        ctx.fillText(`● ${p2Name}`, canvasSize/2 + 150, legendY);
      }
      
      ctx.fillStyle = '#627278';
      ctx.font = "italic 16px sans-serif";
      ctx.fillText("Generated on Football G.O.A.T. Ranking Engine | vibecodearena.ai", canvasSize / 2, canvasSize - 50);
      
      const pngURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngURL;
      link.download = `goat-comparison-${p1Id}-vs-${p2Id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobURL);
    };
    
    img.src = blobURL;
  }
});

// ==========================================================================
//  LEGENDEX — MEGA FEATURE MODULES
// ==========================================================================


// ========== SOUND TOGGLE ==========
(function() {
  if (typeof SoundFX === 'undefined') return;
  SoundFX.init();
  const soundBtn = document.getElementById('sound-toggle');
  if (!soundBtn) return;
  soundBtn.textContent = SoundFX.isEnabled() ? '🔊' : '🔇';
  soundBtn.addEventListener('click', () => {
    const on = SoundFX.toggle();
    soundBtn.textContent = on ? '🔊' : '🔇';
  });
})();

// ========== ERA FILTER ==========
(function() {
  const eraSelect = document.getElementById('era-filter');
  if (!eraSelect) return;
  eraSelect.addEventListener('change', () => {
    window._eraFilter = eraSelect.value;
    if (typeof window.updateLeaderboard === 'function') window.updateLeaderboard();
  });
  window._eraFilter = 'all';
})();

// ========== AI GOAT VERDICT ==========
window.generateGOATVerdict = function(player, weights) {
  if (!player) return '';
  const statLabels = {
    goals: 'goalscoring', assists: 'playmaking', clubTitles: 'club dominance',
    internationalTitles: 'international glory', ballondOr: 'individual brilliance',
    individualAwards: 'award collection', longevityScore: 'career longevity', peakScore: 'peak performance'
  };
  
  // Find top 2 weighted categories
  const sorted = Object.entries(weights)
    .filter(([k]) => statLabels[k])
    .sort((a, b) => b[1] - a[1]);
  const top1 = statLabels[sorted[0]?.[0]] || 'overall ability';
  const top2 = statLabels[sorted[1]?.[0]] || 'consistency';
  
  const score = Math.round(player.currentScore || 0);
  const templates = [
    `Under the current algorithm, ${player.name} commands the #1 spot with a ${score} OVR rating. The weighting heavily favors ${top1} and ${top2} — categories where ${player.name.split(' ').pop()} has historically excelled. This configuration produces a clear separation from the rest of the field.`,
    `${player.name} leads the LEGENDEX rankings at ${score} OVR. With ${top1} weighted as the primary factor and ${top2} as secondary, ${player.name.split(' ').pop()}'s statistical profile aligns perfectly with this algorithm configuration.`,
    `The algorithm has spoken: ${player.name} reigns supreme at ${score} OVR. The emphasis on ${top1} combined with ${top2} gives ${player.name.split(' ').pop()} a decisive edge. Adjust the weights to challenge this verdict.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

// ========== RADAR CHART ==========
window.renderRadarChart = function(p1, p2) {
  const container = document.getElementById('radar-chart-container');
  const section = document.getElementById('radar-comparison-section');
  if (!container || !section || !p1 || !p2) { if (section) section.style.display = 'none'; return; }
  
  section.style.display = 'block';
  document.getElementById('radar-p1-name').textContent = p1.name;
  document.getElementById('radar-p2-name').textContent = p2.name;
  
  const metrics = ['goals','assists','clubTitles','internationalTitles','ballondOr','individualAwards','longevityScore','peakScore'];
  const labels = ['Goals','Assists','Club','Int\'l','BdOr','Awards','Long.','Peak'];
  const maxVals = { goals: 900, assists: 400, clubTitles: 40, internationalTitles: 6, ballondOr: 8, individualAwards: 60, longevityScore: 100, peakScore: 100 };
  
  const cx = 180, cy = 180, r = 140;
  const n = metrics.length;
  
  function getPoint(idx, val, max) {
    const angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
    const ratio = Math.min(val / max, 1);
    return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) };
  }
  
  // Grid rings
  let gridHtml = '';
  [0.25, 0.5, 0.75, 1].forEach(pct => {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      pts.push(`${cx + r * pct * Math.cos(angle)},${cy + r * pct * Math.sin(angle)}`);
    }
    gridHtml += `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(77,232,232,0.08)" stroke-width="1"/>`;
  });
  
  // Axis lines + labels
  let axisHtml = '';
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
    const ex = cx + r * Math.cos(angle), ey = cy + r * Math.sin(angle);
    const lx = cx + (r + 18) * Math.cos(angle), ly = cy + (r + 18) * Math.sin(angle);
    axisHtml += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="rgba(77,232,232,0.1)" stroke-width="1"/>`;
    axisHtml += `<text x="${lx}" y="${ly}" class="radar-axis-label" text-anchor="middle" dominant-baseline="middle">${labels[i]}</text>`;
  }
  
  // Player polygons
  const p1Pts = metrics.map((m, i) => { const p = getPoint(i, p1.stats[m] || 0, maxVals[m]); return `${p.x},${p.y}`; }).join(' ');
  const p2Pts = metrics.map((m, i) => { const p = getPoint(i, p2.stats[m] || 0, maxVals[m]); return `${p.x},${p.y}`; }).join(' ');
  
  container.innerHTML = `
    <svg class="radar-chart-svg" viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg">
      ${gridHtml}${axisHtml}
      <polygon points="${p1Pts}" class="radar-polygon-p1"/>
      <polygon points="${p2Pts}" class="radar-polygon-p2"/>
    </svg>
  `;
  
  // Animate with GSAP
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(section, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  }
};

// ========== DREAM XI ==========
(function() {
  const pitch = document.getElementById('dreamxi-pitch');
  const roster = document.getElementById('dreamxi-roster');
  const ovrEl = document.getElementById('dreamxi-ovr');
  const clearBtn = document.getElementById('dreamxi-clear-btn');
  if (!pitch || !roster) return;

  // 4-3-3 formation slot positions (% based)
  const formation = [
    { pos: 'GK', top: 88, left: 50 },
    { pos: 'LB', top: 70, left: 15 },
    { pos: 'CB', top: 72, left: 37 },
    { pos: 'CB', top: 72, left: 63 },
    { pos: 'RB', top: 70, left: 85 },
    { pos: 'CM', top: 48, left: 25 },
    { pos: 'CM', top: 44, left: 50 },
    { pos: 'CM', top: 48, left: 75 },
    { pos: 'LW', top: 18, left: 18 },
    { pos: 'ST', top: 10, left: 50 },
    { pos: 'RW', top: 18, left: 82 }
  ];

  let slots = new Array(11).fill(null);
  let activeSlotIdx = null;

  function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  }

  function renderPitch() {
    pitch.innerHTML = '';
    formation.forEach((f, idx) => {
      const slot = document.createElement('div');
      slot.className = 'dreamxi-slot' + (slots[idx] ? ' filled' : '');
      slot.style.top = f.top + '%';
      slot.style.left = f.left + '%';
      slot.style.transform = 'translate(-50%, -50%)';
      
      const circle = document.createElement('div');
      circle.className = 'dreamxi-slot-circle';
      circle.textContent = slots[idx] ? getInitials(slots[idx].name) : f.pos;
      
      const label = document.createElement('div');
      label.className = 'dreamxi-slot-label';
      label.textContent = slots[idx] ? slots[idx].name.split(' ').pop() : f.pos;
      
      slot.appendChild(circle);
      slot.appendChild(label);
      slot.addEventListener('click', () => {
        activeSlotIdx = idx;
        renderRoster();
      });
      pitch.appendChild(slot);

      if (slots[idx] && typeof gsap !== 'undefined') {
        gsap.fromTo(circle, { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(1.7)' });
      }
    });
  }

  function renderRoster() {
    const usedIds = slots.filter(Boolean).map(p => p.id);
    const h4 = roster.querySelector('h4');
    roster.innerHTML = '';
    if (h4) roster.appendChild(h4);
    else { const nh = document.createElement('h4'); nh.textContent = 'Available Legends'; roster.appendChild(nh); }
    
    if (activeSlotIdx !== null) {
      const hint = document.createElement('div');
      hint.style.cssText = 'font-size:0.6rem;color:var(--accent-gold);margin-bottom:8px;font-family:var(--font-sans);';
      hint.textContent = `Select player for ${formation[activeSlotIdx].pos} slot:`;
      roster.appendChild(hint);
    }

    window.playersData.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'dreamxi-pick-btn' + (usedIds.includes(p.id) ? ' used' : '');
      btn.innerHTML = `<span class="dreamxi-pick-initials">${getInitials(p.name)}</span>${p.name}`;
      btn.addEventListener('click', () => {
        if (activeSlotIdx === null) return;
        slots[activeSlotIdx] = p;
        activeSlotIdx = null;
        renderPitch();
        renderRoster();
        updateOVR();
        if (typeof SoundFX !== 'undefined') SoundFX.playCardFlip();
        if (typeof Achievements !== 'undefined') {
          const filled = slots.filter(Boolean).length;
          if (filled === 11) Achievements.unlock('dream_architect');
        }
      });
      roster.appendChild(btn);
    });
  }

  function updateOVR() {
    const filled = slots.filter(Boolean);
    if (filled.length === 0) { ovrEl.textContent = '—'; return; }
    const avg = filled.reduce((sum, p) => sum + (typeof calculateWeightedScore === 'function' ? calculateWeightedScore(p) : 50), 0) / filled.length;
    ovrEl.textContent = Math.round(avg);
  }

  clearBtn?.addEventListener('click', () => {
    slots = new Array(11).fill(null);
    activeSlotIdx = null;
    renderPitch();
    renderRoster();
    updateOVR();
  });

  renderPitch();
  renderRoster();
})();

// ========== TOURNAMENT BRACKET ==========
(function() {
  const generateBtn = document.getElementById('tournament-generate-btn');
  const simulateBtn = document.getElementById('tournament-simulate-btn');
  const bracketGrid = document.getElementById('bracket-grid');
  const championDisplay = document.getElementById('tournament-champion-display');
  if (!generateBtn || !bracketGrid) return;

  let rounds = [];

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function simulateMatch(p1, p2) {
    const s1 = (typeof calculateWeightedScore === 'function' ? calculateWeightedScore(p1) : 50) + (Math.random() * 20 - 10);
    const s2 = (typeof calculateWeightedScore === 'function' ? calculateWeightedScore(p2) : 50) + (Math.random() * 20 - 10);
    return { p1, p2, s1: Math.round(s1), s2: Math.round(s2), winner: s1 >= s2 ? p1 : p2 };
  }

  function renderBracket() {
    bracketGrid.innerHTML = '';
    const roundNames = ['Quarter-Finals', 'Semi-Finals', 'Final'];
    
    rounds.forEach((round, rIdx) => {
      const col = document.createElement('div');
      col.className = 'bracket-round';
      const title = document.createElement('div');
      title.className = 'bracket-round-title';
      title.textContent = roundNames[rIdx] || `Round ${rIdx + 1}`;
      col.appendChild(title);
      
      round.forEach(match => {
        const card = document.createElement('div');
        card.className = 'bracket-match';
        
        [{ player: match.p1, score: match.s1, isWinner: match.winner === match.p1 },
         { player: match.p2, score: match.s2, isWinner: match.winner === match.p2 }].forEach(({ player, score, isWinner }) => {
          const row = document.createElement('div');
          row.className = 'bracket-player' + (match.winner ? (isWinner ? ' winner' : ' loser') : '');
          row.innerHTML = `
            <span>${player ? player.name : 'TBD'}</span>
            <span class="bracket-player-score">${score !== undefined && match.winner ? score : '—'}</span>
          `;
          card.appendChild(row);
        });
        
        col.appendChild(card);
      });
      
      bracketGrid.appendChild(col);
    });
  }

  generateBtn.addEventListener('click', () => {
    const players = shuffle([...window.playersData]);
    // Pad to 8 for a clean bracket
    while (players.length < 8) players.push({ id: 'bye' + players.length, name: 'BYE', stats: {} });
    const qf = [];
    for (let i = 0; i < players.length; i += 2) {
      qf.push({ p1: players[i], p2: players[i + 1], s1: undefined, s2: undefined, winner: null });
    }
    rounds = [qf];
    simulateBtn.disabled = false;
    championDisplay.innerHTML = '';
    renderBracket();
    if (typeof SoundFX !== 'undefined') SoundFX.playWhistle();
  });

  simulateBtn.addEventListener('click', () => {
    function processRound(rIdx) {
      if (rIdx >= rounds.length) return;
      const round = rounds[rIdx];
      const winners = [];
      
      round.forEach(match => {
        if (match.p1.id.startsWith('bye')) { match.winner = match.p2; match.s1 = 0; match.s2 = 1; }
        else if (match.p2.id.startsWith('bye')) { match.winner = match.p1; match.s1 = 1; match.s2 = 0; }
        else {
          const result = simulateMatch(match.p1, match.p2);
          match.s1 = result.s1; match.s2 = result.s2; match.winner = result.winner;
        }
        winners.push(match.winner);
        if (typeof SoundFX !== 'undefined') SoundFX.playCrowdRoar();
      });
      
      renderBracket();
      
      if (winners.length > 1) {
        const nextRound = [];
        for (let i = 0; i < winners.length; i += 2) {
          nextRound.push({ p1: winners[i], p2: winners[i + 1] || winners[i], s1: undefined, s2: undefined, winner: null });
        }
        rounds.push(nextRound);
        setTimeout(() => processRound(rIdx + 1), 800);
      } else if (winners.length === 1) {
        // CHAMPION
        setTimeout(() => {
          championDisplay.innerHTML = `
            <div class="tournament-champion">
              <div class="champion-crown">👑</div>
              <div class="champion-name">${winners[0].name}</div>
              <div class="champion-title">LEGENDEX Tournament Champion</div>
            </div>
          `;
          if (typeof gsap !== 'undefined') {
            gsap.fromTo('.tournament-champion', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' });
          }
          if (typeof SoundFX !== 'undefined') SoundFX.playVictoryFanfare();
          if (typeof Achievements !== 'undefined') Achievements.unlock('bracket_champion');
        }, 500);
        simulateBtn.disabled = true;
      }
    }
    processRound(0);
  });
})();

// ========== ACHIEVEMENT BADGES ==========
const Achievements = (() => {
  const badges = {
    first_glance:    { icon: '👁️', title: 'First Glance', desc: 'Opened LEGENDEX for the first time' },
    slider_master:   { icon: '🎚️', title: 'Slider Master', desc: 'Moved all 8 weight sliders' },
    comparator:      { icon: '⚔️', title: 'Comparator', desc: 'Compared 2 players head-to-head' },
    bracket_champion:{ icon: '🏆', title: 'Bracket Champion', desc: 'Completed a tournament simulation' },
    dream_architect: { icon: '⚽', title: 'Dream Architect', desc: 'Filled all 11 Dream XI slots' },
    data_analyst:    { icon: '📊', title: 'Data Analyst', desc: 'Visited the Data Center tab' },
    algorithm_dj:    { icon: '🎛️', title: 'Algorithm DJ', desc: 'Used 3+ different presets' },
    search_scout:    { icon: '🔍', title: 'Search Scout', desc: 'Used the search bar to find a legend' }
  };

  let unlocked = JSON.parse(localStorage.getItem('legendex-achievements') || '[]');
  const toastEl = document.getElementById('achievement-toast');
  let toastTimeout = null;

  function renderGallery() {
    const galleryEl = document.getElementById('achievement-gallery');
    if (!galleryEl) return;
    galleryEl.innerHTML = '';
    
    Object.entries(badges).forEach(([key, badge]) => {
      const isCardUnlocked = unlocked.includes(key);
      const card = document.createElement('div');
      card.className = `achievement-badge-card ${isCardUnlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <span class="badge-icon">${isCardUnlocked ? badge.icon : '🔒'}</span>
        <div class="badge-info">
          <span class="badge-name">${badge.title}</span>
          <span class="badge-desc">${isCardUnlocked ? badge.desc : 'Unlocked via interaction'}</span>
        </div>
      `;
      galleryEl.appendChild(card);
    });
  }

  function unlock(key) {
    if (unlocked.includes(key) || !badges[key]) return;
    unlocked.push(key);
    localStorage.setItem('legendex-achievements', JSON.stringify(unlocked));
    showToast(badges[key]);
    if (typeof SoundFX !== 'undefined') SoundFX.playAchievement();
    renderGallery();
  }

  function showToast(badge) {
    if (!toastEl) return;
    document.getElementById('achievement-toast-icon').textContent = badge.icon;
    document.getElementById('achievement-toast-title').textContent = badge.title;
    document.getElementById('achievement-toast-desc').textContent = badge.desc;
    toastEl.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 3500);
  }

  function isUnlocked(key) { return unlocked.includes(key); }

  // Auto-unlock first_glance
  setTimeout(() => {
    unlock('first_glance');
    renderGallery();
  }, 2000);

  return { unlock, isUnlocked, badges, getUnlocked: () => [...unlocked], renderGallery };
})();

// ==========================================================================
//  LEGENDEX — FULLSCREEN INTERACTIVE PARTICLE CANVAS BACKGROUND
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  const particleCount = 65;
  const connectionDistance = 120;
  let mouse = { x: null, y: null, active: false };

  // Set sizing
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Particle Class
  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : (Math.random() > 0.5 ? -10 : canvas.height + 10);
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.45 + 0.15;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse interactive push/pull
      if (mouse.active && mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }

      // Out of bounds reset
      if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(77, 232, 232, ${this.alpha})`;
      ctx.fill();
    }
  }

  // Initialize
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Tracking Mouse position globally
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Render loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines first
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < connectionDistance) {
          const alpha = (1 - (dist / connectionDistance)) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(77, 232, 232, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  // ========== USER GUIDE MODAL TRIGGERS ==========
  (function() {
    const guideToggle = document.getElementById('guide-toggle');
    const guideModal = document.getElementById('guide-modal');
    const closeGuideModal = document.getElementById('close-guide-modal');

    if (!guideToggle || !guideModal) return;

    function openModal() {
      if (typeof SoundFX !== 'undefined' && SoundFX.isEnabled()) {
        SoundFX.play('click');
      }
      guideModal.style.display = 'flex';
      
      gsap.killTweensOf([guideModal, guideModal.querySelector('.modal-content')]);
      gsap.fromTo(guideModal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(guideModal.querySelector('.modal-content'), 
        { scale: 0.9, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }

    function closeModal() {
      if (typeof SoundFX !== 'undefined' && SoundFX.isEnabled()) {
        SoundFX.play('click');
      }
      gsap.to(guideModal, { opacity: 0, duration: 0.2 });
      gsap.to(guideModal.querySelector('.modal-content'), {
        scale: 0.9,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          guideModal.style.display = 'none';
        }
      });
    }

    guideToggle.addEventListener('click', openModal);
    if (closeGuideModal) closeGuideModal.addEventListener('click', closeModal);
    guideModal.addEventListener('click', (e) => {
      if (e.target === guideModal) closeModal();
    });
  })();

  animate();
});
