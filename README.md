# 🌍 3D Interactive Globe

Welcome to **3D Globe**—a sleek, interactive 3D globe visualization built with Next.js, TypeScript, and globe.gl. This project brings a minimal yet engaging globe experience, styled with TailwindCSS and ready for future enhancements.

![3D Globe Preview](https://raw.githubusercontent.com/MrJs6781/3d-globe/refs/heads/master/screenshots/globe-preview.png)

## 🚀 Live Demo

Check it out live: [https://3d-globe-three.vercel.app/](https://3d-globe-three.vercel.app/)

## ✨ Features

- **Interactive Globe**: Hover over countries to see them elevate (0.06 to 0.12) and change color (white to #0085D4).
- **Tooltips**: Hover to view country names, ISO codes, and flags in a stylish cyan tooltip.
- **Auto-Rotation**: Spins at 0.75 speed, pausing on hover or selection.
- **Country List**: A scrollable list of countries with flags, clickable to focus the globe.
- **Smooth Transitions**: Click a country in the list for a 1-second smooth rotation to its location, with orange highlight (#FF5733) and elevated altitude (0.15).
- **Click Events**: Click a country on the globe to log its details—more interactivity to come!
- **Fixed Size**: Globe rendered at 600x600px for a clean, centered display.

## 🛠 Tech Stack

- **Next.js 15**: Client-side rendering for this interactive component.
- **TypeScript**: Type-safe code for better maintainability.
- **globe.gl**: Lightweight 3D globe rendering.
- **TailwindCSS**: Utility-first CSS for rapid styling.
- **D3.js**: Included for future data-driven features.

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MrJs6781/3d-globe.git
   cd 3d-globe
   ```
