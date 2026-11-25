# Hotel Listing Management System

A full-stack, responsive web application for managing hotel listings inspired by a classic Bootstrap / MDB eCommerce directory layout. Built with **ReactJS**, **Redux Toolkit**, **Node.js**, **Express**, and **PostgreSQL** using native parameterized SQL queries (no ORM).

---

## 🎨 UI & Design Implementation

This application strictly implements the requested Bootstrap-style directory layout:
- **Clean White Navigation Bar**: Brand logo on the left, central search bar, and user action buttons (Wishlist with badge, My Bookings with badge, Sign In) on the right.
- **Full-Width Blue Header Banner (`#3B73C5`)**: Rich blue background featuring page title (*Hotels*), breadcrumb navigation (*Home > Hotels > Available Hotels*), and a subtitle (*Find your perfect stay*).
- **Two-Column Main Content Layout**:
  - **Left Sidebar**: White card filter panel with collapsible sections for Related Categories, Price Filter (Min/Max inputs, Apply & Reset buttons), Star Rating filters, Location search, and Amenities checkboxes.
  - **Right Listing Area**: Results counter, Sort dropdown (*Best Match*, *Price: Low to High*, *Price: High to Low*, *Highest Rated*), View mode switcher (*List View* & *Grid View*), and a primary "+ Add Hotel" button.
- **Compact Horizontal Hotel Cards**:
  - **Left**: Fixed-ratio hotel image with `object-fit: cover` and category badge.
  - **Center**: Hotel title link, star rating with reviews count, location with pin icon, description snippet, coordinates badge (`📍 Lat/Lng`), and amenity pills.
  - **Right**: Nightly rate (`$XXX / Per Night`), "View Details" primary button, "Edit" button, and "Delete" button.
- **Detail Page with OpenStreetMap & Leaflet**: Interactive map pinned to the hotel's exact geographic coordinates, with browser geolocation fallback.

---

## 🛠️ Technology Stack

### Frontend
- **ReactJS (v18)** with **Vite**
- **Redux Toolkit & React Redux**: State management for hotels, filters, pagination, modals, and toasts
- **React Router DOM (v6)**: Client-side routing (`/` and `/hotels/:id`)
- **Axios**: HTTP client for API communications
- **React Helmet Async**: Dynamic SEO meta tags and social sharing attributes
- **Leaflet & React Leaflet**: Interactive map with OpenStreetMap tiles
- **Bootstrap 5 & Custom CSS**: Pixel-aligned Bootstrap styling with `#3B73C5` blue accents
- **Lucide React**: Clean vector iconography

### Backend
- **Node.js & Express.js**: RESTful API server
- **PostgreSQL**: Relational database with parameterized native SQL queries via `pg` (`node-postgres`)
- **Multer**: Multipart/form-data handler for image uploads with MIME validation and 5MB size limits
- **Integrated Fallback**: Embedded SQL query engine (`pg-mem`) with persistent JSON storage synchronization so the app runs out-of-the-box even when a local PostgreSQL server is unavailable

---

## 📁 Project Structure

```
d:\abi\
├── backend/
│   ├── config/
│   │   ├── db.js              # Native PostgreSQL pool with fallback and schema sync
│   │   └── seedData.js        # High-quality starter hotels
│   ├── controllers/
│   │   └── hotelController.js # RESTful CRUD logic with parameterized SQL
│   ├── middleware/
│   │   ├── errorHandler.js    # Centralized API error handling
│   │   └── upload.js          # Multer storage configuration and MIME validation
│   ├── routes/
│   │   └── hotelRoutes.js     # API route definitions
│   ├── uploads/
│   │   └── hotels/            # Local storage for uploaded hotel images
│   ├── .env.example           # Environment template
│   ├── .env                   # Local configuration
│   ├── package.json
│   ├── schema.sql             # PostgreSQL schema creation script
│   └── server.js              # Express app entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js       # Redux Toolkit store
│   │   ├── components/
│   │   │   ├── ConfirmDeleteModal.jsx
│   │   │   ├── HotelCard.jsx
│   │   │   ├── HotelForm.jsx  # Reusable form component for Add and Edit
│   │   │   ├── HotelList.jsx
│   │   │   ├── HotelSidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── ToastNotification.jsx
│   │   ├── features/
│   │   │   ├── hotels/
│   │   │   │   └── hotelsSlice.js
│   │   │   └── ui/
│   │   │       └── uiSlice.js
│   │   ├── pages/
│   │   │   ├── HotelDetailPage.jsx
│   │   │   ├── HotelListingPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   └── api.js         # Axios instance and endpoints
│   │   ├── styles/
│   │   │   └── custom.css     # MDB / Bootstrap styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **pnpm** or **npm**
- *(Optional)* **PostgreSQL** (v12 or higher). If PostgreSQL is not installed or running, the server automatically uses the integrated native SQL engine with file persistence, ensuring zero setup friction.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment variables in `backend/.env`:
   ```ini
   PORT=5000
   NODE_ENV=development
   PGUSER=postgres
   PGHOST=localhost
   PGDATABASE=hotel_management
   PGPASSWORD=postgres
   PGPORT=5432
   ```
4. If using local PostgreSQL, create the database:
   ```sql
   CREATE DATABASE hotel_management;
   ```
   *(The server will automatically execute `CREATE TABLE IF NOT EXISTS hotels` and seed initial records on startup).*
5. Start the backend server:
   ```bash
   pnpm start
   ```
   The backend API will run on `http://localhost:5000`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the Vite development server:
   ```bash
   pnpm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔌 API Endpoints Reference

All endpoints use standard JSON payloads and native parameterized SQL queries:

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/hotels` | Fetch hotels with filtering, sorting, pagination | `search`, `minPrice`, `maxPrice`, `category`, `rating`, `location`, `amenities`, `sortBy`, `page`, `limit` |
| **GET** | `/api/hotels/:id` | Fetch single hotel by ID | None |
| **POST** | `/api/hotels` | Create new hotel listing | `multipart/form-data`: `title`, `description`, `price`, `latitude`, `longitude`, `category`, `location`, `rating`, `amenities`, `image` (file) |
| **PUT** | `/api/hotels/:id` | Update existing hotel | `multipart/form-data`: optional replacement image file or updated fields |
| **DELETE**| `/api/hotels/:id` | Delete hotel & unlinks uploaded image file | None |
| **GET** | `/api/health` | Health check endpoint | None |

---

## 🧪 Database Schema (`hotels` Table)

```sql
CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500) NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  rating DECIMAL DEFAULT 4.5,
  category VARCHAR(100) DEFAULT 'Luxury Hotels',
  location VARCHAR(255) DEFAULT 'New York, USA',
  amenities TEXT DEFAULT 'Free Wi-Fi, Swimming Pool, Parking, Restaurant, Air Conditioning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ♿ Accessibility & SEO
- **Semantic HTML5**: Formulated with `<header>`, `<nav>`, `<main>`, `<aside>`, `<article>`, `<section>`, and `<footer>`.
- **Dynamic Meta Tags**: Page titles, OpenGraph descriptions, and canonical metadata updated dynamically via `react-helmet-async`.
- **Alt Text**: Alt descriptions provided on every image.
- **Form Controls**: Explicit labels and `.invalid-feedback` ARIA descriptions for accessible error handling.

#   a b i  
 