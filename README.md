# 👑 Mani's Elite Makeover — Premium Beauty Studio Application

Welcome to the official repository for **Mani's Elite Makeover**, a state-of-the-art web application crafted for a luxury beauty makeover brand. Built on a premium, bespoke **Gold & Black theme**, the application offers a seamless booking flow, a robust customer portal with dynamic parlor/home services, and a comprehensive administrative command center.

---

## 🌟 Key Features

### 🎨 Design & Aesthetics
* **Bespoke Luxury Theme:** Harnesses custom HSL gold tones, dark glassmorphism, smooth animations, and Google Fonts typography.
* **3D Gold Crown Logo:** Includes a custom-built, 3D animated golden crown brand logo at the header.
* **Responsive Layouts:** Flawlessly adaptive across mobile, tablet, and desktop viewports.

### 🏠 Customer Portal
* **Dynamic Services Card Selector:** Features a premium dual-card selector allowing customers to toggle between **🏠 Home Visit Service** and **🏪 Salon Visit**.
* **Real-time Price Tag Synchronization:** Toggling between parlor and home visits instantly updates the rates of all 14 services on the grid.
* **Cinematic Booking Cards:** Displays beautiful service header banners at the booking stage.
* **Active Bookings Tracker:** Allows customers to view, monitor, and cancel upcoming appointments.

### 💳 End-to-End Razorpay Checkout
* **Live Razorpay SDK Integration:** Integrated with the official Razorpay Checkout SDK.
* **Dynamic Pricing Capture:** Automatically reads selection tags and initiates transactions with the exact dynamic service rate.
* **Simulated Checkout Support:** Runs fallback transaction loops dynamically when local key parameters are bypassed.

### 🛡️ Complete Admin Control Panel
* **Slot & Hours Manager:** Set open/closed days, start hours, and close hours per weekday.
* **Service Manager with Binary Image Upload:** Add/Disable services directly. Supports local binary **Image File Uploads** (uses `multer` middleware) directly to the server rather than typing raw links manually.
* **Interactive Booking Tracker:** View today's schedule, monitor active/historical bookings, and update reservation status.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React (v19), TypeScript, Vite (v8), TailwindCSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express (v5), Mongoose, JWT (bcryptjs), Multer, Helmet, Express Rate Limit |
| **Database** | MongoDB Atlas (Cloud) |
| **Payments** | Razorpay Checkout SDK |

---

## 📂 Project Directory Structure

```bash
c:\Beauty Project
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Core route handlers (Auth, Bookings, Services)
│   ├── middleware/         # Auth guards, error handlers, Multer file upload configurations
│   ├── models/             # Mongoose schemas (User, Booking, Service, BusinessHour)
│   ├── routes/             # Express routes mapped to resources
│   ├── scripts/            # Administrative utilities (seeders, user roles elevation)
│   ├── uploads/            # Locally hosted static image storage
│   ├── server.js           # Main Express server script
│   └── .env                # Backend environment configuration
└── frontend/
    ├── src/
    │   ├── api/            # Axios API instances & request interceptors
    │   ├── components/     # Reusable blocks (layout, admin widgets, booking selectors)
    │   ├── context/        # Auth state provider (tokenKey: manis_auth_token)
    │   ├── lib/            # Shared queries, seed definitions, booking logic
    │   ├── pages/          # Primary views (Landing page, Admin/Customer Dashboards, Auth)
    │   ├── types/          # Strict TypeScript interface declarations
    │   └── main.tsx        # React entrypoint
    ├── package.json        # Frontend dependencies & dev scripts
    └── .env                # Frontend environment configuration
```

---

## 🚀 Getting Started & Local Installation

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (comes bundled with Node.js)
* **MongoDB Connection URI**

---

### Step-by-Step Setup

### 1. Configure the Backend Environment
Navigate into the `backend` folder and open the `.env` file. Populate it with your database connection and secret parameters:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/test?appName=Beauty-Project
JWT_SECRET=beautysecretkey

# Razorpay live keys:
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

### 2. Configure the Frontend Environment
Create a `.env` file in the root of the `frontend` folder and set the backend API endpoint and your public Razorpay Key ID:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_key_id_here
```

### 3. Load & Seed Rate Card Services
We have provided a custom seeder script to populate your MongoDB collection with all 14 official Rate Card services (e.g. Eyebrows, Facials, Hair Color, Bridal Makeup), complete with their individual salon and home visit pricing:
```bash
# Run inside the backend folder
node scripts/seedRateCardCorrected.js
```

### 4. Administrative Command Center (Manage Users & Roles)
We created a custom command-line utility to inspect registered users, elevate accounts to Administrators, or demote them back to regular Customers:
```bash
# Run inside the backend folder

# 1. List all registered users
node scripts/manageAdmin.js list

# 2. Promote an existing user to Admin (e.g. 9640449896)
node scripts/manageAdmin.js promote 9640449896

# 3. Demote any Admin back to Customer (for testing the Customer Dashboard)
node scripts/manageAdmin.js demote 9640449896

# 4. Create a new Admin from scratch
node scripts/manageAdmin.js create "Mani Elite Admin" 9640449896 admin123
```

---

## ⚡ Running the Applications

Open two terminals in your IDE to run both servers concurrently:

### Terminal A (Start Backend Dev Server)
```bash
cd backend
npm run dev
```
*(Runs on [http://localhost:5000](http://localhost:5000) using `nodemon` for automatic reloading).*

### Terminal B (Start Frontend Dev Server)
```bash
cd frontend
npm run dev
```
*(Runs on [http://localhost:5173](http://localhost:5173) or fallback port).*

---

## 💻 Testing Live Customer Logins
* **Registering Customer Accounts:** Registering any new account via the frontend signup portal automatically saves them under the `customer` role, granting immediate access to the **Customer Dashboard**.
* **Pre-configured Admin Account:**
  * **Phone:** `9640449896`
  * **Password:** `admin123`
  * Elevating or demoting this number dynamically updates access levels to either the Customer Panel or the Admin Panel instantly!

---

💖 *Mani's Elite Makeover — Professional Beauty Services at Your Doorstep.*
