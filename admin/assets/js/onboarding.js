/* ==========================================================================
   Eusta Admin Onboarding & Software Tour Module (Production)
   ========================================================================== */

(function () {
  // Inject CSS Styles
  const style = document.createElement('style');
  style.id = 'eusta-onboarding-styles';
  style.textContent = `
    .onboarding-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(12, 13, 18, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .onboarding-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .onboarding-card {
      background: #ffffff;
      border: 1px solid rgba(177, 139, 94, 0.25);
      border-top: 4px solid #B18B5E;
      border-radius: 20px;
      width: 100%;
      max-width: 620px;
      padding: 36px 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(177, 139, 94, 0.1);
      position: relative;
      transform: translateY(20px) scale(0.97);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .onboarding-overlay.active .onboarding-card {
      transform: translateY(0) scale(1);
    }

    .onboarding-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .onboarding-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #F7F3EE;
      border: 1px solid rgba(177, 139, 94, 0.25);
      border-radius: 50px;
      padding: 5px 14px;
      font-size: 11px;
      font-weight: 700;
      color: #99754C;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .onboarding-skip-top {
      background: transparent;
      border: none;
      color: #6B7280;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.2s ease;
    }

    .onboarding-skip-top:hover {
      color: #111827;
    }

    .onboarding-progress-dots {
      display: flex;
      gap: 6px;
      margin-bottom: 20px;
    }

    .onboarding-dot {
      height: 4px;
      flex: 1;
      background: #E5E7EB;
      border-radius: 4px;
      transition: background 0.3s ease;
    }

    .onboarding-dot.active {
      background: #B18B5E;
    }

    .onboarding-step-content {
      display: none;
    }

    .onboarding-step-content.active {
      display: block;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .onboarding-title {
      font-size: 24px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 8px;
      letter-spacing: -0.4px;
    }

    .onboarding-sub {
      font-size: 14px;
      color: #6B7280;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    /* Grid Options for Step 1 */
    .niche-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 20px;
      max-height: 180px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .niche-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      background: #ffffff;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      transition: all 0.2s ease;
    }

    .niche-option:hover, .niche-option.selected {
      border-color: #B18B5E;
      background: #F9F6F0;
      color: #99754C;
    }

    .niche-option input[type="radio"] {
      accent-color: #B18B5E;
    }

    /* Tour Cards for Step 2 */
    .tour-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }

    .tour-card {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 16px;
      transition: all 0.2s ease;
    }

    .tour-card:hover {
      border-color: rgba(177, 139, 94, 0.4);
      background: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .tour-card-icon {
      width: 36px;
      height: 36px;
      background: #F7F3EE;
      color: #B18B5E;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }

    .tour-card-title {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 4px;
    }

    .tour-card-desc {
      font-size: 12px;
      color: #6B7280;
      line-height: 1.5;
    }

    /* Quick Action Cards for Step 3 */
    .action-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 24px;
    }

    .action-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      background: #F9F6F0;
      border: 1px solid rgba(177, 139, 94, 0.3);
      border-radius: 12px;
      text-decoration: none;
      color: #111827;
      transition: all 0.2s ease;
    }

    .action-card:hover {
      background: #B18B5E;
      color: #ffffff;
      transform: translateX(4px);
    }

    .action-card:hover .action-icon {
      color: #ffffff;
    }

    .action-card-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .action-icon {
      color: #B18B5E;
      font-size: 20px;
      display: flex;
      align-items: center;
    }

    .action-title {
      font-size: 14px;
      font-weight: 700;
    }

    /* Footer Controls & Checkbox */
    .onboarding-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid #F3F4F6;
    }

    .dont-ask-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: #6B7280;
      cursor: pointer;
      user-select: none;
    }

    .dont-ask-label input[type="checkbox"] {
      accent-color: #B18B5E;
      width: 15px;
      height: 15px;
      cursor: pointer;
    }

    .btn-ob-secondary {
      background: transparent;
      border: 1px solid #D1D5DB;
      color: #4B5563;
      padding: 9px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-ob-secondary:hover {
      background: #F3F4F6;
      color: #111827;
    }

    .btn-ob-primary {
      background: #B18B5E;
      color: #ffffff;
      border: none;
      padding: 9px 20px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(177, 139, 94, 0.25);
      transition: all 0.2s ease;
    }

    .btn-ob-primary:hover {
      background: #99754C;
      box-shadow: 0 6px 16px rgba(177, 139, 94, 0.35);
    }

    /* Floating FAB Pill for Skipped Tour */
    .onboarding-fab-pill {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid rgba(177, 139, 94, 0.3);
      border-radius: 50px;
      padding: 4px 6px 4px 14px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(177, 139, 94, 0.15);
      transition: all 0.3s ease;
    }

    .onboarding-fab-pill:hover {
      border-color: #B18B5E;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16);
    }

    .onboarding-fab-pill .fab-btn {
      background: none;
      border: none;
      color: #99754C;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px 4px 0;
      font-family: inherit;
    }

    .onboarding-fab-pill .fab-close-btn {
      background: #F3F4F6;
      border: none;
      color: #9CA3AF;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .onboarding-fab-pill .fab-close-btn:hover {
      background: #E5E7EB;
      color: #374151;
    }
  `;
  document.head.appendChild(style);

  // Inject Modal Markup
  const modalHTML = `
    <div class="onboarding-overlay" id="eustaOnboardingOverlay">
      <div class="onboarding-card">

        <!-- Top Header -->
        <div class="onboarding-header">
          <div class="onboarding-badge">
            <span class="material-symbols-outlined" style="font-size: 14px;">explore</span>
            <span>Quick Start & Tour</span>
          </div>
          <button type="button" class="onboarding-skip-top" id="obSkipTopBtn">
            <span>Skip Tour</span>
            <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
          </button>
        </div>

        <!-- Progress Dots -->
        <div class="onboarding-progress-dots">
          <div class="onboarding-dot active" id="dotStep1"></div>
          <div class="onboarding-dot" id="dotStep2"></div>
          <div class="onboarding-dot" id="dotStep3"></div>
        </div>

        <!-- STEP 1: Store Setup -->
        <div class="onboarding-step-content active" id="obStep1">
          <h2 class="onboarding-title">Welcome to Eusta! Let's set up your store</h2>
          <p class="onboarding-sub">Configure your business niche so Eusta tailors your category preset icons, product structure, and customer enquiry options.</p>

          <div class="form-group mb-3">
            <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:6px;">Store / Business Name</label>
            <input type="text" id="obStoreName" class="ea-input" placeholder="e.g. Eusta Lifestyle & Living" value="Eusta Store">
          </div>

          <div class="form-group mb-3">
            <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:6px;">Select Your Store Niche / Sector</label>
            <div class="niche-grid">
              <label class="niche-option selected">
                <input type="radio" name="obNiche" value="home" checked>
                <span style="display:inline-flex; align-items:center; gap:6px;"><span class="material-symbols-outlined" style="font-size:18px;">chair</span> Home & Furniture</span>
              </label>
              <label class="niche-option">
                <input type="radio" name="obNiche" value="fashion">
                <span style="display:inline-flex; align-items:center; gap:6px;"><span class="material-symbols-outlined" style="font-size:18px;">checkroom</span> Fashion & Apparel</span>
              </label>
              <label class="niche-option">
                <input type="radio" name="obNiche" value="tech">
                <span style="display:inline-flex; align-items:center; gap:6px;"><span class="material-symbols-outlined" style="font-size:18px;">smartphone</span> Electronics & Tech</span>
              </label>
              <label class="niche-option">
                <input type="radio" name="obNiche" value="garden">
                <span style="display:inline-flex; align-items:center; gap:6px;"><span class="material-symbols-outlined" style="font-size:18px;">potted_plant</span> Gardening & Plants</span>
              </label>
              <label class="niche-option">
                <input type="radio" name="obNiche" value="beauty">
                <span style="display:inline-flex; align-items:center; gap:6px;"><span class="material-symbols-outlined" style="font-size:18px;">auto_fix_high</span> Beauty & Cosmetics</span>
              </label>
              <label class="niche-option">
                <input type="radio" name="obNiche" value="grocery">
                <span style="display:inline-flex; align-items:center; gap:6px;"><span class="material-symbols-outlined" style="font-size:18px;">restaurant</span> Grocery & Food</span>
              </label>
              <label class="niche-option">
                <input type="radio" name="obNiche" value="sports">
                <span style="display:inline-flex; align-items:center; gap:6px;"><span class="material-symbols-outlined" style="font-size:18px;">fitness_center</span> Sports & Fitness</span>
              </label>
              <label class="niche-option">
                <input type="radio" name="obNiche" value="other">
                <span style="display:inline-flex; align-items:center; gap:6px;"><span class="material-symbols-outlined" style="font-size:18px;">inventory_2</span> General Retail</span>
              </label>
            </div>
          </div>
        </div>

        <!-- STEP 2: Software Feature Tour -->
        <div class="onboarding-step-content" id="obStep2">
          <h2 class="onboarding-title">A 1-Minute Dashboard Tour</h2>
          <p class="onboarding-sub">Here are the main tools you'll use to manage your store and grow your sales:</p>

          <div class="tour-grid">
            <div class="tour-card">
              <div class="tour-card-icon">
                <span class="material-symbols-outlined">inventory_2</span>
              </div>
              <div class="tour-card-title">Products Management</div>
              <div class="tour-card-desc">Add products with prices, SKU, stock, and photos. Generates instant WhatsApp order buttons!</div>
            </div>

            <div class="tour-card">
              <div class="tour-card-icon">
                <span class="material-symbols-outlined">category</span>
              </div>
              <div class="tour-card-title">Multi-Sector Categories</div>
              <div class="tour-card-desc">Choose from 40+ preset category icons across all industries or upload your custom logo.</div>
            </div>

            <div class="tour-card">
              <div class="tour-card-icon">
                <span class="material-symbols-outlined">forum</span>
              </div>
              <div class="tour-card-title">Customer Enquiries</div>
              <div class="tour-card-desc">Receive and reply to customer inquiries, quote requests, and lead forms in real-time.</div>
            </div>

            <div class="tour-card">
              <div class="tour-card-icon">
                <span class="material-symbols-outlined">settings</span>
              </div>
              <div class="tour-card-title">Storefront Settings</div>
              <div class="tour-card-desc">Configure business phone, WhatsApp number, email, and live storefront branding seamlessly.</div>
            </div>
          </div>
        </div>

        <!-- STEP 3: Quick Start Actions -->
        <div class="onboarding-step-content" id="obStep3">
          <h2 class="onboarding-title">You're All Set!</h2>
          <p class="onboarding-sub">Your store is configured and ready to receive customers. Choose your next step:</p>

          <div class="action-grid">
            <a href="products.html" class="action-card" onclick="window.closeEustaOnboarding(true)">
              <div class="action-card-left">
                <span class="material-symbols-outlined action-icon">add_box</span>
                <div>
                  <div class="action-title">Add Your First Product</div>
                  <small style="font-size:11px; opacity:0.8;">Create catalog items with pricing and stock</small>
                </div>
              </div>
              <span class="material-symbols-outlined" style="font-size:18px;">chevron_right</span>
            </a>

            <a href="categories.html" class="action-card" onclick="window.closeEustaOnboarding(true)">
              <div class="action-card-left">
                <span class="material-symbols-outlined action-icon">category</span>
                <div>
                  <div class="action-title">Configure Categories & Icons</div>
                  <small style="font-size:11px; opacity:0.8;">Select preset icons or upload brand logos</small>
                </div>
              </div>
              <span class="material-symbols-outlined" style="font-size:18px;">chevron_right</span>
            </a>

            <a href="../user/index.html" target="_blank" class="action-card" onclick="window.closeEustaOnboarding(true)">
              <div class="action-card-left">
                <span class="material-symbols-outlined action-icon">open_in_new</span>
                <div>
                  <div class="action-title">Preview Live Storefront</div>
                  <small style="font-size:11px; opacity:0.8;">See what your customers experience</small>
                </div>
              </div>
              <span class="material-symbols-outlined" style="font-size:18px;">chevron_right</span>
            </a>
          </div>
        </div>

        <!-- Footer Navigation Controls & Don't Show Checkbox -->
        <div class="onboarding-footer">
          <label class="dont-ask-label">
            <input type="checkbox" id="obDontShowCheck">
            <span>Don't show again</span>
          </label>

          <div style="display:flex; gap:10px; align-items:center;">
            <button type="button" class="btn-ob-secondary" id="obPrevBtn" style="visibility: hidden;">← Back</button>
            <button type="button" class="btn-ob-secondary" id="obSkipBottomBtn">Skip for now</button>
            <button type="button" class="btn-ob-primary" id="obNextBtn">
              <span>Next</span>
              <span class="material-symbols-outlined" style="font-size: 16px;">arrow_forward</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // JS Logic
  let currentStep = 1;
  const overlay = document.getElementById('eustaOnboardingOverlay');
  const dot1 = document.getElementById('dotStep1');
  const dot2 = document.getElementById('dotStep2');
  const dot3 = document.getElementById('dotStep3');

  const step1 = document.getElementById('obStep1');
  const step2 = document.getElementById('obStep2');
  const step3 = document.getElementById('obStep3');

  const prevBtn = document.getElementById('obPrevBtn');
  const nextBtn = document.getElementById('obNextBtn');
  const skipTopBtn = document.getElementById('obSkipTopBtn');
  const skipBottomBtn = document.getElementById('obSkipBottomBtn');
  const dontShowCheck = document.getElementById('obDontShowCheck');

  // Highlight niche options
  document.querySelectorAll('.niche-option').forEach(opt => {
    opt.addEventListener('click', function() {
      document.querySelectorAll('.niche-option').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
      const radio = this.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  function updateStepView() {
    [dot1, dot2, dot3].forEach((d, i) => d.classList.toggle('active', i < currentStep));
    [step1, step2, step3].forEach((s, i) => s.classList.toggle('active', i === currentStep - 1));

    prevBtn.style.visibility = currentStep > 1 ? 'visible' : 'hidden';

    if (currentStep === 3) {
      nextBtn.innerHTML = '<span>Explore Dashboard</span><span class="material-symbols-outlined" style="font-size:16px;">check</span>';
    } else {
      nextBtn.innerHTML = '<span>Next Step</span><span class="material-symbols-outlined" style="font-size:16px;">arrow_forward</span>';
    }
  }

  window.openEustaOnboarding = function() {
    currentStep = 1;
    updateStepView();
    overlay.classList.add('active');
    // Hide FAB while modal is active
    const fab = document.getElementById('obFabPill');
    if (fab) fab.style.display = 'none';
  };

  window.closeEustaOnboarding = function(forceDontShow = false) {
    overlay.classList.remove('active');

    if (forceDontShow || (dontShowCheck && dontShowCheck.checked)) {
      localStorage.setItem('eustaDontShowOnboarding', 'true');
      localStorage.setItem('eustaOnboardingDone', 'true');
      window.dismissEustaFab();
    } else {
      // User skipped without checking "Don't show again"
      localStorage.setItem('eustaOnboardingDone', 'true');
      renderFloatingFab();
    }
  };

  window.dismissEustaFab = function() {
    const fab = document.getElementById('obFabPill');
    if (fab) fab.remove();
    localStorage.setItem('eustaDontShowOnboarding', 'true');
  };

  function renderFloatingFab() {
    if (localStorage.getItem('eustaDontShowOnboarding') === 'true') return;
    if (document.getElementById('obFabPill')) {
      document.getElementById('obFabPill').style.display = 'flex';
      return;
    }

    const fabHTML = `
      <div class="onboarding-fab-pill" id="obFabPill">
        <button type="button" class="fab-btn" onclick="window.openEustaOnboarding()">
          <span class="material-symbols-outlined" style="font-size:18px;">explore</span>
          <span>Tour & Setup</span>
        </button>
        <button type="button" class="fab-close-btn" title="Don't show again" onclick="window.dismissEustaFab()">
          <span class="material-symbols-outlined" style="font-size:14px;">close</span>
        </button>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', fabHTML);
  }

  skipTopBtn.addEventListener('click', () => window.closeEustaOnboarding());
  skipBottomBtn.addEventListener('click', () => window.closeEustaOnboarding());

  prevBtn.addEventListener('click', function() {
    if (currentStep > 1) {
      currentStep--;
      updateStepView();
    }
  });

  nextBtn.addEventListener('click', async function() {
    if (currentStep === 1) {
      // Save initial store setup
      const businessName = document.getElementById('obStoreName').value.trim();
      const selectedNicheRadio = document.querySelector('input[name="obNiche"]:checked');
      const niche = selectedNicheRadio ? selectedNicheRadio.value : 'home';

      if (businessName) {
        try {
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessName, niche })
          });
        } catch(err) {
          console.error(err);
        }
      }
    }

    if (currentStep < 3) {
      currentStep++;
      updateStepView();
    } else {
      window.closeEustaOnboarding(true);
    }
  });

  // Auto-launch check on load
  document.addEventListener('DOMContentLoaded', function() {
    const dontShow = localStorage.getItem('eustaDontShowOnboarding') === 'true';
    if (!dontShow) {
      setTimeout(window.openEustaOnboarding, 600);
    }
  });

})();
