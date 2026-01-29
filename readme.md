# 🚖 Route Ka — Traveler Matching Platform

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Route Ka** is a real-time matching engine designed to help travelers using ride services (Uber, Bolt, etc.) connect with others on similar routes. By matching users within a 1-mile radius, Route Ka facilitates ride-sharing to significantly reduce travel costs and urban congestion.

---

## 🚀 Core Features

### 🗺️ Intelligent Mapping

- **Precision Selection:** Click-to-select pins for pickup and drop-off.
- **Geolocation:** One-tap "Use My Location" functionality.
- **Smart Search:** Address autocomplete suggestions powered by MapTiler.

### 👥 Traveler Matching

- **The 1-Mile Logic:** Proprietary algorithm that identifies matches within a 1-mile radius of your route.
- **Instant Sync:** Real-time updates as new travelers enter the pool.

### 💬 Real-Time Coordination

- **Live Chat:** Instant messaging powered by **Laravel Reverb**.
- **Coordination Tools:** Dedicated chat rooms for matched pairs to finalize meeting points.
- **History:** Persistence of coordination details for future reference.

### 🎨 Modern Experience

- **Responsive:** Fully optimized for Mobile, Tablet, and Desktop.
- **Fast:** Sub-second UI updates using Vite and React.

---

## 🛠️ Technology Stack

| Layer         | Technology                                 |
| :------------ | :----------------------------------------- |
| **Frontend**  | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Maps**      | React Leaflet, MapTiler API                |
| **Backend**   | Laravel 11, PHP 8.2+                       |
| **Real-time** | Laravel Reverb (WebSockets)                |
| **Auth**      | JWT (JSON Web Tokens)                      |
| **Database**  | MySQL / PostgreSQL                         |

---

## 📂 Installation & Setup

### 1. Clone the Workspace

```bash
git clone [https://github.com/NixonOjiem/Route-Ka-Complete.git](https://github.com/NixonOjiem/Route-Ka-Complete.git)
cd Route-Ka-Complete
```
