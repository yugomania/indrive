/**
 * inDrive Driver Earnings Calculator & Referral Configuration
 * You can set your referral code and links below or via URL parameter (e.g. ?ref=YOURCODE)
 */

const CONFIG = {
  // Your official inDrive OneLink Referral Link (handles Android & iOS automatically)
  REFERRAL_LINK: 'https://indriver.onelink.me/X6vF/rzajnuar',
  
  // Referral code extracted from your OneLink
  DEFAULT_REFERRAL_CODE: 'rzajnuar',

  // Fallback direct store links
  PLAY_STORE_URL: 'https://indriver.onelink.me/X6vF/rzajnuar',
  APP_STORE_URL: 'https://indriver.onelink.me/X6vF/rzajnuar',
  DIRECT_SIGNUP_URL: 'https://indriver.onelink.me/X6vF/rzajnuar',

  // Cities, average trip fares, and local currencies (Nigeria: Lagos & Abuja only)
  CITIES: {
    'lagos': {
      name: 'Lagos, Nigeria',
      currency: '₦',
      currencyCode: 'NGN',
      baseTripFare: 4200,
      avgTripsPerHour: 1.6,
      fuelMaintenanceRatio: 0.22,
      inDriveCommissionRate: 0.095, // ~9.5% inDrive
      competitorCommissionRate: 0.25 // ~25% Competitors
    },
    'abuja': {
      name: 'Abuja, Nigeria',
      currency: '₦',
      currencyCode: 'NGN',
      baseTripFare: 4500,
      avgTripsPerHour: 1.5,
      fuelMaintenanceRatio: 0.20,
      inDriveCommissionRate: 0.095,
      competitorCommissionRate: 0.25
    }
  },

  // Vehicle type multipliers
  VEHICLE_TYPES: {
    'sedan': { name: 'Standard Car / Sedan', multiplier: 1.0, icon: 'car' },
    'comfort': { name: 'Comfort / SUV', multiplier: 1.25, icon: 'star' },
    'moto': { name: 'Motorcycle / Scooter', multiplier: 0.75, icon: 'bike' },
    'delivery': { name: 'Courier / Delivery Van', multiplier: 1.15, icon: 'truck' }
  },

  // Lead Notification Email: All driver applications with name & phone are sent directly here!
  NOTIFICATION_EMAIL: 'ugoodagu@gmail.com',

  // Optional: Web3Forms Access Key for sending lead notifications directly to your email
  // (Get a free key instantly at https://web3forms.com if you prefer Web3Forms)
  WEB3FORMS_ACCESS_KEY: ''
};

// Helper to get active referral code (from URL query, localStorage, or default)
function getActiveReferralCode() {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const paramRef = urlParams.get('ref') || urlParams.get('referral');
    if (paramRef) {
      localStorage.setItem('indrive_referral_code', paramRef);
      return paramRef;
    }
    return localStorage.getItem('indrive_referral_code') || CONFIG.DEFAULT_REFERRAL_CODE;
  }
  return CONFIG.DEFAULT_REFERRAL_CODE;
}

function setActiveReferralCode(code) {
  if (code && code.trim()) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('indrive_referral_code', code.trim());
    }
    return code.trim();
  }
  return getActiveReferralCode();
}

// Helper to get active Lead Notification Email
function getNotificationEmail() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('indrive_notification_email') || CONFIG.NOTIFICATION_EMAIL || 'ugoodagu@gmail.com';
  }
  return CONFIG.NOTIFICATION_EMAIL || 'ugoodagu@gmail.com';
}

function setNotificationEmail(email) {
  const trimmed = email ? email.trim() : '';
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('indrive_notification_email', trimmed);
  }
  return trimmed;
}

// Helper to get active Web3Forms Access Key (from localStorage or CONFIG)
function getFormAccessKey() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('indrive_form_access_key') || CONFIG.WEB3FORMS_ACCESS_KEY || '';
  }
  return CONFIG.WEB3FORMS_ACCESS_KEY || '';
}

function setFormAccessKey(key) {
  const trimmed = key ? key.trim() : '';
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('indrive_form_access_key', trimmed);
  }
  return trimmed;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    CONFIG, 
    getActiveReferralCode, 
    setActiveReferralCode, 
    getNotificationEmail, 
    setNotificationEmail, 
    getFormAccessKey, 
    setFormAccessKey 
  };
}


