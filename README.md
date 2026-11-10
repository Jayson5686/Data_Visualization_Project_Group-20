# CrashMetrics Australia (2011–2021)
### Swinburne COS30045 Data Visualisation Major Project
## This has been abandon due to remade of the design/prototype, Group_20 has created a newest Repo for the newer design [Abandon site]
An interactive, responsive, and accessible editorial data visualisation web application analyzing 410,000+ hospital admissions and 2,000,000+ bed days from the Australian Institute of Health and Welfare (AIHW) National Hospital Morbidity Database (NHMD).

---

## How to Run This App

Modern web browsers block loading local data files (`d3.csv()`) directly from `file:///` URLs due to CORS security rules. Therefore, the app must be served via any local HTTP server.

The site includes a language selector for English, Simplified Chinese, Malay, and Japanese. The selected language is saved in the browser and carried between the About, About Data, dashboard overview, and storyline pages. The dashboard overview links to four focused pages: National, Users & Age, States, and First Nations. Chart CSV downloads retain their original English column names and values.

### Option 1: Quick Double-Click (Windows)
Double-click **`start_app.bat`**. It will automatically spin up the local server and open your default browser to the dashboard at **`http://localhost:8000/index.html?dashboard=1`**. When the site is opened at its normal entry URL, it starts on the About page; use the About Data link to view the data information second.

### Option 2: Using Python (Windows, macOS, Linux)
Open a terminal in this project folder and run:
```bash
python -m http.server 8000
```
Then open your browser and navigate to: **`http://localhost:8000`**

### Option 3: Using VS Code Live Server
If you use Visual Studio Code:
1. Open this folder in VS Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and select **"Open with Live Server"**. To launch the dashboard directly, use `index.html?dashboard=1`.

### Option 4: Using Node.js (npx)
```bash
npx serve
```
or
```bash
npx http-server
```

---

## Project Structure

```
COS30045_Project/
├── index.html                  # Dashboard overview and storyline links
├── national.html               # Storyline 1: National trends
├── users-age.html              # Storyline 2: Road-user and age comparisons
├── states.html                 # Storyline 3: State and territory patterns
├── first-nations.html          # Storyline 4: First Nations patterns
├── css/
│   ├── style.css               # Core layout, editorial typography tokens, preloader
│   └── components.css          # Bento cards, pill toggles, sliders, SVG styling, tooltips
├── js/
│   ├── main.js                 # Global data loader, preloader coordinator, floating tooltip
│   ├── storyline1_national.js  # Storyline 1: National Trends & Data Break Callouts
│   ├── storyline2_groups.js    # Storyline 2: Linked Road-User & Age-Group Bars
│   ├── storyline3_states.js    # Storyline 3: Dual-Pane Heatmap Matrix & State Trajectory
│   └── storyline4_firstnations.js # Storyline 4: First Nations Longitudinal & Hatched n.p. Bars
├── data/                       # Verified AIHW Clean Datasets (CSV)
├── assets/                     # Hero photography & media assets
├── start_app.bat               # One-click Windows runner script
└── README.md                   # Setup guide
```
