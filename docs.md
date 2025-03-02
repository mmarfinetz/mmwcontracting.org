# MMW Contracting Website Documentation

This document provides comprehensive documentation for the MMW Contracting website, covering its structure, functionality, and codebase. The website is a hybrid of a newer Next.js application (for the revenue calculator) and a set of static HTML pages with vanilla JavaScript (for the quote generators and main site content).  It features a distinctive Windows 95/97 aesthetic.

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Technology Stack](#technology-stack)
3.  [Directory Structure](#directory-structure)
4.  [Getting Started (Development)](#getting-started-development)
5.  [Component Breakdown](#component-breakdown)
    *   [5.1 Revenue Calculator (`RevenueCalculator.tsx`)](#51-revenue-calculator-revenuecalculatortsx)
    *   [5.2 UI Components (`components/ui`)](#52-ui-components-componentsui)
    *   [5.3 Utility Functions (`lib/utils.ts`)](#53-utility-functions-libutilsts)
    *   [5.4 Icon Component (`components/icons/calculator.tsx`)](#54-icon-component-componentsiconscalculatortsx)
6.  [Pages](#pages)
    *   [6.1 Calculator Page (`app/calculator/page.tsx`)](#61-calculator-page-appcalculatorpagetxs)
    *   [6.2 Home Page (`app/page.tsx`)](#62-home-page-apppagetxs)
    *   [6.3 Layout (`app/layout.tsx`)](#63-layout-applayouttsx)
    *   [6.4 Static HTML Pages](#64-static-html-pages)
7.  [Styling](#styling)
    * [7.1 Global Styles (`app/globals.css`)](#71-global-styles-appglobalscss)
    * [7.2 Tailwind CSS](#72-tailwind-css)
    * [7.3 Custom CSS (`css/styles.css`, `css/win97.css`)](#73-custom-css-cssstylescss-csswin97css)
8.  [JavaScript Logic](#javascript-logic)
    *   [8.1 Quote Generators (`js/`)](#81-quote-generators-js)
    *   [8.2 `index.html` Script](#82-indexhtml-script)
9.  [Deployment](#deployment)
10. [External Resources](#external-resources)
11. [Future Enhancements](#future-enhancements)
12. [Creating a Desktop Icon and Opening the Calculator (User Instructions)](#creating-a-desktop-icon-and-opening-the-calculator-user-instructions)

## 1. Project Overview

The MMW Contracting website provides information about the company, its plumbing services, and tools for potential clients or internal use.  Key features are:

*   **Service Listing:** Details the plumbing services MMW Contracting offers.
*   **Revenue Calculator:** A dynamic tool (Next.js/React) to estimate revenue/profit.
*   **Quote Generators:** Forms (vanilla JS) for quick power washing and project estimates.
*   **Contact Information:** Includes a contact form (Google Forms) and contact details.
*   **Windows 95 Theme:** A retro aesthetic using custom CSS.

## 2. Technology Stack

*   **Next.js (v14.1.0):** React framework for server-rendered and static web applications (used for the calculator).
    *   **React (v18.2.0):** JavaScript library for building user interfaces.
    *   **ReactDOM (v18.2.0):** DOM-specific methods for React.
    *   **Recharts (v2.12.0):** Charting library built on React (for calculator visualizations).
    *   **Tailwind CSS (v3.4.1):** Utility-first CSS framework (used in the Next.js portion).
    *   **TypeScript (v5.3.3):** Adds static typing to JavaScript.
    *   **clsx, tailwind-merge:** Utilities for efficiently managing CSS class names.
*   **HTML, CSS, JavaScript:** Used for the static pages and quote generators.
*   **Python:**  `create_icons.py` (generates PNG icons - development tool). `x.py` (likely for video download - development tool).
*   **GitHub Actions:** Used for deployment to GitHub Pages.

## 3. Directory Structure

├── .github/ # GitHub Actions workflows
│ └── workflows/
│ └── static.yml # Deployment workflow
├── app/ # Next.js application
│ ├── calculator/ # Calculator page
│ │ └── page.tsx # Calculator page component
│ ├── components/ # Shared React components (Next.js)
│ │ └── RevenueCalculator.tsx # Main calculator component
│ ├── globals.css # Global styles (Next.js)
│ ├── layout.tsx # Root layout (Next.js)
│ └── page.tsx # Home page (redirects to /calculator)
├── components/ # Shared React components
│ ├── icons/ # Icon components
│ │ └── calculator.tsx # Calculator icon
│ ├── ui/ # UI components
│ │ └── card.tsx # Card component
│ └── RevenueCalculator.tsx # Duplicate of app/components/...
├── css/ # CSS files
│ ├── styles.css # Styles for static HTML pages
│ └── win97.css # Windows 95 theme styles
├── js/ # JavaScript files
│ ├── powerwashing-quote.js # Power washing quote generator
│ ├── project-quote.js # Custom project quote generator
│ └── quote-generator.js # Older, likely unused quote generator
├── lib/ # Utility functions
│ └── utils.ts # Tailwind CSS utility (cn)
├── win95-winxp_icons/ # (Likely unused) Git repo for icons
│ └── ...
├── .gitignore # Files/directories ignored by Git
├── build-calculator.js # esbuild script for bundling (likely unused)
├── calculator.html # Standalone HTML page for the calculator (old)
├── CNAME # Custom domain name
├── contact-form.html # Contact form (loads Google Form)
├── create_icons.py # Python script to generate icons
├── create-icons.html # Showcases generated icons
├── docs.md # This documentation file
├── index.html # Main HTML file (static site)
├── next-env.d.ts # TypeScript declarations (Next.js)
├── next.config.js # Next.js configuration
├── package.json # Project metadata and dependencies
├── postcss.config.js # PostCSS configuration (Tailwind)
├── project-quote.html # Custom project quote generator (HTML)
├── quote-generator.html # (Unused) Older quote generator (HTML)
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json # TypeScript configuration
└── x.py # Python script (video download)

## 4. Getting Started (Development)

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the Next.js development server:**

    ```bash
    npm run dev
    ```

    This will start the development server, typically on `http://localhost:3000`.  The calculator will be accessible at `http://localhost:3000/calculator`.

4.  **To view the static pages (`index.html`, etc.):**  You can open them directly in your browser.  You don't *need* a server for basic viewing, but if you want to serve them from a local server (which is good practice), you can use a simple HTTP server like Python's built-in server:

    ```bash
    python3 -m http.server 8000
    ```

    Then you can access the static pages at `http://localhost:8000`.

5. **To build the Next.js application for production:**
    ```bash
    npm run build
    ```
    This command creates an `out` directory containing the statically exported site, suitable for deployment to platforms like GitHub Pages.

## 5. Component Breakdown

### 5.1 Revenue Calculator (`RevenueCalculator.tsx`)

The core of the Next.js application, this component provides a dynamic interface for calculating revenue and profit.

**Key Features:**

*   **State Management:** Uses `useState` for inputs (hours, rates, etc.) and calculations (revenue, costs, profit).
*   **Input Handling:** Input fields for parameters. `handleInputChange` updates state.
*   **Calculation Logic:** `calculateRevenue` performs calculations. A `useEffect` hook triggers recalculation on input changes.
*   **Data Visualization:** Uses `recharts` for:
    *   **Revenue Breakdown:** Bar chart showing contributions to total revenue.
    *   **Profit Analysis:** Bar chart showing revenue, costs, and net profit.
*   **Currency Formatting:** `formatCurrency` formats values as US dollars.
*   **Standard Rate Breakdown:**  `StandardRateBreakdown` (nested component) shows the breakdown of the standard hourly rate.
*   **Summary:** Displays key figures (total hours, billable hours, revenue, profit).
*   **Responsiveness:** Charts adapt to screen sizes using `ResponsiveContainer`.
*   **Custom Tooltip:** A `CustomTooltip` component provides a Windows 95 styled tooltip for the charts, showing detailed breakdowns of the data points.

**Code Snippets (Illustrative):**

```typescript
// State Management (app/components/RevenueCalculator.tsx)
const [inputs, setInputs] = useState({
  hoursPerWeek: 40,
  // ... other inputs
});

const [calculations, setCalculations] = useState({
  totalHours: 0,
  // ... other calculations
});

// Calculation Logic
const calculateRevenue = () => { /* ... */ };

useEffect(() => {
  calculateRevenue();
}, [inputs]);

// Input Handling
const handleInputChange = (name: keyof typeof inputs, value: string) => { /* ... */ };

// Rendering a Chart
<ResponsiveContainer width="100%" height="100%">
  <BarChart data={revenueBreakdown}>
    {/* ... chart components */}
  </BarChart>
</ResponsiveContainer>
Use code with caution.
5.2 UI Components (components/ui)
card.tsx: A styled card component with header, title, and content sections. Uses clsx and tailwind-merge (via cn) for efficient class name management.

// components/ui/card.tsx
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"
// ... other card components (CardHeader, CardTitle, CardContent)
Use code with caution.
TypeScript
5.3 Utility Functions (lib/utils.ts)
cn: Combines clsx and tailwind-merge to manage CSS class names efficiently, handling conditional classes and Tailwind utilities.

// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
Use code with caution.
TypeScript
5.4 Icon Component (components/icons/calculator.tsx)
Calculator: A functional component that renders an SVG icon of a calculator. This is used on the home page to link to the calculator page.

// components/icons/calculator.tsx
import React from 'react'

interface CalculatorProps extends React.SVGProps<SVGSVGElement> {}

export const Calculator: React.FC<CalculatorProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  )
}
Use code with caution.
TypeScript
6. Pages
6.1 Calculator Page (app/calculator/page.tsx)
Renders the RevenueCalculator component. Uses next/dynamic to import it with server-side rendering (SSR) disabled (likely due to recharts DOM dependency).

// app/calculator/page.tsx
import dynamic from 'next/dynamic'

const RevenueCalculator = dynamic(() => import('@/components/RevenueCalculator'), {
  ssr: false,
})

export default function CalculatorPage() {
  return (
    <div className="container mx-auto py-8">
      <RevenueCalculator />
    </div>
  )
}
Use code with caution.
TypeScript
6.2 Home Page (app/page.tsx)
This page now contains a more elaborate landing page with a hero section, features section, and a "How It Works" section, all styled with Tailwind CSS. It includes a prominent link to the calculator page.

// app/page.tsx
import Link from 'next/link'
import { Calculator } from '@/components/icons/calculator'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">MEV Profitability Calculator</h1>
          <p className="text-xl text-gray-300 mb-8">
            Analyze and optimize your MEV strategies with our advanced calculator
          </p>
          <Link 
            href="/calculator"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-colors"
          >
            <Calculator className="w-6 h-6 mr-2" />
            Launch Calculator
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Real-time Analysis</h3>
            <p className="text-gray-300">
              Get instant insights into potential MEV opportunities and profitability metrics
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Gas Optimization</h3>
            <p className="text-gray-300">
              Calculate optimal gas prices and estimate transaction costs
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Strategy Comparison</h3>
            <p className="text-gray-300">
              Compare different MEV strategies and their potential returns
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gray-800 p-8 rounded-lg mb-16">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">1. Input Parameters</h3>
              <p className="text-gray-300">
                Enter your strategy parameters, including gas prices, expected returns, and risk factors
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">2. Calculate Profitability</h3>
              <p className="text-gray-300">
                Our calculator processes your inputs and provides detailed profitability analysis
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
Use code with caution.
TypeScript
6.3 Layout (app/layout.tsx)
The root layout for the Next.js application. Defines the <html> and <body> tags and sets metadata.

// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MMW Contracting - Revenue Calculator',
  description: 'Revenue calculator for MMW Contracting plumbing services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
Use code with caution.
TypeScript
6.4 Static HTML Pages
index.html: The main landing page (Windows 95 theme). Includes interactive elements (desktop icons, start menu, windows) managed by JavaScript.

contact-form.html: Embeds a Google Form for user contact.

project-quote.html: Form and JavaScript for custom project quotes.

quote-generator.html: Older, unused power washing quote generator.

create-icons.html: Showcases icons generated by create_icons.py.

calculator.html: A standalone HTML file that was likely an earlier attempt to create the calculator. It includes script tags to load React, ReactDOM, and Recharts from a CDN, and a <script type="module" src="/components/RevenueCalculator.tsx"></script> tag to load the calculator component. This approach is not how Next.js applications are typically structured or deployed. It's likely not actively used.

7. Styling
7.1 Global Styles (app/globals.css)
Sets up a basic CSS reset and defines root variables for the Next.js application. Uses Tailwind directives.

/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
Use code with caution.
Css
7.2 Tailwind CSS
Used extensively in the Next.js application. Utility classes are used directly in the JSX.

7.3 Custom CSS (css/styles.css, css/win97.css)
styles.css: Styles for the static HTML pages (modern look).

win97.css: Implements the Windows 95 theme (used in index.html). Includes extensive styling for:

Window styling (borders, title bars, buttons).

Desktop icon styling.

Taskbar and Start Menu styling.

Custom background and logo.

Mobile responsiveness.

Touch improvements.

8. JavaScript Logic
8.1 Quote Generators (js/)
powerwashing-quote.js: Calculates a power washing quote based on user input (square footage, surface type, dirt level). Includes a button to open the Google contact form.

project-quote.js: Calculates a quote for custom projects (remodeling, sewer, drains). Dynamically shows/hides form sections. Includes a button to open the contact form.

quote-generator.js: Older, likely unused, quote generator.

// js/powerwashing-quote.js (Example)
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('powerwashingQuoteForm');
    // ... event listener, calculation logic, displayQuote function
});
Use code with caution.
JavaScript
8.2 index.html Script
The <script> tag at the end of index.html handles:

Time Updates: Updates the taskbar time every second.

Window Management: Dragging, minimizing, maximizing, closing windows. Creates taskbar entries for windows.

Desktop Icon Actions: Handles clicks on desktop icons (opening windows, navigating to contact-form.html).

Start Menu: Shows/hides the start menu, handles start menu item clicks.

Shutdown: Reloads the page (simulates shutdown).

Calculator Window: Handles the display and interaction with the calculator window, now embedding the Next.js application via an <iframe>.

9. Deployment
The .github/workflows/static.yml file defines a GitHub Actions workflow for deployment to GitHub Pages.

Trigger: Runs on pushes to main and manual triggers.

Permissions: Sets permissions for GITHUB_TOKEN.

Concurrency: Ensures only one deployment runs at a time.

Steps:

Checkout: Checks out the code.

Setup Pages: Configures GitHub Pages.

Upload artifact: Uploads the repository.

Deploy to GitHub Pages: Deploys the artifact.

The next.config.js file is configured for static export (output: 'export'). This is crucial for deploying the Next.js part of the application to GitHub Pages. The unoptimized: true setting for images is also important for static export.

10. External Resources
Google Fonts: SF Pro Display font.

Google Forms: Used for the contact form.

GitHub: Repository hosting and deployment (GitHub Pages).

CDN (unpkg.com): Used in calculator.html (the old calculator) to load React, ReactDOM, and Recharts. This is not used in the Next.js version.

11. Future Enhancements
Consolidate Codebase: Migrate static HTML pages and JavaScript into the Next.js application for unified maintenance. This would involve converting quote generators to React components.

Backend Integration: Implement a backend (e.g., Next.js API routes) for form submissions, data storage, and complex calculations.

Database: Integrate a database to store quotes, user info, etc.

User Authentication: If the calculator is internal, add authentication.

Improved Error Handling: More robust error handling and user feedback.

Accessibility: Ensure the website is fully accessible (WCAG).

Testing: Add unit and integration tests.

Refactor index.html JavaScript: Move to a separate .js file, use event delegation, and potentially rewrite as React components.

Remove Duplication: Remove the unused RevenueCalculator.tsx in the top-level components directory.

Remove Unused Files: Remove unused files (quote-generator.html, quote-generator.js, win95-winxp_icons, calculator.html). Move development scripts (x.py, create_icons.py) to a tools directory.

Componentize index.html: Break down index.html into smaller components.

Update next.config.js: The env.BUILD_ID setting is not necessary for static export and can be removed. The basePath and trailingSlash settings can likely be removed as well, as they are not needed with the current setup.

Switch to Next.js App Router Completely: The use of next/navigation and the old /app directory structure suggests that the project might be transitioning to a newer version of Next.js. Consider standardizing on the App Router for all pages.

Use Next.js Link Component for Internal Links: Replace <a> tags with <Link> from next/link for internal navigation within the Next.js application to enable client-side routing, improving performance.

12. Creating a Desktop Icon and Opening the Calculator (User Instructions)
Since the website uses a Windows 95/97 theme, here's how to create a desktop "shortcut" and open the calculator, mimicking that environment:

On Windows:

Navigate to the Website: Open your web browser (Chrome, Firefox, Edge, etc.) and go to the MMW Contracting website (mmwcontracting.org).

Locate the Calculator Icon: On the website's main page (which looks like a Windows desktop), you'll see several icons. Find the one labeled "Revenue Calculator."

Click the Calculator Icon: Click the "Revenue Calculator" icon. This will open a "window" (styled like a Windows 95 window) containing the calculator application. The calculator is actually embedded within this window using an <iframe>.

Interact with the Calculator: You can now use the calculator within the window. You can minimize, maximize, and close this window using the buttons in the top-right corner, just like a real Windows 95 window.

To create a desktop shortcut to the calculator page (for quicker access):

Go to the Calculator Page Directly: Open your browser and go to mmwcontracting.org/calculator. (Or, navigate to the main page and click the "Launch Calculator" button on the Next.js-based home page.)

Create a Shortcut (Chrome):

Click the three vertical dots in the top-right corner of Chrome.

Go to "More tools" -> "Create shortcut...".

In the dialog box, you can name the shortcut (e.g., "MMW Calculator"). Crucially, check the box that says "Open as window". This will make the calculator open in its own window, without the browser's address bar and toolbars, closer to the intended experience.

Click "Create".

Create a Shortcut (Firefox):

Right-click on an empty space on the calculator page.

Select "Create Shortcut". Firefox might not have an "Open as window" option directly in this context menu.

Create a Shortcut (Edge):

Click the three horizontal dots in the top-right corner of Edge.

Go to "Apps" -> "Install this site as an app."

You can rename the app (e.g., "MMW Calculator"). This will create a shortcut that opens the calculator in a dedicated window.

On macOS:

Go to the Calculator Page Directly: Open your browser and go to mmwcontracting.org/calculator.

Create a Shortcut (Safari):

Drag the URL from the address bar directly to your desktop. This will create a .webloc file, which is macOS's equivalent of a shortcut. Double-clicking this file will open the calculator page in Safari.

Create a Shortcut (Chrome):

Click the three vertical dots in the top-right corner of Chrome.

Go to "More tools" -> "Create shortcut...".

In the dialog, name the shortcut (e.g., "MMW Calculator"). Check the "Open as window" box.

Click "Create". This will create a .app file on your desktop. Double-clicking this will open the calculator in its own Chrome window.

On Linux:

The process varies depending on your desktop environment (GNOME, KDE, etc.). Generally, you can create a .desktop file:

Create a Text File: Create a new text file on your desktop (e.g., mmw-calculator.desktop).

Edit the File: Open the file in a text editor and add the following content (adjusting the Name, Exec, and Icon as needed):

[Desktop Entry]
Version=1.0
Type=Application
Name=MMW Calculator
Comment=Open the MMW Contracting Revenue Calculator
Exec=google-chrome --app=https://mmwcontracting.org/calculator
Icon=text-html
Terminal=false
StartupNotify=true
Use code with caution.
Desktop
Exec: This line specifies the command to run. Here, it uses Google Chrome in "app mode" (--app=...) to open the calculator in a separate window. You might need to adjust this based on your browser (e.g., firefox -new-window https://mmwcontracting.org/calculator for Firefox).

Icon: You can specify a path to an icon file here, or use a generic icon name.

Make the File Executable: Right-click the file, go to "Properties," and in the "Permissions" tab, check the box that says "Allow executing file as program" (or similar wording).

Double-Click: You should now be able to double-click the .desktop file to open the calculator.

Important Considerations:

Internet Connection: The calculator requires an internet connection, as it's a web application.

Browser Compatibility: The calculator should work in most modern browsers, but it's primarily tested and styled for Chrome, Firefox, and Edge.

"Open as Window": This option (available in Chrome and Edge) is highly recommended for the best user experience, as it mimics the intended "application" feel.

Localhost vs. Production: The provided index.html includes a hardcoded iframe source of http://localhost:3000/calculator. This is for local development. When deployed, the iframe source should be the correct production URL (mmwcontracting.org/calculator). The documentation and code have been updated to reflect this.

Mobile: The desktop-icon metaphor and Windows 95 theme are not ideal for mobile devices. The site does have some responsive styles, but a dedicated mobile experience would be a significant improvement.

