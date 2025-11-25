
# Product Requirements Document: AquaLink (Malpe Meen)

**Version:** 1.0
**Date:** 2024-11-25
**Status:** In Development

---

## 1. Introduction

### 1.1. Overview
AquaLink is a mobile-first web application designed to bridge the gap between local fish sellers and potential buyers. It serves as a dedicated digital marketplace, starting with the fisheries of Malpe, under the brand "Malpe Meen Pvt Ltd." The platform empowers sellers to effortlessly list their fresh catch and provides buyers with a streamlined way to discover, browse, and connect with sellers to purchase products.

### 1.2. Problem Statement
The traditional fish market is often fragmented and relies on offline communication, limiting the market reach for sellers and making it difficult for buyers to find a consistent and varied supply of fresh products. Sellers lack a simple, digital tool to showcase their inventory in real-time, and buyers have no central platform to view available stock from multiple fisheries.

### 1.3. Vision & Goal
The vision is to create the leading digital B2B marketplace for fresh seafood in the region. The primary goal of AquaLink is to digitize the wholesale fish trade, making it more efficient, transparent, and accessible for both sellers and buyers.

---

## 2. Target Audience

The platform serves two primary user roles:

*   **Sellers:** Local fisheries, boat owners, and wholesale fish suppliers who need a simple platform to list their products and connect with a broader market of buyers.
*   **Buyers:** Restaurant owners, hotel chains, retailers, and other businesses that need to source fresh fish directly from suppliers.

---

## 3. Key Features

### 3.1. Core Functionality: Authentication
The entire platform is built around a secure and simple phone-based authentication system.

*   **Phone OTP Login/Signup:** Users register and log in using their phone number and a one-time password (OTP). This eliminates the need for users to remember passwords.
*   **Role-Based Access:** The app features distinct, separate portals and registration flows for Buyers and Sellers. A user is designated as either a Buyer or a Seller upon their first sign-up.

### 3.2. Seller Features
*   **Seller Profile Management:**
    *   Create and manage a seller profile, including contact name, company name, business address, and a company logo.
    *   Profile information is accessible from a dedicated "Account Settings" dialog in the header.
*   **Fish Listing Management (CRUD):**
    *   **Create:** A simple form allows sellers to create new fish listings with details like product name, description, price per kg, total quantity (in tons), port of origin, and boat details.
    *   **Upload Media:** Sellers can upload multiple photos of their products from their device or capture them directly using their camera.
    *   **Read/View:** Sellers can view all their active listings on their personal dashboard.
    *   **Update:** Existing listings can be easily edited.
    *   **Delete:** Sellers can remove listings they no longer wish to display.
*   **Seller Dashboard:**
    *   Provides a central hub for sellers to manage their business on the platform.
    *   Displays key metrics, such as the total number of active listings and the estimated total stock value.
    *   Offers quick access to create a new listing or view existing ones.

### 3.3. Buyer Features
*   **Buyer Profile Management:**
    *   Create and manage a buyer profile, including name, contact details, place, address, and a profile photo.
    *   Profile can be updated through the "Account Settings" dialog.
*   **Browse & Discover Listings:**
    *   The main buyer dashboard displays a grid of all available fish listings from various sellers, sorted by the most recent.
    *   Each listing card provides a quick overview, including a photo, product name, seller name, price, and listed date.
*   **Filter & Sort:**
    *   Buyers can filter listings by the port of origin (e.g., Malpe Port, Mangalore Port).
    *   Buyers can further filter listings by a specific seller.
*   **Detailed Listing View:**
    *   Clicking a listing opens a detailed page with a photo carousel, full product description, seller information, and specifications like quantity, boat, and brand.
*   **Contact Seller:**
    *   A prominent "Call Seller" button on the listing detail page allows buyers to initiate a phone call directly to the seller to finalize a purchase.

---

## 4. Technical Stack & Architecture

*   **Frontend Framework:** Next.js with React (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS with ShadCN UI for pre-built, accessible components.
*   **Backend Services:** Firebase
    *   **Authentication:** Firebase Authentication (Phone OTP)
    *   **Database:** Cloud Firestore for storing user profiles and fish listings.
*   **Hosting:** Firebase App Hosting

---

## 5. Data Models

### 5.1. `Seller`
*   **Description:** Stores information about a fish seller. The document ID is the user's Firebase Auth UID.
*   **Fields:** `id`, `phoneNumber`, `contactName`, `companyName`, `email` (optional), `address` (optional), `logoUrl` (optional), `totalViews`, `totalCalls`.

### 5.2. `Buyer`
*   **Description:** Stores information about a fish buyer. The document ID is the user's Firebase Auth UID.
*   **Fields:** `id`, `phoneNumber`, `name`, `email` (optional), `place` (optional), `address` (optional), `photoUrl` (optional).

### 5.3. `FishListing`
*   **Description:** Represents a single product listing created by a seller. Contains denormalized seller data to optimize read performance.
*   **Fields:** `id`, `sellerId`, `sellerName`, `sellerPhone`, `sellerAddress`, `mediaUrls` (array of strings), `description`, `listedDate`, `productName`, `pricePerKg` (optional), `portDetails`, `boatDetails`, `brandName`, `viewCount`, `callClickCount`, `totalQuantityInTons` (optional).

---

## 6. Future Considerations (Potential Enhancements)

*   **Order Management System:** Allow buyers to place orders directly within the app.
*   **Payment Gateway Integration:** Facilitate secure online payments for transactions.
*   **Real-Time Chat:** Implement a messaging system for direct communication between buyers and sellers.
*   **Ratings and Reviews:** Enable buyers to rate sellers and products to build trust and credibility.
*   **Push Notifications:** Alert buyers about new listings or sellers about inquiries.
*   **Advanced Seller Analytics:** Provide sellers with more detailed insights into listing performance, views, and call clicks.
