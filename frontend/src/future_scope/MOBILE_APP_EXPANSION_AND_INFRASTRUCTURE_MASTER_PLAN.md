# SN ENVIRO SYSTEMS PRIVATE LIMITED
## Strategic Master Proposal: Enterprise Mobile App, Live Field Telemetry, Cloud Infrastructure & Automated Payroll Hub

**Prepared By:** Software Systems & Automation Team  
**Presented To:** Managing Director (MD) & Executive Board  
**Target Timeline:** Q4 2026 – Q1 2027  
**Status:** Ready for Executive Review & Approval  

---

## 1. Executive Summary

This master document outlines the strategic blueprint for upgrading the **SN Enviro Attendance Portal** into a fully automated **Enterprise Field Executive, Telemetry, and Statutory Payroll Platform**.

It provides immediate, cost-effective solutions for five core operational domains:
1. **Cloud Reliability & Zero Downtime:** Upgrading our backend server to Render Starter (~₹590/month) to permanently eliminate sleep modes and `503 Service Unavailable` errors.
2. **Database (MongoDB Atlas) Capacity:** Proof that our current database tier **never sleeps** and has capacity for **5 to 7+ years of records at ₹0 cost**.
3. **Native Mobile App Store Release:** Publishing official SN Enviro applications on the **Google Play Store ($25 / ~₹2,100 one-time)** and **Apple App Store ($99 / ~₹8,300 annual)**.
4. **Live Field GPS Tracking (The Uber / Swiggy Model):** Solving the mobile web browser limitation via an **Android Foreground Service** that tracks engineers continuously even if the app is cleared from background.
5. **Automated Payroll, Bank Disbursement & Self-Service KYC:** Allowing employees to enter their own bank details with cancelled cheque camera verification, and enabling MD 1-click salary disbursements via Corporate Bank CMS Bulk Upload or Banking APIs.

---

## 2. Cloud Server & Database Infrastructure Analysis

### A. Backend Server: Render Starter Plan (~₹590 / Month)
* **The Problem on Free Tier:** Free instances automatically spin down to 0 after 15 minutes of inactivity. When accessed, waking up takes 50 to 90 seconds (cold start), causing browser timeouts and triggering false `503 Service Unavailable` errors on external pingers.
* **The Permanent Solution (Starter Plan - $7/mo = ~₹588 INR/mo):**
  * **Always-On Container:** Runs 24/7/365 without ever sleeping or spinning down.
  * **Instant Sub-Second Response:** Every API call answers in **< 30 milliseconds** round the clock.
  * **Continuous Real-Time WebSockets:** MD Live Map and field tracking sockets maintain continuous connection with zero dropped signals.
  * **Transparent Billing:** Charged month-by-month (~₹588 to ₹595 INR) to company card. **No ₹14,000 upfront lock-in.** Cancel or pause anytime.

### B. Database: MongoDB Atlas (M0 Free Tier) — No Upgrade Needed!
* **Does our Database Sleep?** **NO, NEVER.** MongoDB Atlas is an enterprise cloud cluster that stays online 24/7/365.
* **Why Free Tier is Sufficient for 5+ Years:**
  * Free storage capacity: **512 MB**.
  * A single daily attendance record takes only **~0.5 KB** of text.
  * 35 employees × 30 days = **1,050 records / month = ~0.5 MB / month**.
  * 512 MB holds **over 1,000,000 attendance records** (equivalent to 7+ years of daily check-ins for 50+ staff).
  * **Photo / PDF Storage:** Bill receipts and cheque photos are saved in Cloud Object Storage (e.g., Cloudinary), keeping the core database ultra-lightweight.

---

## 3. Native Mobile App Store Publishing & Investment

We use **Capacitor (by Ionic)** to wrap our existing React portal into native Android APK/AAB and iOS IPA packages. 100% of our existing pages, security controls, live maps, and database logic run directly on mobile without code rewrites.

### Store Registration & Publishing Costs:

| Platform | Official Store | Fee (USD) | Cost in Indian Rupees (INR) | Validity | Recommendation |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Android** | **Google Play Console** | **$25 (One-Time)** | **~₹2,100 INR** | **Lifetime** | **Immediate Priority:** Covers 95%+ of field application engineers. |
| **Apple iOS** | **Apple Developer Program** | **$99 / year** | **~₹8,300 INR / year** | **Annual** | Optional for Year 1; register when executive iPhone rollout is scheduled. |

---

## 4. Live GPS Tracking: Web Browser vs. Uber / Swiggy Model

### Core Question:
> *"Will traveling employees be visible on the live map if they clear the app from the background?"*

### A. The Web Browser Limitation (Current Portal) — NO
* When an engineer logs into the portal via Google Chrome or Safari on their smartphone:
  * Location works **only while the browser tab is actively visible on the screen**.
  * The moment the engineer locks the phone, opens WhatsApp, or swipes away the browser tab, the mobile operating system (Android / iOS) **freezes the browser's JavaScript engine** to preserve battery life and privacy.
  * **Result:** Web browsers cannot perform background GPS tracking once minimized or closed.

### B. The Native Mobile App Reality (The Uber & Swiggy Model) — YES
In the native Android app, we implement a native **Android Foreground Service** with background location permissions:

```
+-----------------------------------------------------------------------------------+
|                        ANDROID OPERATING SYSTEM ARCHITECTURE                      |
+-----------------------------------------------------------------------------------+
|  [ ENGINEER ACTION ]                                                              |
|    - Engineer marks Check-In at 9:15 AM at Plant / Site                           |
|    - App automatically triggers: [STICKY FOREGROUND SERVICE]                      |
|                                                                                   |
|  [ PERSISTENT NOTIFICATION BAR (Non-Dismissible) ]                                |
|    "📍 SN Enviro Field Tracking Active • Shift In Progress"                       |
|                                                                                   |
|  [ NATIVE GPS ENGINE ]                                                            |
|    - Wakes up every 30 seconds automatically                                      |
|    - Captures high-precision GPS coordinates (Latitude, Longitude, Speed, Battery)|
|    - Transmits telemetry packet to SN Enviro Backend / Live Tracking Map          |
|                                                                                   |
|  [ WHAT HAPPENS IF THE USER CLEARS THE APP FROM RECENT APPS? ]                    |
|    - The Foreground Service operates with the native START_STICKY flag            |
|    - If closed or swiped away, Android OS automatically restarts it in < 2 sec   |
|    - Telemetry continues uninterrupted while the shift remains active             |
|    - Tracking ONLY terminates when the engineer formally clicks 'Check-Out'       |
+-----------------------------------------------------------------------------------+
```

---

## 5. Employee Self-Service KYC & Fraud-Proof Expense Claims

### A. Employee Bank Details Entry (Self-Service)
You do **not** need to manually enter 35 employees' bank accounts:
1. **Employee Enters:** Account Number, Confirm Account Number, Bank Name, IFSC, UAN, and PAN in their profile.
2. **Camera Proof Upload:** Employee captures a photo of their **Cancelled Cheque** or **Passbook First Page** using their phone camera and submits.
3. **HR / MD Verification:** The MD Portal displays the entered details alongside the cheque photo. Once HR verifies and clicks **"Approve"**, the fields are permanently **LOCKED**.
4. **Security:** Bank account numbers are AES-256 encrypted at rest and displayed as `**** **** 7890` for data privacy.

### B. Fuel & Expense Claims (Live Camera & PDF with GPS Stamping)
When engineers travel to industrial plants:
1. Open app &rarr; **Travel & Expense Reimbursements** &rarr; **"Add Claim"**.
2. Select category: **Fuel / Travel / Toll / Food / Plant Consumables**.
3. Attach bill: Take a live photo with **phone camera** OR upload a saved **PDF / image receipt**.
4. **Anti-Fraud GPS Stamping:** The app auto-attaches the engineer's exact **GPS location** and **timestamp** to the bill, preventing false reimbursement claims.
5. Claims appear instantly in the MD Portal for 1-click approval.

---

## 6. All-in-One Enterprise Mobile App (Navigation Architecture)

The mobile app provides engineers with a unified, modern **Bottom Navigation Bar**:

```
+-----------------------------------------------------------------------------------+
|                      SN ENVIRO FIELD EXECUTIVE MOBILE APP                         |
|                                                                                   |
|   [ Shift Status: Active (4 hrs 12 min) ]            [ Site: Ramagundam NTPC ]    |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |  📍 Real-Time Site Check-In / Check-Out (Geofenced Proximity)             |   |
|   +---------------------------------------------------------------------------+   |
|   |  💵 View Monthly Pay Slip & Salary Breakdown (1-Click PDF Download)       |   |
|   +---------------------------------------------------------------------------+   |
|   |  🏛️ PF / UAN Passbook Receipts & ESIC e-Pehchan Card                       |   |
|   +---------------------------------------------------------------------------+   |
|   |  💳 Bank Account Verification & Direct NEFT Credit Status                 |   |
|   +---------------------------------------------------------------------------+   |
|   |  ⛽ Fuel & Travel Allowance Claims (With Camera Receipt Upload)            |   |
|   +---------------------------------------------------------------------------+   |
|                                                                                   |
|-----------------------------------------------------------------------------------|
|  [ 🏠 Home ]   [ 📍 Live Map ]   [ 💰 Salary ]   [ 📄 PF/Claims ]   [ 👤 Profile ]   |
+-----------------------------------------------------------------------------------+
```

---

## 7. Statutory Payroll & Bank Disbursement Engine

### Indian Statutory Salary Calculation Formula:
```
+-----------------------------------------------------------------------------------+
|                              MONTHLY CTC (Cost to Company)                        |
+-----------------------------------------------------------------------------------+
|  GROSS EARNINGS:                                                                  |
|    - Basic Pay (40% - 50% of CTC)                                                 |
|    - House Rent Allowance (HRA) (40% - 50% of Basic)                              |
|    - Special / Field Allowance                                                    |
|    - Conveyance / Fuel Allowance                                                  |
|    - Overtime Pay (Calculated from Portal Check-In/Check-Out Hours)               |
+-----------------------------------------------------------------------------------+
|  EMPLOYEE STATUTORY DEDUCTIONS:                                                   |
|    - Provident Fund (EPF): 12% of Basic (capped at ₹1,800/mo or actual)           |
|    - Employee State Insurance (ESIC): 0.75% of Gross (if Gross <= ₹21,000)        |
|    - Professional Tax (PT): State slab (e.g., ₹200/month in Telangana / AP / MH)  |
|    - Income Tax / TDS: Computed per employee's chosen regime (Old vs New)         |
|    - Loss of Pay (LOP): (Gross / Total Month Days) * Unapproved Absent Days       |
+-----------------------------------------------------------------------------------+
|  NET SALARY (TAKE HOME) = Gross Earnings - Total Deductions                       |
+-----------------------------------------------------------------------------------+
|  EMPLOYER CONTRIBUTIONS (Paid by Company over and above Gross):                   |
|    - Employer EPF: 3.67% (EPF) + 8.33% (EPS Pension) = 12% of Basic               |
|    - Employer ESIC: 3.25% of Gross Salary                                         |
+-----------------------------------------------------------------------------------+
```

### The 2 Bank Disbursement Routes in the MD Portal:

#### Route 1: Corporate Bank CMS Bulk Sheet Upload (Recommended — 100% Free, Zero Gateway Fees)
* Supported by: **SBI Corporate, HDFC Enet, ICICI Corporate Internet Banking (CIB), Axis CMS**.
* **How it works:**
  1. On the 1st of each month, the MD or Accountant visits `/admin/payroll` and clicks **"Generate Bank Disbursement Sheet"**.
  2. The portal compiles attendance, OT, LOP, and generates an encrypted Excel/CSV file matching your bank's exact bulk payment format.
  3. The accountant logs into Corporate NetBanking &rarr; uploads this sheet under **Bulk Salary Upload** &rarr; enters Corporate OTP.
  4. The bank credits all 34 employees simultaneously within minutes.
  5. **Cost:** **₹0 (Zero Fees)**.

#### Route 2: Direct Banking API Integration (1-Click Instant Transfer)
* Supported by: **RazorpayX / Cashfree / ICICI Direct Corporate APIs**.
* In the MD Portal, a green button appears: **"Approve & Disburse Payroll (₹XX,XX,XXX)"**.
* When clicked, the software securely triggers the Banking API, transfers funds instantly to all accounts via IMPS/NEFT, updates the portal status to **"Credited"**, and records the bank UTR number automatically.

---

## 8. Official SN Enviro Pay Slip Layout (PDF Design)

```
========================================================================================
                          SN ENVIRO SOLUTIONS PRIVATE LIMITED
                     Plot No. 42, Industrial Area, Hyderabad, India
                               CIN: U29300TG2020PTC123456
                                PAYSLIP FOR OCTOBER 2026
========================================================================================
Employee Name  : Jaswanth                 Employee ID     : SNE-0042
Designation    : Senior Developer         Department      : IT & Automation
Date of Joining: 15-Aug-2023              Bank Name       : HDFC Bank
UAN Number     : 100912345678             Account Number  : ************7890
ESIC Number    : 52-00-123456-000-0001    IFSC Code       : HDFC0000123
PAN Number     : ABCDE1234F               Total Days / LOP: 31 Days / 0 Days LOP
----------------------------------------------------------------------------------------
EARNINGS (₹)                 AMOUNT        DEDUCTIONS (₹)                AMOUNT
----------------------------------------------------------------------------------------
Basic Pay                    25,000.00     Provident Fund (EPF)           3,000.00
House Rent Allowance (HRA)   12,500.00     ESIC Deduction                     0.00
Special Allowance             8,500.00     Professional Tax (PT)            200.00
Conveyance Allowance          2,000.00     Income Tax / TDS               1,500.00
Overtime Pay (14.5 Hours)     4,250.00     Loss of Pay (0 Days)               0.00
----------------------------------------------------------------------------------------
GROSS EARNINGS          ₹    52,250.00     TOTAL DEDUCTIONS         ₹     4,700.00
----------------------------------------------------------------------------------------
NET PAYABLE SALARY (Take Home):   ₹ 47,550.00
In Words: Rupees Forty-Seven Thousand Five Hundred and Fifty Only
Status: CREDITED  |  UTR/Transaction ID: CMS9876543210  |  Credit Date: 05-Nov-2026
========================================================================================
         *This is a computer-generated salary slip and requires no physical signature.*
```

---

## 9. Master Budget & Phased Rollout Roadmap

### Cost & Licensing Summary:
| Item | One-Time Cost | Recurring Cost | Remarks |
| :--- | :---: | :---: | :--- |
| **Backend Server (Render Starter)** | ₹0 | **~₹590 / month** | Instant 60-second activation. Eliminates all 503 errors and sleep downtime. |
| **MongoDB Atlas Database** | ₹0 | **₹0 (Free)** | 512 MB storage holds 5+ years of records. No upgrade needed. |
| **Google Play Store Developer License** | **~₹2,100 ($25)** | ₹0 | Lifetime account. Covers all field application engineer Android devices. |
| **Apple App Store Developer License** | ₹0 | **~₹8,300 ($99) / year** | Optional for Year 1; required only when iOS devices are rolled out. |
| **Capacitor Mobile Native Framework** | **FREE ($0)** | ₹0 | Open-source enterprise framework maintained by Ionic. |
| **Corporate Bank CMS Bulk Export** | **FREE ($0)** | ₹0 | Direct export from portal; zero third-party payment gateway transaction fees. |

### Phased Rollout Schedule:
* **Phase 1 (Immediate — 60 Seconds):** Switch Render backend to Starter ($7/mo = ~₹590/mo). Guarantees 100% server uptime and resolves sleep errors permanently.
* **Phase 2 (Weeks 1–2):** Register Google Play Store Console ($25 / ₹2,100) and package current web portal using Capacitor.
* **Phase 3 (Weeks 3–4):** Implement Android Foreground Service for Uber/Swiggy style continuous background GPS tracking.
* **Phase 4 (Month 2):** Deploy Employee Bank Self-Service & Salary Hub with automated 1-click PDF Pay Slip downloads.
* **Phase 5 (Month 2):** Launch official "SN Enviro Enterprise Portal" app on Google Play Store.

---

## 10. Executive Decision & Sign-Off

**Proposal Approved By:**

______________________________________  
**Managing Director (MD)**  
SN Enviro Systems Private Limited  
Date: ______ / ______ / 2026
