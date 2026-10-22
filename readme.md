# 🚖 Route Ka — Traveler Matching Platform

**Route Ka** is a real-time matching engine designed to help travelers using ride services (Uber, Bolt, etc.) connect with others on similar routes. By matching users within a 1-mile radius, Route Ka facilitates ride-sharing to significantly reduce travel costs and urban congestion.

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

### 2. backend configurations

-cd server
-composer install
-cp .env.example .env
-php artisan key:generate
-php artisan migrate --seed
-php artisan storage:link

### 3. Frontend configurations

-cd ../client
-npm install
-cp .env.example .env

### 4 . env variables

#### frontend

VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Route-Ka
VITE_ENVIRONMENT=local
VITE_MAPTILLER_KEY= your key
VITE_REVERB_APP_KEY= your key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=6001
VITE_REVERB_SCHEME=http

#### backend

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=route-ka-complete
DB_USERNAME=your user
DB_PASSWORD=your password

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=reverb
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
JWT_SECRET= your key

BROADCAST_DRIVER=reverb
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your ID
REVERB_APP_KEY=your key
REVERB_APP_SECRET=your secrete

REVERB_HOST=0.0.0.0
REVERB_PORT=6001
REVERB_SCHEME=http

### 🏃 Running Locally

To run the full ecosystem, you will need 4 terminal windows:

#### Backend server

API Server: php artisan serve

WebSocket Server: php artisan reverb:start

Job Processor: php artisan queue:listen

#### Frontend Server:

npm run dev

### 🌐 Hosting & Deployment

#### Backend (Server)

Requirements: A VPS (DigitalOcean, AWS, or Laravel Forge) with a process manager like Supervisor.

Supervisor Config: You must keep reverb:start and queue:listen running as background processes.

SSL: WebSockets require wss:// for production. Use Nginx as a reverse proxy to handle SSL termination.

#### Frontend (Static Hosting)

Platforms: Vercel, Netlify, or GitHub Pages.

Build: Run npm run build and point the hosting provider to the dist folder.

Env Variables: Ensure your production API URLs are set in the hosting provider's dashboard.

BROADCAST_CONNECTION=reverb
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_API_URL=http://localhost:8000/api
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
