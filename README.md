# Orb Galaxy Random Chooser 🌌

A futuristic random choice generator where your options turn into glowing planets that collide in a dramatic **Battle of Planets** until a single winner emerges.

Let the galaxy decide for you.

---

## 🔗 Live Demo & Source Code

**Live App:**  
https://stathisch99.github.io/orb-galaxy-random-chooser/

**Source Code:**  
https://github.com/stathisch99/orb-galaxy-random-chooser

---

## ✨ Features

### 🌍 1. Battle of Planets Animation

Your options become floating planets that orbit, collide, explode into particles, and one survives.  
Smooth animations + multiple drifting patterns.

### 🎨 2. Multiple UI Themes

Choose between:

- **Galaxy** (default)
- **Solar System**
- **Neon Grid**

Themes update instantly and are saved automatically.

### 🔊 3. Optional Sound Effects

Powered by the Web Audio API:

- Battle start sound
- Knockout sound
- Winner chime

A “Sound On/Off” toggle is available on the main page.

### 📜 4. Full Battle History

Stored in `localStorage`, including:

- Every battle
- Winner
- Timestamp
- Theme used
- Included options

The History page provides:

- Total battles
- Unique winners
- Most frequent winner
- Most used theme
- Filters and sorting

### 🔁 5. Replay Past Battles

On the History page, click **“Use on Galaxy page”** to:

- Load the same options
- Apply the same theme
- Return to the main page to battle again

### 📱 6. Fully Responsive

Designed to look clean on:

- Desktop
- Tablet
- Mobile

### 🎇 7. Particle Explosions

Each losing planet bursts into particles with random movement directions and strengths.

---

## 🧰 Tech Stack

- **HTML5**
- **CSS3** (glassmorphism, gradients, animations)
- **JavaScript (vanilla)**
- **Web Audio API**
- **LocalStorage**
- **GitHub Pages** (hosting)

---

## 📁 Project Folder Structure

orb-galaxy-random-chooser/
│
├── index.html # Main app (battle of planets)
├── history.html # Battle history & statistics
│
├── assets/
│ ├── css/
│ │ ├── orb-galaxy/
│ │ │ └── style.css
│ │ └── history/
│ │ └── style.css
│ │
│ ├── js/
│ │ ├── orb-galaxy/
│ │ │ └── main.js
│ │ └── history/
│ │ └── main.js
│ │
│ └── img/ # Optional images (if any)
│
└── README.md

Each page loads **only its own CSS and JS**, keeping things clean and tutorial-friendly.

---

## 📦 Future Improvements

- Additional themes (Cyberpunk, Retro Arcade, Minimal Light)
- Export/Import history to JSON
- “Quick Battle” button
- Auto-run battle on Enter
- Saving named presets (e.g. “Food”, “Weekend Plans”)

---
