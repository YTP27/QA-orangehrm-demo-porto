# OrangeHRM QA Portfolio

This repository contains both **manual testing** and **automation testing** projects for the [OrangeHRM Open Source Demo](https://opensource-demo.orangehrmlive.com/) web application. It is designed as part of a QA Engineer portfolio to showcase skills in test planning, execution, and automation using modern tools.

---

## 📁 Folder Structure

```
📦 Orange HRM
├── 📂 manual-test
│   ├── Admin Test Case - OrangeHRM.xlsx
│   ├── Buzz Test Case - OrangeHRM.xlsx
│   ├── Leave Test Case - OrangeHRM.xlsx
│   ├── My Info Test Case - OrangeHRM.xlsx
│   ├── Recruitment Test Case - OrangeHRM.xlsx
│   └── Time Test Case - OrangeHRM.xlsx
├── 📂 automation-test
│   └── 📂 playwright
│       ├── playwright.config.js
│       ├── package.json
│       └── 📂 tests
│           ├── 📂 login
│           ├── 📂 admin
│           ├── 📂 dashboard
│           ├── 📂 leave
│           ├── 📂 myinfo
│           ├── 📂 pim
│           ├── 📂 recruitment
│           └── 📂 time
└── .gitignore
```

---

## ✅ Manual Test

Berisi dokumen test case dalam format Excel yang mencakup berbagai fitur pada OrangeHRM seperti:

* Login
* Dashboard
* Admin
* Leave
* Recruitment
* My Info
* Time

Setiap file mencakup:

* Test Scenario
* Test Steps
* Expected Result
* Status

---

## 🤖 Automation Test

Dibuat menggunakan [**Playwright**](https://playwright.dev/) dengan JavaScript.

### 📌 Struktur Test:

* **Positive Test Cases**
* **Negative Test Cases**
* Dikelompokkan berdasarkan modul OrangeHRM

### 🛠 Tools & Tech:

* Node.js
* Playwright Test Runner

### ▶️ Cara Menjalankan

```bash
cd automation-test/playwright
npm install
npx playwright test
```

Menjalankan test tertentu:

```bash
npx playwright test -g "TC_PD_010"
```

Melihat hasil video/screenshot:

```bash
npx playwright show-report
```

---

## 🧾 .gitignore

Sudah disetting agar `node_modules`, `test-results`, dan file auto-generated lainnya tidak di-commit ke repository.

---

## 💡 Author

**Yudhooooooo**  
QA Engineer Enthusiast · Open to Collaborations  
[GitHub](https://github.com/YTP27) | [LinkedIn](https://www.linkedin.com/in/yudho-tri-putranto-598ab6221/)

---

## 🏁 Status

Project ongoing — akan terus diperbarui dengan modul baru dan test tambahan.
