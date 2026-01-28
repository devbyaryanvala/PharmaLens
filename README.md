# PharmaLens v2 - Setup and Run Guide

This guide details the steps to set up and run the PharmaLens v2 project on a new system. The project consists of a Node.js API backend (with Python services) and a React/Vite frontend.

## Prerequisites

Ensure you have the following installed on your system:
1.  **Node.js & npm** (Long Term Support - LTS version recommended)
    *   [Download Node.js](https://nodejs.org/)
2.  **Python 3.x** (Ensure it's added to your system PATH)
    *   [Download Python](https://www.python.org/)

---

## 1. Backend Setup (API)

The API is built with Express.js and manages data, search, and invokes Python scripts for trend analysis.

### Step 1.1: Navigate to the API Directory
Open your terminal and navigate to the `API` folder:
```bash
cd d:\AISummit_2026\FinalProject\PharmaLensv2\API
```
*(Adjust the path if you cloned usages a different location)*

### Step 1.2: Install Node.js Dependencies
Run the following command to install the required Node modules:
```bash
npm install
```

### Step 1.3: Install Python Dependencies
The backend uses a Python script (`trends_service.py`) which requires the `pytrends` library.
```bash
pip install pytrends
```
*Note: If `pytrends` is not installed, the service will run in "Mock Mode" and return simulated data.*

### Step 1.4: Start the API Server
Start the backend server:
```bash
node server.js
```
*   The server will start on **http://localhost:3000**
*   It will also be accessible via your network IP.

---

## 2. Frontend Setup (PharmaSynapse UI)

The frontend is a modern web app built with React, Vite, and TailwindCSS.

### Step 2.1: Navigate to the UI Directory
Open a **new** terminal window (keep the API running) and navigate to the UI folder:
```bash
cd d:\AISummit_2026\FinalProject\PharmaLensv2\pharmasynapse-ui\pharmasynapse-ui
```

### Step 2.2: Install Frontend Dependencies
Install the required packages:
```bash
npm install
```

### Step 2.3: Start the Development Server
Run the Vite development server:
```bash
npm run dev
```
*   The application will typically start on **http://localhost:5173** (check the terminal output for the exact URL).

---

## 3. AI Configuration (Ollama)

The "Ask AI" feature requires a local LLM running via Ollama.

### Step 3.1: Install Ollama
Download and install Ollama from [ollama.com](https://ollama.com/download).

### Step 3.2: Pull a Model
Open a terminal and pull a standard model (e.g., Llama 3):
```bash
ollama pull llama3
```

### Step 3.3: Configure the API
By default, the project might be configured for a specific model name. You need to match it to the one you installed.

1.  Open `API/services/ollamaService.js`.
2.  Locate the line:
    ```javascript
    const MODEL_NAME = 'gpt-oss:120b-cloud';
    ```
3.  Change it to the model you pulled (e.g., `'llama3'`):
    ```javascript
    const MODEL_NAME = 'llama3';
    ```

### Step 3.4: Start Ollama
Ensure Ollama is running in the background. You can verify this by visiting [http://localhost:11434](http://localhost:11434) or running:
```bash
ollama serve
```

---

## 4. Verify the Setup

1.  **Open the App**: Go to `http://localhost:5173` in your browser.
2.  **Test Search**: Try searching for a medicine (e.g., "Paracetamol").
    *   This confirms communication with the API (`http://localhost:3000`).
3.  **Test AI**: Use the "Ask AI" or "Analyze" feature. If effective, the API logs will show the prompt being sent to Ollama.

---

## Troubleshooting

*   **"command not found"**: Ensure Node.js and Python are in your system PATH.
*   **API Connection Error**: Make sure the API server is running on port 3000 before starting the frontend.
*   **Python Errors**: Check if `pip install pytrends` was successful. You can test the script manually:
    ```bash
    cd API/python_services
    python trends_service.py "dolo"
    ```
