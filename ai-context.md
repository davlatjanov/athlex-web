# Athlex Backend Architecture Context

This document is generated to provide a comprehensive explanation of the `athlex` backend project context for any computer AI or LLM assistant working on this application.

## 1. Project Overview & Architecture
- **Framework:** NestJS (Node.js) configured as a monorepo.
- **API Interface:** GraphQL via Apollo Server (`@nestjs/graphql`, `@nestjs/apollo`), with real-time Subscriptions/WebSockets support.
- **Database:** MongoDB with Mongoose (`@nestjs/mongoose`).
- **Auth & Security:** JWT-based authentication (`@nestjs/jwt`, `bcryptjs`), Role-based guards, and GraphQL query rate-limiting (`@nestjs/throttler`).
- **External Integrations:**
  - `Cloudinary`: Image/video uploading and serving.
  - `Resend`: Transactional email delivery.
  - `Groq SDK`: AI and LLM integrations.

## 2. Monorepo Applications
The project contains two distinct microservices/applications under the `apps/` directory:

### A. `athlex` (Main Application)
This handles the core functionality and GraphQL API for the client frontends.
- Contains all GraphQL resolvers, business logic services, and REST/GraphQL controllers.
- Domain features are encapsulated inside `apps/athlex/src/components/`, including:
  `admin`, `ai`, `auth`, `bookmark`, `comment`, `exercise`, `feedback`, `follow`, `like`, `member`, `product`, `progress-result`, `training-program`, and `view`.
- Shared code resides in `apps/athlex/src/libs/` (DTOs, Enums, Guards, Services, Utilities).
- Mongoose schemas are located in `apps/athlex/src/schemas/`.

### B. `athlex-batch` (Background Workers)
This service manages background tasks utilizing cron scheduling (`@nestjs/schedule`).
- **Cleanup Jobs:** Cleans up old views, orphaned records, deleted members.
- **Email Reminders:** Inactive users, program start/end notifications.
- **Analytics & Recommendations:** Calculates trending programs, updates popularity scores, generates personalized/collaborative filtering recommendations for users.
- **Moderation:** Scans for inappropriate content and detects spammers.

## 3. Core Domain Models (Mongoose Schemas)
- **`Member`**: Represents users in the system. Has properties for `memberType` (e.g., USER, ADMIN), status, authentication type, contact logic, and computed stats (followers, likes, views, rank).
- **`TrainingProgram`**: A high-level workout program created by a member/trainer (e.g., a 4-week split). Includes type, level, status, price, duration, and arrays of video/image content. Programs are composed of multiple `Workouts`.
- **`Workout`**: Belongs to a specific `TrainingProgram`. Defines the activities for a specific day (e.g., Day 1, Rest Day). Tracks duration and targeted body parts. Consists of multiple `Exercises`.
- **`Exercise`**: A specific physical movement within a `Workout`. Tracks targeted primary/secondary muscles, sets, reps, rest time, tempo, required equipment, and difficulty levels. Contains video URLs and step-by-step text/image instructions.
- **`Product`**: E-commerce entries representing merchandise or supplements, complete with branding, stock counts, pricing, and view/like stats.
- **Social & Engagement Models**: 
  - `View`, `Like`, `Bookmark`, `Comment`: Polymorphic engagement tracking for programs, exercises, and products.
  - `Follow`: Member-to-member relationships.
  - `Conversation` / `Feedback`: Communication abstractions.
  - `ProgramEnrollment` / `ProgressResults`: Tracking a user's progress through a specific `TrainingProgram`.

## 4. Useful Directives for AI Assistants
- When modifying GraphQL operations, always update the respective DTO classes in `libs/dto` and ensure `@Args()` align with NestJS resolver constraints.
- When querying MongoDB, ensure adequate selection via indexing (keys defined per-schema) and respect `deletedAt` logic (soft deletes where applicable).
- The monorepo uses `npm run start:dev` for the main app and `npm run start:dev:batch` for the cron service.
- When generating AI recommendations via `Groq SDK`, refer to the `ai` component for existing context and logic encapsulation.
