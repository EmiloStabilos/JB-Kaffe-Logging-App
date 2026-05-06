@AGENTS.md

# Kaffe Journal

A specialty coffee bean logging app. Users log coffee beans they've bought, rate them, record tasting notes, brew methods, and cupping observations.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack) — read `node_modules/next/dist/docs/` before making changes
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with custom CSS variables (no `tailwind.config.js` — config lives in `globals.css` via `@theme inline`)
- **Database:** Firebase Firestore (`coffees` collection)
- **Deployment:** Vercel

## Project Structure

```
src/
  app/
    page.tsx              # Home dashboard — bean grid, search, filter, stats
    add/page.tsx          # Add new bean form
    coffee/[id]/page.tsx  # Bean detail view (edit, delete)
    edit/[id]/page.tsx    # Edit bean form
    layout.tsx            # Root layout with Header
    globals.css           # Design tokens, custom CSS classes
  components/
    Header.tsx            # Sticky nav with logo and Log Bean button
    CoffeeCard.tsx        # Card used in the home grid
    CoffeeForm.tsx        # Shared add/edit form (includes barcode scan trigger)
    BarcodeScanner.tsx    # Full-screen camera scanner with Open Food Facts lookup
    RoastLevelBar.tsx     # Visual roast level gradient indicator
    StarRating.tsx        # Interactive/readonly star rating
  lib/
    types.ts              # Coffee interface, enums, constants (roast levels, brew methods etc.)
    storage.ts            # All Firestore operations (getAllCoffees, addCoffee, etc.)
    firebase.ts           # Firebase app init via NEXT_PUBLIC_FIREBASE_* env vars
```

## Environment Variables

Required in `.env.local` (see `.env.local.example`):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## Key Design Decisions

- **Tailwind v4 + custom CSS classes:** Utility classes do NOT override `input-base` padding (CSS shorthand specificity). Use inline `style` for overrides on elements that use `input-base`.
- **All data fetching is client-side** (`'use client'` + `useEffect`). There are no server-side data fetches.
- **Firestore is schema-less** — the `coffees` collection is created automatically on first write. `seedDemoData()` runs on home page load and only seeds if the collection is empty.
- **BarcodeScanner** uses manual `getUserMedia` + canvas frame polling (400ms interval) instead of ZXing's built-in callback, because the callback is unreliable on iOS Safari.
- **`BarcodeScanner` is loaded via `next/dynamic` with `ssr: false`** to avoid server-side import issues with the ZXing browser library.

## Running Locally

```bash
npm install
cp .env.local.example .env.local   # fill in Firebase config
npm run dev
```

## Firebase Firestore Rules

Currently in test mode. Before expiry, set rules in Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /coffees/{document=**} {
      allow read, write: if true;
    }
  }
}
```
