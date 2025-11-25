
# Product Requirements Document: AquaLink (Malpe Meen)

**Version:** 2.0
**Date:** 2024-11-25
**Status:** In Development
**Author:** AI Assistant

---

## 1. Introduction

### 1.1. Executive Summary
AquaLink is a mobile-first web application designed to digitize the wholesale seafood trade, starting with the fisheries of Malpe, India. Under the brand "Malpe Meen Pvt Ltd," the platform will connect local fish suppliers (sellers) directly with commercial buyers, such as restaurants and retailers. By providing a centralized digital marketplace, AquaLink aims to solve inefficiencies in the traditional, fragmented fish market, creating greater market access for sellers and a more reliable supply chain for buyers. The core of the platform is built on simplicity, using phone-based OTP authentication to ensure ease of use for all parties.

### 1.2. Problem Statement
The traditional wholesale fish market in regions like Malpe is characterized by fragmentation, opacity, and a reliance on offline, relationship-based transactions. 
*   **For Sellers (Fisheries, Boat Owners):** Market reach is limited to their immediate physical location and existing contacts. There is no simple, scalable way to showcase their daily catch to a wider audience, leading to potential spoilage and price instability.
*   **For Buyers (Restaurants, Retailers):** Sourcing fresh, high-quality seafood requires visiting markets physically or managing relationships with multiple individual suppliers. This process is time-consuming, inconsistent, and lacks price transparency. There is no central place to view available stock in real-time.

### 1.3. Vision & Goal
**Vision:** To become the leading digital B2B marketplace for fresh seafood in coastal Karnataka, and eventually, India.
**Primary Goal (Phase 1):** Launch an MVP that successfully facilitates discovery and connection between fish sellers and buyers in the Malpe region. The focus is on validating the core value proposition: providing a simple, real-time platform for listing and finding fresh fish, with communication happening directly between users.

### 1.4. Business Objectives
*   Onboard at least 50 active sellers and 100 active buyers within the first 6 months of launch.
*   Facilitate an average of 30 new listings per day.
*   Achieve a high user retention rate by focusing on a simple and reliable user experience.

---

## 2. Target Audience & User Personas

### 2.1. Seller Persona
*   **Name:** Ramesh, a 45-year-old fishing boat owner in Malpe.
*   **Background:** Owns a small fleet of two boats. His daily operations are managed offline, and his sales rely on a few regular customers who visit the port. He is tech-savvy enough to use a smartphone for WhatsApp and calls but is not familiar with complex applications.
*   **Goals:** 
    *   Sell his catch quickly to avoid spoilage.
    *   Get the best possible price for his products.
    *   Find new, reliable buyers beyond his immediate vicinity.
*   **Frustrations:**
    *   "Sometimes I have a great catch, but my regular buyers don't need that much. The excess either sells for a very low price or is wasted."
    *   "I have no easy way of letting people know what I've caught until they call me or show up."

### 2.2. Buyer Persona
*   **Name:** Priya, a 35-year-old manager of a seafood restaurant in Udupi.
*   **Background:** Responsible for sourcing fresh ingredients daily. She currently relies on visiting the Malpe port early in the morning or calling several suppliers to check for availability and prices.
*   **Goals:**
    *   Source a consistent supply of high-quality, fresh fish.
    *   Compare prices from different suppliers easily.
    *   Save time in the procurement process.
*   **Frustrations:**
    *   "It's a huge waste of my morning to drive to the port, only to find they don't have the variety I need."
    *   "Prices change daily, and it's hard to know if I'm getting a fair deal without calling ten different people."

---

## 3. User Stories

### 3.1. Seller Stories
*   **US-S1:** As a seller, I want to sign up and create a profile using just my phone number, so I don't have to remember a password.
*   **US-S2:** As a seller, I want to create a fish listing quickly by filling out a simple form with details like fish name, quantity, and price.
*   **US-S3:** As a seller, I want to upload multiple photos of my catch directly from my phone's gallery or by using my phone's camera, so buyers can see the quality.
*   **US-S4:** As a seller, I want to see all my active listings on a dashboard, so I can manage my inventory.
*   **US-S5:** As a seller, I want to edit or delete my listings, so I can keep my information accurate.
*   **US-S6:** As a seller, I want to receive phone calls directly from interested buyers, so I can finalize the deal quickly.

### 3.2. Buyer Stories
*   **US-B1:** As a buyer, I want to sign up and log in with my phone number, so I can get started easily.
*   **US-B2:** As a buyer, I want to browse a feed of all available fish listings from different sellers, so I can see what's on the market today.
*   **US-B3:** As a buyer, I want to see key details on a listing card, like the fish photo, name, price, and seller, so I can scan options quickly.
*   **US-B4:** As a buyer, I want to filter listings by port or by a specific seller, so I can narrow down my search.
*   **US-B5:** As a buyer, I want to view a detailed page for a listing with more photos and information, so I can make an informed decision.
*   **US-B6:** As a buyer, I want to tap a button to call the seller directly, so I can negotiate and arrange a purchase.

---

## 4. Key Features (Functional Requirements)

### 4.1. Core Functionality: Authentication
*   **Requirement:** Users must register and log in using their phone number and a One-Time Password (OTP).
*   **Acceptance Criteria:**
    *   The system shall send an OTP via SMS to the user's provided phone number.
    *   The user must enter the correct OTP to be authenticated.
    *   The app must have separate, distinct portals and registration flows for Buyers and Sellers.
    *   A user's role (Buyer or Seller) is permanently assigned at first sign-up.

### 4.2. Seller Portal Features
*   **Feature: Seller Profile Management**
    *   **Requirement:** Sellers must be able to create and manage their profile.
    *   **Fields:** Contact Name, Company Name, Business Address, Company Logo.
    *   **Acceptance Criteria:** Profile information must be editable via an "Account Settings" dialog.
*   **Feature: Fish Listing Management (CRUD)**
    *   **Requirement:** A full CRUD interface for sellers to manage their listings.
    *   **Create:** A form to add a new listing with fields: Product Name, Description, Price (per kg, optional), Total Quantity (in tons, optional), Port of Origin, Boat Details. `brandName` is fixed to 'Malpe Meen Pvt Ltd'.
    *   **Media Upload:** Sellers can upload multiple photos or use the device camera. Maximum of 5 photos per listing.
    *   **Read:** Sellers can view all their active listings on their personal dashboard.
    *   **Update:** Sellers can edit all fields of an existing listing.
    *   **Delete:** Sellers can permanently remove listings.

### 4.3. Buyer Portal Features
*   **Feature: Buyer Profile Management**
    *   **Requirement:** Buyers must be able to create and manage their profile.
    *   **Fields:** Name, Contact Details, Place, Address, Profile Photo.
*   **Feature: Browse & Discover**
    *   **Requirement:** The main buyer dashboard must display a grid of all available fish listings, sorted with the most recent first.
    *   **Listing Card:** Must display: Primary Photo, Product Name, Seller Name, Price, and Listed Date.
*   **Feature: Filtering & Sorting**
    *   **Requirement:** Buyers must be able to filter listings.
    *   **Filters:**
        *   Filter by Port of Origin (Multi-select dropdown: Malpe, Mangalore, etc.).
        *   Filter by Seller (Dropdown populated with sellers who have active listings).
*   **Feature: Contact Seller**
    *   **Requirement:** On the listing detail page, a prominent "Call Seller" button must be present.
    *   **Action:** Clicking the button should initiate a phone call to the seller's registered phone number.

---

## 5. Non-Functional Requirements

*   **Performance:**
    *   The app should load in under 3 seconds on a standard 4G mobile connection.
    *   Listing images should be optimized to reduce load times without significant quality loss.
*   **Usability:**
    *   The interface must be intuitive for users with limited technical expertise.
    *   All primary actions (creating a listing, calling a seller) should be completable in 3 clicks or fewer from the dashboard.
*   **Security:**
    *   All user data must be stored securely.
    *   Firestore Security Rules must enforce that users can only edit their own profiles and listings.
*   **Reliability:**
    *   The application should have an uptime of 99.5%.
    *   OTP delivery should be reliable and fast (under 30 seconds).

---

## 6. Technical Stack

*   **Frontend:** Next.js with React (App Router) & TypeScript.
*   **Styling:** Tailwind CSS with ShadCN UI components.
*   **Backend:** Firebase
    *   **Authentication:** Firebase Authentication (Phone OTP).
    *   **Database:** Cloud Firestore.
    *   **Storage:** Firebase Storage for media uploads.
*   **Hosting:** Firebase App Hosting.

---

## 7. Data Models

*   **`Seller`:** Document ID is the Firebase Auth UID. Fields: `id`, `phoneNumber`, `contactName`, `companyName`, `email` (optional), `address`, `logoUrl`, `totalViews`, `totalCalls`.
*   **`Buyer`:** Document ID is the Firebase Auth UID. Fields: `id`, `phoneNumber`, `name`, `email` (optional), `place`, `address`, `photoUrl`.
*   **`FishListing`:** Contains denormalized seller data for performance. Fields: `id`, `sellerId`, `sellerName`, `sellerPhone`, `sellerAddress`, `mediaUrls` (array), `description`, `listedDate`, `productName`, `pricePerKg`, `portDetails`, `boatDetails`, `brandName`, `viewCount`, `callClickCount`, `totalQuantityInTons`.

---

## 8. Success Metrics (KPIs)

*   **User Adoption:**
    *   Number of new buyer & seller sign-ups per week.
    *   Total number of active users (users who have logged in within the last 30 days).
*   **Engagement:**
    *   Number of new listings created per day/week.
    *   Average number of listings per seller.
    *   Number of "Call Seller" button clicks.
    *   Number of listing detail page views.
*   **Retention:**
    *   Seller Churn Rate: Percentage of sellers who do not create a new listing in a 30-day period.
    *   Buyer Churn Rate: Percentage of buyers who do not log in within a 30-day period.

---

## 9. Future Considerations (Roadmap)

*   **Phase 2 (Post-MVP):**
    *   **In-App Chat:** Real-time messaging between buyers and sellers.
    *   **Ratings and Reviews:** Allow buyers to rate sellers and products.
    *   **Advanced Analytics:** Provide sellers with a more detailed dashboard showing views, calls, and popular listings.
*   **Phase 3 (Scale):**
    *   **Order Management System:** Enable buyers to place and track orders within the app.
    *   **Payment Gateway Integration:** Facilitate secure online payments.
    *   **Push Notifications:** Alert buyers about new listings from their favorite sellers.
    *   **Geographic Expansion:** Onboard sellers and buyers from other major ports.
