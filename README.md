# inDrive Driver Earnings Calculator & Referral Funnel

A high-converting, mobile-first driver onboarding questionnaire and earnings calculator modeled after the inDrive driver funnel (`indrive.fnlfx.com`).

![inDrive Banner](https://img.shields.io/badge/inDrive-Earnings%20Calculator-lime?style=for-the-badge&logo=android)

## 🌟 Key Features

1. **Multi-Step Driver Questionnaire**:
   - **Step 0**: City selection (Lagos, Abuja, Nairobi, Johannesburg, Cairo, Mexico City, Global USD) + Urgency Sign-Up Bonus countdown.
   - **Step 1**: Work style commitment (Full-Time vs. Part-Time / Side Hustle).
   - **Step 2**: Vehicle category (Standard Sedan, Comfort SUV, Motorcycle/Boda, Cargo/Courier).
   - **Step 3**: Time allocation (Interactive sliders for hours per day & days per week + peak surge toggle).
   - **Step 4**: Dynamic Live Earnings Dashboard:
     - Real-time Net & Gross monthly take-home pay.
     - inDrive Low Commission (~9.5%) vs. Competitor (25%) savings comparison.
     - Verified driver social proof and testimonials.
   - **Step 5**: **Driver's License Qualification** (*"Do you have a driver's license?"* with Yes / Renewing / No options + contact details).
   - **Step 6**: Final Onboarding & **"TRY IT"** button linked directly to your referral code.

2. **Captivating Conversion Boosters**:
   - **Urgency Countdown Banner**: Limited-time 0% service fee bonus clock.
   - **Live Driver Activity Ticker**: Real-time payout notifications across cities.
   - **Interactive Sliders**: Real-time reactive calculation with smooth counters.
   - **Confetti Celebration**: Fires upon qualifying for the driver program.
   - **One-Click Referral Code Copy**: Drivers can copy your code with feedback toast.

3. **Referral Tracking & Monetization ("Try It" Button)**:
   - Built to ensure **you get paid** for every driver who downloads the inDrive app.
   - Embeds your referral code into the primary **"TRY IT — DOWNLOAD APP & EARN"** button, Google Play deep link, and Apple App Store link.
   - **Customizable 3 Ways**:
     1. **Via UI**: Click the ⚙️ gear icon in the top header to enter your referral code or custom signup link.
     2. **Via URL**: Share your website with `?ref=YOUR_CODE` (e.g. `https://yoursite.com/?ref=MYCODE123`), which auto-saves for the visitor.
     3. **Via Code**: Edit `js/config.js` to change `DEFAULT_REFERRAL_CODE`.

---

## 🚀 Quick Start & Deployment

### Local Development
To preview locally:
```bash
python -m http.server 8085
```
Then visit `http://localhost:8085` in your browser.

### Free 1-Click Deployment
This project is pure static HTML/CSS/JS with zero build steps or heavy dependencies:
- **GitHub Pages**: Push this repository to GitHub and enable GitHub Pages in Repository Settings.
- **Vercel / Netlify / Cloudflare Pages**: Connect this GitHub repository for instant global hosting.

---

## 📁 File Structure

```
indrive/
├── index.html         # Main semantic HTML structure & wizard steps
├── css/
│   └── style.css      # Design system, electric lime accents, responsive layout
├── js/
│   ├── config.js      # Referral code, city rates, vehicle multipliers
│   ├── calculator.js  # Gross/net earnings & commission formulas
│   └── app.js         # Wizard navigation, countdown timer, ticker, confetti
└── README.md          # Documentation
```
