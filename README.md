# Int-Project-and-Virtual-School-Search-for-and-Answer
is a high-efficiency Google Chrome Extension designed to automate the process of finding exam answers and educational content directly from a browser tab. Built on the modern

An interactive, floating PiP (Picture-in-Picture) styled Chrome Extension designed to scrape or manually input keywords and query a Python backend hosted locally or on an AWS EC2 instance. It helps parse exam/quiz content on screen instantly.

---

## 🚀 How It Works (Architecture)

The extension relies on a 3-part architecture using Chrome Extension Manifest V3:

Or

Click this link If you are using Android and IOS: http://54.206.105.0:5000/app

----------------------------------------------------------------------------------------------------------------------------------------------------------------------

1. **Content Script (`content.js`)**: Injected into the active web page. It builds a beautiful, customizable UI floating container directly on top of the DOM. It can automatically extract textual quiz questions using DOM selectors or harvest structural image names from questions.
2. **Background Script (`background.js`)**: Acts as a service worker network proxy. Because modern web security policies block cross-origin browser requests (CORS) from a content script straight to an API, the background script catches requests and dispatches them on behalf of the client.
3. **API Target Integration**: Routes JSON queries either via structural Localhost endpoints (`http://localhost:5000/search`) or cloud deployment instances running on AWS EC2 (`http://54.206.105.0:5000/search`).

---

## 📦 File Layout & Components

* **`manifest.json`**: Sets up permissions (`activeTab`, `scripting`, specific network host clearances), registers the background service worker, and defines `content.js` rule configurations.
* **`background.js`**: Listens for extension icon clicks to fire runtime context commands, processes programmatic fetch events, and appends the essential bypass `ngrok-skip-browser-warning` parameter headers.
* **`content.js`**: Renders the complete HTML/CSS structural overlay, executes layout drag handling math bounds, handles smart dual-selector extraction parsing rules, and populates interactive matching results dynamically with pagination controls.

---

## 🛠️ Installation & Setup

### 1. Prerequisites
Make sure your Python server or API backend is actively running. 
* If running locally, verify it's listening on port `5000`.
* If using the cloud instance, ensure the AWS EC2 public IP (`54.206.105.0`) is online and accessible.

### 2. Loading into Google Chrome
1. Download or clone this project repository folder to your computer.
2. Open Google Chrome and navigate to: `chrome://extensions/`
3. Toggle the **"Developer mode"** switch on in the upper-right corner.
4. Click on **"Load unpacked"** in the top-left area.
5. Select the root folder containing `manifest.json`, `background.js`, and `content.js`.

---

## 📖 How to Use

### Step 1: Open the Interface
Click the **Discord Search** extension icon inside your Chrome extensions toolbar to toggle the floating widget on or off.

### Step 2: Choose Your Server Environment
At the top of the interface box, select your preferred backend destination:
* **🌐 Remote (EC2)**: Connects to the hosted cloud server.
* **🖥️ Localhost (5000)**: Connects to your local machine backend setup.

### Step 3: Searching for Results

You can search using two different modes by toggling the tabs in the UI:

#### ⚡ Mode A: Auto Tab (Smart Extract)
1. Click the **"ดึงโจทย์ & ค้นหา"** button.
2. The extension automatically looks for text inside popular quiz selectors or looks for an image name inside your view frame.
3. **Smart Interaction Split**: If the extension detects *both* readable text and an image on the page, it presents interactive chips (**📝 ข้อความ** / **🖼️ รูปภาพ**) letting you choose exactly what to query.

#### ✏️ Mode B: Manual Tab
1. Select the **"Manual"** tab.
2. Type or paste your custom keyword into the text field.
3. Press **Enter** or click **"ค้นหา"** to send the request.

### Step 4: Reading Answers & Pagination
* **Single Matches**: Displayed cleanly inside the preview panel container.
* **Multiple Subject Categorization**: If the server indicates matching questions spread across multiple categories/subjects, the UI will dynamically list them as selection filter buttons. Choose a subject or click **"แสดงทั้งหมด"** to see everything.
* **Pagination Controls**: Use the `◀ ก่อนหน้า` (Previous) and `ถัดไป ▶` (Next) buttons to cycle through multiple records easily.

---

## 📌 Features & UI Controls

* **Draggable Overlay**: Grab the colored top banner bar header to move the interface anywhere on your screen.
* **Responsive Dimensions**: Drag the small indicator triangle on the bottom right corner (`⇲`) to scale the panel size to your liking.
* **CORS Warning Bypass**: Automatically flags connection headers to bypass proxy interstitial alerts.
