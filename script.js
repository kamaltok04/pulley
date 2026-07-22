/* ==========================================================================
   PULLEY PROTOCOL - INTERACTIVE SCRIPT (JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
   * 1. DYNAMIC CANVAS BACKGROUND (FLOATING ORBS & AMBIENT PARTICLES)
   * ------------------------------------------------------------------------ */
  const canvas = document.getElementById('bgCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const numParticles = Math.min(Math.floor(width / 25), 45);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 3 + 1;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.glow = Math.random() > 0.7;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (this.glow) {
          ctx.fillStyle = '#a3ff12';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#a3ff12';
          ctx.globalAlpha = this.alpha * 0.8;
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.globalAlpha = this.alpha * 0.3;
        }

        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    // Connect close particles with subtle lines
    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = '#a3ff12';
            ctx.globalAlpha = (1 - dist / 120) * 0.08;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connectParticles();
      requestAnimationFrame(animate);
    }

    animate();
  }


  /* ------------------------------------------------------------------------
   * 2. NAVBAR SCROLL EFFECT & MOBILE MENU TOGGLE
   * ------------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.className = 'ri-close-line';
      } else {
        icon.className = 'ri-menu-4-line';
      }
    });

    // Close menu when clicking link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        if (mobileToggle.querySelector('i')) {
          mobileToggle.querySelector('i').className = 'ri-menu-4-line';
        }
      });
    });
  }


  /* ------------------------------------------------------------------------
   * 3. SCROLL-TRIGGERED ANIMATED STATS COUNTER
   * ------------------------------------------------------------------------ */
  const statValues = document.querySelectorAll('.stat-value[data-target]');
  let counted = false;

  function countUp(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const decimals = parseInt(el.getAttribute('data-decimals') || '0');
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000; // ms
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = (easeProgress * target).toFixed(decimals);

      el.textContent = currentVal + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    }

    requestAnimationFrame(updateCount);
  }

  const observerOptions = {
    threshold: 0.5
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        statValues.forEach(el => countUp(el));
      }
    });
  }, observerOptions);

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    statsObserver.observe(heroSection);
  }


  /* ------------------------------------------------------------------------
   * 4. 3D TILT EFFECT FOR CARDS & BUTTONS
   * ------------------------------------------------------------------------ */
  const tiltElements = document.querySelectorAll('[data-tilt]');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10; // max deg 10
      const rotateY = ((x - centerX) / centerX) * 10;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });


  /* ------------------------------------------------------------------------
   * 5. LIVE INTERACTIVE AI AGENT SIMULATOR
   * ------------------------------------------------------------------------ */
  const presetButtons = document.querySelectorAll('.preset-btn');
  const runSimBtn = document.getElementById('runSimBtn');
  const simOutput = document.getElementById('simOutput');
  const speedSlider = document.getElementById('speedSlider');
  const speedValLabel = document.getElementById('speedVal');

  const metricImpressions = document.getElementById('metricImpressions');
  const metricEngagement = document.getElementById('metricEngagement');
  const metricConversions = document.getElementById('metricConversions');
  const metricStatus = document.getElementById('metricStatus');

  let selectedPreset = 'nft';
  let isSimRunning = false;
  let simInterval = null;

  // Preset scenarios database
  const simulationScenarios = {
    nft: {
      name: "NFT Launch Hype Strategy",
      logs: [
        { type: 'info', text: '[AI AGENT] Autonomous sentiment scanner active across 45 Web3 communities...' },
        { type: 'prompt', text: '> Target audience identified: 142k NFT collectors & Robinhood Chain active wallets.' },
        { type: 'action', text: '[GEN AI] Generating high-converting visual teasers & smart-contract thread hooks...' },
        { type: 'success', text: '[DISPATCH] Broadcasted campaign batch #01 to Twitter/X, Discord, & Telegram.' },
        { type: 'action', text: '[OPTIMIZER] Reinforcement Learning model adjusted posting cadence for peak EU/US timezone overlap.' },
        { type: 'info', text: '[ON-CHAIN] Quest contract verified: 1,840 whitelist actions logged.' },
        { type: 'success', text: '>>> CAMPAIGN MILESTONE: Top 3 trending Web3 topic achieved in 18 minutes!' }
      ],
      impressions: 48500,
      engagement: 14.2,
      conversions: 1240
    },
    token: {
      name: "Token Liquidity & Hype Push",
      logs: [
        { type: 'info', text: '[AI AGENT] Fetching live DEX volume analytics & liquidity pair health on Robinhood Chain...' },
        { type: 'prompt', text: '> Market sentiment detected: Bullish consolidation. Triggering momentum campaign.' },
        { type: 'action', text: '[CONTENT GEN] Drafting technical analysis snippets & yield opportunity highlights...' },
        { type: 'success', text: '[AUTO-ENGAGE] Dispatched automated responses to top 80 DeFi opinion leaders.' },
        { type: 'action', text: '[BUDGET MANAGER] Dynamically allocated +450 $PULLEY for priority gas relay.' },
        { type: 'info', text: '[ON-CHAIN] Verified 320 liquidity pool deposit actions.' },
        { type: 'success', text: '>>> CAMPAIGN MILESTONE: +28.4% liquidity inflow simulated successfully.' }
      ],
      impressions: 92400,
      engagement: 18.6,
      conversions: 3890
    },
    dapp: {
      name: "dApp User Acquisition Campaign",
      logs: [
        { type: 'info', text: '[AI AGENT] Scanning competitive dApps for active user address clusters...' },
        { type: 'prompt', text: '> Targeted segment: Active DeFi traders with >5 monthly txs.' },
        { type: 'action', text: '[ENGAGEMENT AI] Deploying personalized referral invitations & gas-rebate quest cards...' },
        { type: 'success', text: '[DISTRIBUTION] Published interactive quest modules on Galxe & QuestN.' },
        { type: 'action', text: '[ANALYTICS] Tracking real-time smart contract interaction events.' },
        { type: 'info', text: '[ON-CHAIN] 2,150 unique wallet signatures verified.' },
        { type: 'success', text: '>>> CAMPAIGN MILESTONE: Cost per acquisition reduced by 64% vs standard ads.' }
      ],
      impressions: 64100,
      engagement: 11.8,
      conversions: 2150
    }
  };

  // Handle Preset selection
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPreset = btn.getAttribute('data-preset');
    });
  });

  // Handle speed slider change
  if (speedSlider) {
    const speedMap = {
      '1': 'Low (4.0s)',
      '2': 'Medium (3.2s)',
      '3': 'Balanced (2.8s)',
      '4': 'High (2.0s)',
      '5': 'Hyper (1.2s)'
    };
    speedSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      speedValLabel.textContent = speedMap[val] || 'High';
    });
  }

  // Run Simulation Logic
  if (runSimBtn && simOutput) {
    runSimBtn.addEventListener('click', () => {
      if (isSimRunning) return;

      isSimRunning = true;
      runSimBtn.disabled = true;
      runSimBtn.innerHTML = '<i class="ri-loader-4-line spin"></i> AGENT OPERATING...';

      // Clear previous logs
      simOutput.innerHTML = '';
      metricStatus.textContent = 'EXECUTING';
      metricStatus.className = 'metric-val text-yellow';

      const scenario = simulationScenarios[selectedPreset];
      const speedVal = speedSlider ? parseInt(speedSlider.value) : 4;
      const delay = Math.max(800, 3600 - (speedVal * 600));

      let step = 0;
      let currImpressions = 0;
      let currEngagement = 0;
      let currConversions = 0;

      const addLog = (logObj) => {
        const line = document.createElement('div');
        line.className = `log-line ${logObj.type}`;
        line.textContent = logObj.text;
        simOutput.appendChild(line);
        simOutput.scrollTop = simOutput.scrollHeight;
      };

      // Initial header
      addLog({ type: 'system', text: `=== INITIALIZING CAMPAIGN: ${scenario.name.toUpperCase()} ===` });

      simInterval = setInterval(() => {
        if (step < scenario.logs.length) {
          addLog(scenario.logs[step]);

          // Update metrics incrementally
          const stepRatio = (step + 1) / scenario.logs.length;
          currImpressions = Math.floor(scenario.impressions * stepRatio);
          currEngagement = (scenario.engagement * stepRatio).toFixed(1);
          currConversions = Math.floor(scenario.conversions * stepRatio);

          metricImpressions.textContent = currImpressions.toLocaleString();
          metricEngagement.textContent = `${currEngagement}%`;
          metricConversions.textContent = currConversions.toLocaleString();

          step++;
        } else {
          // Simulation complete
          clearInterval(simInterval);
          addLog({ type: 'system', text: '[COMPLETE] Autonomous marketing agent batch successfully executed & verified on Robinhood Chain.' });
          
          metricStatus.textContent = 'VERIFIED';
          metricStatus.className = 'metric-val text-green';

          isSimRunning = false;
          runSimBtn.disabled = false;
          runSimBtn.innerHTML = '<i class="ri-play-circle-line"></i> RUN AGENT SIMULATION';
          
          showToast(`Simulation Complete: ${scenario.name}`);
        }
      }, delay);
    });
  }


  /* ------------------------------------------------------------------------
   * 6. DEPLOY AI AGENT MODAL & TOAST NOTIFICATION
   * ------------------------------------------------------------------------ */
  const agentModal = document.getElementById('agentModal');
  const openModalBtns = document.querySelectorAll('.open-modal-trigger, #openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const deployForm = document.getElementById('deployForm');

  const openModal = () => {
    if (agentModal) agentModal.classList.add('active');
  };

  const closeModal = () => {
    if (agentModal) agentModal.classList.remove('active');
  };

  openModalBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

  if (agentModal) {
    agentModal.addEventListener('click', (e) => {
      if (e.target === agentModal) closeModal();
    });
  }

  if (deployForm) {
    deployForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const agentName = document.getElementById('agentName').value;
      const budget = document.getElementById('agentBudget').value;

      closeModal();
      showToast(`Agent "${agentName}" successfully deployed with ${budget} $PULLEY budget!`);
    });
  }

  // Toast Function
  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="ri-checkbox-circle-fill text-green" style="font-size: 1.3rem;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

});
