# Habitual - Premium Habit Tracking App

Habitual is a sophisticated habit tracking application designed to help users build and maintain positive habits through personalized onboarding, intuitive tracking, and AI-powered insights.

## Recent Fixes

- **Turbopack Configuration**: Updated Next.js config to fix Turbopack warnings
- **UI Scrollbar Fix**: Fixed white scrollbar in Monthly Overview card on desktop and corrected CSS implementation
- **Service Worker Cleanup**: Properly integrated fixes for permission errors and cleaned up service worker files
- **File Maintenance**: Removed all temporary `.new` and `.backup` files to maintain code cleanliness

## Features

- **Premium Personalized Onboarding**: Create a personalized experience for new users
- **Habit Management**: Add, track, and visualize habits with ease
- **Consistency Heatmap**: View progress over time with a visual heatmap
- **AI-Generated Advice**: Receive personalized insights for habit improvement
- **Daily Motivation**: Get inspired with a daily motivational quote

## Tech Stack

- **Frontend**: Next.js 14 with React
- **UI**: Tailwind CSS with premium animations (Framer Motion)
- **Backend**: Firebase (Authentication, Firestore)
- **State Management**: React Context API
- **Animation**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
2. Install dependencies
3. Set up environment variables (copy `.env.example` to `.env.local`)
4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
