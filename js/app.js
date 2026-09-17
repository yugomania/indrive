/**
 * inDrive Driver Questionnaire & Earnings Calculator
 * Application State & UI Controller
 */

(function () {
  'use strict';

  // State
  const state = {
    currentStep: 0,
    totalSteps: 5,
    cityKey: 'lagos',
    workCommitment: 'fulltime',
    vehicleType: 'sedan',
    tripsPerDay: 12,
    hoursPerDay: 8,
    daysPerWeek: 5,
    drivePeakHours: true,
    licenseStatus: 'valid',
    driverName: '',
    driverPhone: '',
    referralCode: getActiveReferralCode(),
    customTargetUrl: localStorage.getItem('indrive_custom_target_url') || '',
    accessKey: getFormAccessKey(),
    notificationEmail: getNotificationEmail() || 'ugoodagu@gmail.com'
  };

  const calculator = new EarningsCalculator(CONFIG);

  // DOM Elements
  const wizardCards = [
    document.getElementById('step-0'),
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-4'),
    document.getElementById('step-5'),
    document.getElementById('step-6')
  ];

  const progressWrap = document.getElementById('progressWrap');
  const progressBarFill = document.getElementById('progressBarFill');
  const stepCounterText = document.getElementById('stepCounterText');
  const stepCategoryText = document.getElementById('stepCategoryText');
  const headerCityTag = document.getElementById('headerCityTag');
  const activeCityLabel = document.getElementById('activeCityLabel');
  const headerBackBtn = document.getElementById('headerBackBtn');
  const brandResetBtn = document.getElementById('brandResetBtn');

  const citySelect = document.getElementById('citySelect');
  const startWizardBtn = document.getElementById('startWizardBtn');
  const tripsPerDayInput = document.getElementById('tripsPerDayInput');
  const tripsPerDayDisplay = document.getElementById('tripsPerDayDisplay');
  const hoursPerDayInput = document.getElementById('hoursPerDayInput');
  const hoursPerDayDisplay = document.getElementById('hoursPerDayDisplay');
  const daysPerWeekInput = document.getElementById('daysPerWeekInput');
  const daysPerWeekDisplay = document.getElementById('daysPerWeekDisplay');
  const peakHoursCheckbox = document.getElementById('peakHoursCheckbox');
  const peakHoursToggleCard = document.getElementById('peakHoursToggleCard');

  // Result displays
  const netDailyEarningsDisplay = document.getElementById('netDailyEarningsDisplay');
  const dailyTripsSubText = document.getElementById('dailyTripsSubText');
  const weeklyTripsSubText = document.getElementById('weeklyTripsSubText');
  const monthlyTripsSubText = document.getElementById('monthlyTripsSubText');
  const netMonthlyEarningsDisplay = document.getElementById('netMonthlyEarningsDisplay');
  const netWeeklyEarningsDisplay = document.getElementById('netWeeklyEarningsDisplay');
  const grossMonthlyEarningsDisplay = document.getElementById('grossMonthlyEarningsDisplay');
  const summaryHoursTag = document.getElementById('summaryHoursTag');
  const summaryCityTag = document.getElementById('summaryCityTag');
  const extraKeptBadge = document.getElementById('extraKeptBadge');
  const savingsCalloutAmount = document.getElementById('savingsCalloutAmount');
  const finalMonthlyAmountTag = document.getElementById('finalMonthlyAmountTag');
  const monthlyFuelLitersTag = document.getElementById('monthlyFuelLitersTag');
  const monthlyFuelCostDisplay = document.getElementById('monthlyFuelCostDisplay');
  const monthlyMaintenanceDisplay = document.getElementById('monthlyMaintenanceDisplay');
  const indriveFeeDisplay = document.getElementById('indriveFeeDisplay');
  const fuelBonusLitersText = document.getElementById('fuelBonusLitersText');
  const earningsCadenceText = document.getElementById('earningsCadenceText');

  // Referral Elements
  const activeReferralCodeText = document.getElementById('activeReferralCodeText');
  const copyReferralBtn = document.getElementById('copyReferralBtn');
  const primaryTryItBtn = document.getElementById('primaryTryItBtn');
  const playStoreBtn = document.getElementById('playStoreBtn');
  const appStoreBtn = document.getElementById('appStoreBtn');
  const recalculateBtn = document.getElementById('recalculateBtn');

  // Config Modal
  const openConfigBtn = document.getElementById('openConfigBtn');
  const closeConfigBtn = document.getElementById('closeConfigBtn');
  const configModal = document.getElementById('configModal');
  const customReferralCodeInput = document.getElementById('customReferralCodeInput');
  const customTargetUrlInput = document.getElementById('customTargetUrlInput');
  const customEmailInput = document.getElementById('customEmailInput');
  const customAccessKeyInput = document.getElementById('customAccessKeyInput');
  const saveConfigBtn = document.getElementById('saveConfigBtn');
  const cancelConfigBtn = document.getElementById('cancelConfigBtn');
  const toastMsg = document.getElementById('toastMsg');

  const stepTitles = [
    'Welcome',
    'Work Schedule',
    'Vehicle Category',
    'Time Allocation',
    'Earnings Projection',
    'Driver Eligibility',
    'Ready to Drive'
  ];

  // Initialize
  function init() {
    setupEventListeners();
    updateReferralUI();
    updateCityLabels();
    recomputeAndRender();
    startActivityTicker();
    startCountdownTimer();
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // City Select
    if (citySelect) {
      citySelect.addEventListener('change', (e) => {
        state.cityKey = e.target.value;
        updateCityLabels();
        recomputeAndRender();
      });
    }

    // Start Button
    if (startWizardBtn) {
      startWizardBtn.addEventListener('click', () => {
        goToStep(1);
      });
    }

    // Brand reset button
    const brandResetBtn = document.getElementById('brandResetBtn');
    if (brandResetBtn) {
      brandResetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToStep(0);
      });
    }

    // Choice Cards (Commitment, Vehicle, License)
    document.querySelectorAll('.choice-card, .license-option-card').forEach((card) => {
      card.addEventListener('click', function () {
        const group = this.getAttribute('data-radio');
        const value = this.getAttribute('data-value');

        // Deselect others in group
        const selector = group === 'license' ? '.license-option-card' : `.choice-card[data-radio="${group}"]`;
        document.querySelectorAll(selector).forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');

        const input = this.querySelector('input[type="radio"]');
        if (input) input.checked = true;

        if (group === 'commitment') state.workCommitment = value;
        if (group === 'vehicle') state.vehicleType = value;
        if (group === 'license') state.licenseStatus = value;

        recomputeAndRender();
      });
    });

    // Range Sliders
    if (tripsPerDayInput) {
      tripsPerDayInput.addEventListener('input', (e) => {
        state.tripsPerDay = Number(e.target.value);
        if (tripsPerDayDisplay) {
          tripsPerDayDisplay.textContent = `${state.tripsPerDay} trips / day`;
        }
        recomputeAndRender();
      });
    }

    if (hoursPerDayInput) {
      hoursPerDayInput.addEventListener('input', (e) => {
        state.hoursPerDay = Number(e.target.value);
        hoursPerDayDisplay.textContent = `${state.hoursPerDay} hrs / day`;
        recomputeAndRender();
      });
    }

    if (daysPerWeekInput) {
      daysPerWeekInput.addEventListener('input', (e) => {
        state.daysPerWeek = Number(e.target.value);
        daysPerWeekDisplay.textContent = `${state.daysPerWeek} days / wk`;
        recomputeAndRender();
      });
    }

    // Peak hours toggle
    if (peakHoursCheckbox) {
      peakHoursCheckbox.addEventListener('change', (e) => {
        state.drivePeakHours = e.target.checked;
        recomputeAndRender();
      });
    }

    // Step Navigations
    document.querySelectorAll('.next-step-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        goToStep(state.currentStep + 1);
      });
    });

    document.querySelectorAll('.prev-step-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        goToStep(Math.max(0, state.currentStep - 1));
      });
    });

    // Finish & Try It
    const finishAndTryBtn = document.getElementById('finishAndTryBtn');
    if (finishAndTryBtn) {
      finishAndTryBtn.addEventListener('click', async () => {
        const nameInput = document.getElementById('driverNameInput');
        const phoneInput = document.getElementById('driverPhoneInput');
        if (nameInput) state.driverName = nameInput.value.trim();
        if (phoneInput) state.driverPhone = phoneInput.value.trim();

        // Loading feedback
        const originalBtnHTML = finishAndTryBtn.innerHTML;
        finishAndTryBtn.disabled = true;
        finishAndTryBtn.innerHTML = 'Securing Bonus & Unlocking... <span class="btn-spinner"></span>';

        try {
          await sendLeadNotification();
        } catch (err) {
          console.warn('Lead submission notice:', err);
        } finally {
          finishAndTryBtn.disabled = false;
          finishAndTryBtn.innerHTML = originalBtnHTML;
        }

        goToStep(6);
        triggerConfetti();
      });
    }

    // Recalculate
    if (recalculateBtn) {
      recalculateBtn.addEventListener('click', () => {
        goToStep(3); // jump back to hours
      });
    }

    // Copy Referral Link
    if (copyReferralBtn) {
      copyReferralBtn.addEventListener('click', () => {
        const referralLink = state.customTargetUrl || CONFIG.REFERRAL_LINK || 'https://indriver.onelink.me/X6vF/rzajnuar';
        copyToClipboard(referralLink);
        showToast('Referral link copied to clipboard!');
      });
    }

    // Config Modal Events
    if (openConfigBtn) {
      openConfigBtn.addEventListener('click', openModal);
    }
    if (closeConfigBtn) {
      closeConfigBtn.addEventListener('click', closeModal);
    }
    if (cancelConfigBtn) {
      cancelConfigBtn.addEventListener('click', closeModal);
    }
    if (configModal) {
      configModal.addEventListener('click', (e) => {
        if (e.target === configModal) closeModal();
      });
    }
    if (saveConfigBtn) {
      saveConfigBtn.addEventListener('click', saveConfig);
    }

    if (brandResetBtn) {
      brandResetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToStep(0);
      });
    }
  }

  // Go to step
  function goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= wizardCards.length) return;

    wizardCards.forEach((card, idx) => {
      if (card) {
        card.classList.toggle('active', idx === stepIndex);
      }
    });

    state.currentStep = stepIndex;

    // Header Back button visibility
    if (headerBackBtn) {
      headerBackBtn.style.display = stepIndex > 0 ? 'inline-flex' : 'none';
    }

    // Progress Bar handling
    if (stepIndex === 0) {
      progressWrap.style.display = 'none';
    } else {
      progressWrap.style.display = 'block';
      const pct = Math.min(100, Math.round((stepIndex / (wizardCards.length - 1)) * 100));
      progressBarFill.style.width = `${pct}%`;
      stepCounterText.textContent = `Step ${stepIndex} of ${wizardCards.length - 1}`;
      stepCategoryText.textContent = stepTitles[stepIndex] || '';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    recomputeAndRender();
  }

  // Calculation & Rendering
  function recomputeAndRender() {
    const results = calculator.calculate({
      cityKey: state.cityKey,
      workCommitment: state.workCommitment,
      vehicleType: state.vehicleType,
      tripsPerDay: state.tripsPerDay,
      hoursPerDay: state.hoursPerDay,
      daysPerWeek: state.daysPerWeek,
      drivePeakHours: state.drivePeakHours
    });

    const curr = results.currency;

    // Update Step 4 (Earnings Dashboard)
    if (netMonthlyEarningsDisplay) {
      netMonthlyEarningsDisplay.textContent = calculator.formatCurrency(results.inDriveNetMonthly, curr);
    }
    if (netDailyEarningsDisplay) {
      netDailyEarningsDisplay.textContent = calculator.formatCurrency(results.inDriveNetDaily, curr);
    }
    if (netWeeklyEarningsDisplay) {
      netWeeklyEarningsDisplay.textContent = calculator.formatCurrency(results.inDriveNetWeekly, curr);
    }
    if (grossMonthlyEarningsDisplay) {
      grossMonthlyEarningsDisplay.textContent = calculator.formatCurrency(results.monthlyGross, curr);
    }
    if (dailyTripsSubText) {
      dailyTripsSubText.textContent = `${results.dailyTrips} trips / day`;
    }
    if (weeklyTripsSubText) {
      weeklyTripsSubText.textContent = `${results.totalTripsPerWeek} trips / wk`;
    }
    if (monthlyTripsSubText) {
      monthlyTripsSubText.textContent = `${results.totalTripsPerMonth} trips / mo`;
    }
    if (summaryHoursTag) {
      summaryHoursTag.textContent = `${results.dailyTrips} trips/day (${results.totalTripsPerWeek} trips/wk • ${results.weeklyHours} hrs)`;
    }
    if (summaryCityTag) {
      summaryCityTag.textContent = results.city.name.split(',')[0];
    }
    if (extraKeptBadge) {
      extraKeptBadge.textContent = `+${calculator.formatCurrency(results.extraMoneyKept, curr)} More Cash`;
    }
    if (savingsCalloutAmount) {
      savingsCalloutAmount.textContent = `${calculator.formatCurrency(results.extraMoneyKept, curr)}`;
    }

    // Dynamic Fuel & Operating Breakdown based on ₦1,400/L
    if (monthlyFuelLitersTag) {
      monthlyFuelLitersTag.textContent = `~${results.monthlyFuelLiters} Litres / mo`;
    }
    if (monthlyFuelCostDisplay) {
      monthlyFuelCostDisplay.textContent = `-${calculator.formatCurrency(results.monthlyFuelExpense, curr)}`;
    }
    if (monthlyMaintenanceDisplay) {
      monthlyMaintenanceDisplay.textContent = `-${calculator.formatCurrency(results.monthlyMaintenanceData, curr)}`;
    }
    if (indriveFeeDisplay) {
      indriveFeeDisplay.textContent = `-${calculator.formatCurrency(results.inDriveFee, curr)}`;
    }
    if (fuelBonusLitersText) {
      fuelBonusLitersText.textContent = `~${results.bonusLitresEquivalent} Litres`;
    }
    if (earningsCadenceText) {
      earningsCadenceText.textContent = `Clean take-home after fuel (calculated at ${calculator.formatCurrency(results.fuelPricePerLiter, curr)}/L), maintenance & low inDrive fee`;
    }

    const indriveFeePercentText = document.getElementById('indriveFeePercentText');
    if (indriveFeePercentText) {
      indriveFeePercentText.textContent = `${results.inDriveFeePercent}% service fee`;
    }

    // Final Screen Tag
    if (finalMonthlyAmountTag) {
      finalMonthlyAmountTag.textContent = `${calculator.formatCurrency(results.inDriveNetMonthly, curr)} / month`;
    }

    updateReferralLinks();
  }

  function updateCityLabels() {
    const city = CONFIG.CITIES[state.cityKey] || CONFIG.CITIES['lagos'];
    if (activeCityLabel) {
      activeCityLabel.textContent = city.name.split(',')[0];
    }
  }

  // Update Referral UI & Links
  function updateReferralUI() {
    const referralTarget = state.customTargetUrl || CONFIG.REFERRAL_LINK || 'https://indriver.onelink.me/X6vF/rzajnuar';
    if (activeReferralCodeText) {
      activeReferralCodeText.textContent = referralTarget;
    }
    updateReferralLinks();
  }

  function updateReferralLinks() {
    // Primary OneLink referral target
    const referralTarget = state.customTargetUrl || CONFIG.REFERRAL_LINK || 'https://indriver.onelink.me/X6vF/rzajnuar';

    // Update primary "TRY IT" button
    if (primaryTryItBtn) {
      primaryTryItBtn.href = referralTarget;
      primaryTryItBtn.setAttribute('data-code', state.referralCode);
    }

    if (playStoreBtn) {
      playStoreBtn.href = referralTarget;
    }

    if (appStoreBtn) {
      appStoreBtn.href = referralTarget;
    }
  }

  // Config Modal
  function openModal() {
    if (customReferralCodeInput) customReferralCodeInput.value = state.referralCode;
    if (customTargetUrlInput) customTargetUrlInput.value = state.customTargetUrl;
    if (customEmailInput) customEmailInput.value = state.notificationEmail || '';
    if (customAccessKeyInput) customAccessKeyInput.value = state.accessKey || '';
    if (configModal) configModal.classList.add('active');
  }

  function closeModal() {
    if (configModal) configModal.classList.remove('active');
  }

  function saveConfig() {
    const newCode = customReferralCodeInput ? customReferralCodeInput.value.trim() : '';
    const newUrl = customTargetUrlInput ? customTargetUrlInput.value.trim() : '';
    const newEmail = customEmailInput ? customEmailInput.value.trim() : '';
    const newKey = customAccessKeyInput ? customAccessKeyInput.value.trim() : '';

    if (newCode) {
      state.referralCode = setActiveReferralCode(newCode);
    }
    state.customTargetUrl = newUrl;
    localStorage.setItem('indrive_custom_target_url', newUrl);

    state.accessKey = setFormAccessKey(newKey);
    state.notificationEmail = setNotificationEmail(newEmail || 'ugoodagu@gmail.com');

    updateReferralUI();
    closeModal();
    showToast('Settings & notification email saved!');
  }

  // Send Lead Notification to Owner's Email (ugoodagu@gmail.com)
  async function sendLeadNotification() {
    const accessKey = state.accessKey || getFormAccessKey();
    const recipientEmail = state.notificationEmail || getNotificationEmail() || 'ugoodagu@gmail.com';

    try {
      const calcResults = calculator.calculate({
        cityKey: state.cityKey,
        workCommitment: state.workCommitment,
        vehicleType: state.vehicleType,
        hoursPerDay: state.hoursPerDay,
        daysPerWeek: state.daysPerWeek,
        drivePeakHours: state.drivePeakHours
      });

      const cityName = (CONFIG.CITIES[state.cityKey] && CONFIG.CITIES[state.cityKey].name) || state.cityKey;
      const vehicleName = (CONFIG.VEHICLE_TYPES[state.vehicleType] && CONFIG.VEHICLE_TYPES[state.vehicleType].name) || state.vehicleType;
      const licenseDesc = state.licenseStatus === 'valid'
        ? "Yes (Valid driver's license)"
        : (state.licenseStatus === 'renewing' ? 'In progress / Currently renewing' : 'No (Does not have license yet)');

      const leadName = state.driverName || 'Prospective Driver';
      const leadPhone = state.driverPhone || 'Not provided';
      const netMonthly = calculator.formatCurrency(calcResults.inDriveNetMonthly, calcResults.currency);
      const extraSaved = calculator.formatCurrency(calcResults.extraMoneyKept, calcResults.currency);
      const grossMonthly = calculator.formatCurrency(calcResults.monthlyGross, calcResults.currency);
      const monthlyFuelExpense = `${calculator.formatCurrency(calcResults.monthlyFuelExpense, calcResults.currency)} (~${calcResults.monthlyFuelLiters} Litres at ₦1,400/L)`;
      const monthlyMaintenance = calculator.formatCurrency(calcResults.monthlyMaintenanceData, calcResults.currency);
      const inDriveFee = calculator.formatCurrency(calcResults.inDriveFee, calcResults.currency);

      // If user has set an optional Web3Forms key, send via Web3Forms API
      if (accessKey && accessKey !== 'YOUR_ACCESS_KEY_HERE') {
        const payload = {
          access_key: accessKey,
          subject: `🚗 New inDrive Lead: ${leadName} (${leadPhone}) - ${cityName}`,
          from_name: 'inDrive Driver Funnel',
          "Driver Name": leadName,
          "Phone / WhatsApp Number": leadPhone,
          "City": cityName,
          "Vehicle Category": vehicleName,
          "Driver License Status": licenseDesc,
          "Work Commitment": state.workCommitment === 'fulltime' ? 'Full-Time Driver' : 'Part-Time Driver',
          "Driving Schedule": `${state.tripsPerDay} trips/day, ${state.hoursPerDay} hrs/day, ${state.daysPerWeek} days/week`,
          "Peak Hours Driving": state.drivePeakHours ? 'Yes' : 'No',
          "Estimated Gross Monthly Earnings": grossMonthly,
          "Estimated Daily Net Take-Home": `${calculator.formatCurrency(calcResults.inDriveNetDaily, calcResults.currency)} / day`,
          "Monthly Fuel Cost (₦1,400/L)": monthlyFuelExpense,
          "Monthly Maintenance & Data": monthlyMaintenance,
          "inDrive Platform Fee (13.6%)": inDriveFee,
          "Estimated Net Monthly Take-Home": `${netMonthly} / month`,
          "Extra Money Kept vs Competitors": `${extraSaved} / month`,
          "Applied Referral Link": state.customTargetUrl || CONFIG.REFERRAL_LINK,
          "Submission Date": new Date().toLocaleString()
        };

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('inDrive Lead submitted via Web3Forms:', data);
        return { success: true, provider: 'web3forms', data };
      }

      // Default Direct Mailer to ugoodagu@gmail.com
      if (recipientEmail) {
        const payload = {
          _subject: `🚗 New inDrive Lead: ${leadName} (${leadPhone}) - ${cityName}`,
          _template: 'table',
          _captcha: 'false',
          "Driver Name": leadName,
          "Phone / WhatsApp Number": leadPhone,
          "City": cityName,
          "Vehicle Category": vehicleName,
          "Driver License Status": licenseDesc,
          "Work Commitment": state.workCommitment === 'fulltime' ? 'Full-Time Driver' : 'Part-Time Driver',
          "Driving Schedule": `${state.tripsPerDay} trips/day, ${state.hoursPerDay} hrs/day, ${state.daysPerWeek} days/week`,
          "Peak Hours Driving": state.drivePeakHours ? 'Yes' : 'No',
          "Estimated Gross Monthly Earnings": grossMonthly,
          "Estimated Daily Net Take-Home": `${calculator.formatCurrency(calcResults.inDriveNetDaily, calcResults.currency)} / day`,
          "Monthly Fuel Cost (₦1,400/L)": monthlyFuelExpense,
          "Monthly Maintenance & Data": monthlyMaintenance,
          "inDrive Platform Fee (13.6%)": inDriveFee,
          "Estimated Net Monthly Take-Home": `${netMonthly} / month`,
          "Extra Money Kept vs Competitors": `${extraSaved} / month`,
          "Applied Referral Link": state.customTargetUrl || CONFIG.REFERRAL_LINK,
          "Submission Date": new Date().toLocaleString()
        };

        const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('inDrive Lead delivered to ' + recipientEmail + ' via FormSubmit:', data);
        return { success: true, provider: 'formsubmit', data };
      }

      return { success: false, reason: 'no_recipient' };
    } catch (err) {
      console.error('Failed to dispatch lead notification:', err);
      return { success: false, error: err };
    }
  }

  // Toast
  function showToast(text) {
    if (!toastMsg) return;
    toastMsg.textContent = text;
    toastMsg.classList.add('show');
    setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 2800);
  }

  // Copy helper
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  // Live driver activity ticker simulation to make page captivating
  function startActivityTicker() {
    const activities = [
      { driver: 'Emeka O.', city: 'Ikeja, Lagos', amount: '₦18,500', time: '2m ago' },
      { driver: 'Ibrahim D.', city: 'Wuse 2, Abuja', amount: '₦24,000', time: 'Just now' },
      { driver: 'Tunde B.', city: 'Lekki, Lagos', amount: '₦16,200', time: '4m ago' },
      { driver: 'Chidi K.', city: 'Garki, Abuja', amount: '₦19,500', time: '3m ago' },
      { driver: 'Babatunde S.', city: 'Yaba, Lagos', amount: '₦21,000', time: '5m ago' },
      { driver: 'Aminu M.', city: 'Maitama, Abuja', amount: '₦28,000', time: 'Just now' }
    ];

    let index = 0;
    const tickerContainer = document.createElement('div');
    tickerContainer.className = 'live-activity-ticker';
    tickerContainer.innerHTML = `
      <span class="ticker-dot"></span>
      <span id="tickerContentText">🔥 42 drivers joined inDrive in Lagos & Abuja today</span>
    `;

    // Add styles for the live activity pill
    const style = document.createElement('style');
    style.textContent = `
      .live-activity-ticker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        padding: 7px 16px;
        border-radius: 9999px;
        font-size: 0.8rem;
        color: #0F172A;
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
        margin: 0 auto 16px;
      }
      .ticker-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #16A34A;
        box-shadow: 0 0 8px rgba(22, 163, 74, 0.6);
        animation: pulse 1.5s infinite;
      }
    `;
    document.head.appendChild(style);

    const mainHeader = document.querySelector('.app-header');
    if (mainHeader && mainHeader.parentNode) {
      mainHeader.parentNode.insertBefore(tickerContainer, mainHeader.nextSibling);
    }

    setInterval(() => {
      const item = activities[index % activities.length];
      const tickerText = document.getElementById('tickerContentText');
      if (tickerText) {
        tickerText.innerHTML = `🎉 <strong>${item.driver}</strong> in ${item.city} made <strong>${item.amount}</strong> (${item.time})`;
      }
      index++;
    }, 6500);
  }

  // Countdown timer for urgency banner
  function startCountdownTimer() {
    let totalSeconds = 23 * 3600 + 48 * 60 + 15;
    const hEl = document.getElementById('countdownHours');
    const mEl = document.getElementById('countdownMins');
    const sEl = document.getElementById('countdownSecs');

    if (!hEl || !mEl || !sEl) return;

    setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds--;
      } else {
        totalSeconds = 24 * 3600; // loop
      }

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      hEl.textContent = String(h).padStart(2, '0');
      mEl.textContent = String(m).padStart(2, '0');
      sEl.textContent = String(s).padStart(2, '0');
    }, 1000);
  }

  // Lightweight Confetti Celebration
  function triggerConfetti() {
    const count = 40;
    const colors = ['#B4F82C', '#84CC16', '#16A34A', '#0F172A', '#FACC15'];

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.left = `${Math.random() * 100}vw`;
      el.style.top = '-10px';
      el.style.width = `${Math.random() * 8 + 6}px`;
      el.style.height = `${Math.random() * 14 + 6}px`;
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = '2px';
      el.style.zIndex = '9999';
      el.style.pointerEvents = 'none';
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      el.style.transition = `transform ${Math.random() * 2 + 1.5}s ease-out, top ${Math.random() * 2 + 1.5}s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 2s ease`;

      document.body.appendChild(el);

      requestAnimationFrame(() => {
        el.style.top = `${window.innerHeight + 20}px`;
        el.style.transform = `rotate(${Math.random() * 720}deg) translateX(${Math.random() * 100 - 50}px)`;
        el.style.opacity = '0';
      });

      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 3500);
    }
  }

  // Run init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
