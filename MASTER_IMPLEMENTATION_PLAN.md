# Master Integration Roadmap

This document outlines every remaining feature required to fully integrate the frontend application with the NestJS/GraphQL backend schema defined in the `athlex` architecture. 

The goal is to systematically build out the UI and wire up the GraphQL queries/mutations for all domain models: Programs, Exercises, Products, Social features, and Gamification.

## Phase 1: Trainer Program & Workout Builder
**Important Note:** The backend currently still uses the legacy `Property` schema instead of a dedicated `TrainingProgram` schema. To make the frontend work without touching the NestJS backend, we must creatively map fitness data into the existing real estate types.

**Proposed Data Mapping (Frontend -> Backend `PropertyInput`):**
- **Program Title** -> `propertyTitle`
- **Program Description** -> `propertyDesc`
- **Program Price** -> `propertyPrice`
- **Program Duration (Weeks)** -> `propertyRooms`
- **Workouts per Week** -> `propertyBeds`
- **Program Level (Beginner/Adv)** -> `propertyLocation` (Map SEOUL to Beginner, BUSAN to Intermediate, etc.)
- **Program Type (Cardio/Lifting)** -> `propertyType` (Map APARTMENT to Powerlifting, VILLA to Bodybuilding, etc.)
- **Program Cover Image** -> `propertyImages[0]`

1. **Refactor `AddNewProperty.tsx` -> `AddNewProgram.tsx`**:
   - Rebuild the form UI to ask for Fitness data (Title, Type, Level, Duration in weeks).
   - Before firing the `CREATE_PROPERTY` mutation, package the form state into the mapped `PropertyInput` fields described above.
2. **Refactor `MyProperties` -> `MyPrograms`**:
   - Update the UI list to display the Trainer's active programs. Use the mappings to decode `propertyRooms` back into `Duration` and `propertyLocation` back into `Difficulty Level`.
3. **Workout/Exercise UI (Deferred to Phase 2 or Backend Update)**:
   - Since the `Property` schema lacks nested arrays for `Workouts` and `Exercises`, we will either need to store all workout data as stringified JSON inside `propertyDesc` or `propertyAddress`, OR defer this until the backend schema is updated to support true nested sub-documents. For now, Programs will act as high-level overviews for users to buy/enroll into.

## Phase 2: User Enrollment & Progress Tracking
Users can currently browse programs, but they cannot enroll or track their progress.
1. **Program Checkout / Enrollment**:
   - Add a checkout flow or an "Enroll Now" button on the Program Detail page that triggers a `CREATE_PROGRAM_ENROLLMENT` mutation.
2. **"My Training Dashboard" (For Users)**:
   - Create a dedicated UI in `MyPage` (or a separate route) where the user sees their *enrolled* programs.
3. **Daily Progress Tracker (ProgressResults)**:
   - Build a UI representing the current active Workout day.
   - Allow users to "check off" exercises as completed, submit their actual reps/weights, and trigger the `CREATE_PROGRESS_RESULT` mutation.

## Phase 3: Social & Community Features
The codebase supports a robust social engagement graph that needs to be fully wired into the React components.
1. **Comments & Reviews**:
   - Add a "Review" or comment section to the Program Detail and Product Detail pages so users can leave text reviews (`CREATE_COMMENT`).
2. **Rating / Feedback System**:
   - Implement a 5-star rating system (wiring into the `Feedback` schema) so users can rate programs after completion.
3. **Like & Bookmark Syncing**:
   - Ensure the "Save" (Bookmark) and "Like" buttons on all `TrainingProgram`, `Article`, and `Product` cards actively mutate the database and instantly reflect state changes in the UI.
4. **Member-to-Member Follows**:
   - Ensure the `Followers` and `Following` tabs in `MyPage` successfully list users, link to their public profiles, and allow un-following/following.

## Phase 4: Gamification & Notifications
Leverage the backend's analytics and background workers.
1. **Points & Rankings**:
   - Hook up the global Leaderboard page so users can see how they rank based on their `memberPoints`.
   - Ensure the `MyPage` dashboard correctly reflects the user's `memberRank`.
2. **Notifications (Optional UI)**:
   - If the backend generates internal notifications (or sends via Resend), build a basic Notification bell in the TopNav to display system alerts.

## Phase 5: E-commerce (Products Domain)
The `Product` schema represents supplements and merch.
1. **Shopping Cart & Checkout**:
   - Build a global state `CartContext`.
   - Create a Checkout page or a Stripe integration placeholder for buying `Products`.
2. **Order History**:
   - Add a "My Orders" tab to `MyPage` for users to track their purchased supplements/merch.

## Phase 6: Admin Dashboard (`/_admin`)
The admin panel needs to shed its legacy real-estate origins.
1. **User Management**: Table to block/delete users and approve Trainer accounts.
2. **Program Moderation**: Table to review newly submitted `TrainingPrograms` and change their status from `PENDING` to `ACTIVE`.
3. **Global Settings/Analytics**: A top-level view of platform revenue, active enrollments, and trending programs.
