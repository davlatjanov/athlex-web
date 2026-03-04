# Athlex — Master Integration Roadmap

This document is the single source of truth for connecting the frontend to the NestJS/GraphQL backend.
All phases are ordered by dependency. Do not start a phase until the one before it is stable.

---

## ⚠️ Backend Constraint (Read First)

The backend currently uses the legacy `Property` schema instead of a dedicated `TrainingProgram` schema.
**All fitness data must be mapped into `Property` fields until the backend is updated.**
This mapping is locked — do not change it mid-project without updating all pages that depend on it.

### Canonical Data Mapping

| Fitness Concept | Backend Field | Notes |
|---|---|---|
| Program Title | `propertyTitle` | Plain string |
| Program Description | `propertyDesc` | Plain string |
| Program Price | `propertyPrice` | Number |
| Duration (weeks) | `propertyRooms` | Integer |
| Workouts/week | `propertyBeds` | Integer |
| Difficulty Level | `propertyLocation` | SEOUL=Beginner, BUSAN=Intermediate, DAEGU=Advanced, INCHEON=Elite |
| Program Type | `propertyType` | APARTMENT=Powerlifting, VILLA=Bodybuilding, HOUSE=Cardio, CONDOMINIUM=Crossfit |
| Cover Image | `propertyImages[0]` | Uploaded via multipart |
| Workout Data (temp) | `propertyAddress` | Stringified JSON — known limitation, replace when backend updates |

**UI rule:** Never expose raw backend enum names (SEOUL, APARTMENT, etc.) to users. Always map to display labels.

---

## Phase 0: Foundation (Start Here)

Nothing else works without this.

### 0.1 Authentication
- [ ] Wire up the login form in `/account/join` to the `LOGIN_MEMBER` mutation
- [ ] Wire up the register form to the `SIGN_UP` mutation
- [ ] On success, store the JWT in `localStorage` and call `updateUserInfo(jwt)`
- [ ] Handle wrong credentials with visible error messages (not silent failures)

### 0.2 Session & Token Handling
- [ ] On every app load, check for an existing JWT and call `updateUserInfo()` (already partially done in `Top.tsx` — verify it works)
- [ ] Handle expired tokens: if a GraphQL request returns `UNAUTHENTICATED`, clear the token and redirect to `/account/join`
- [ ] Ensure `logOut()` clears Apollo cache AND `localStorage`

### 0.3 Image Upload Infrastructure
- [ ] Confirm the backend multer endpoint URL (e.g. `POST /upload/member-image`, `/upload/property-image`)
- [ ] Create a reusable `uploadImage(file, endpoint)` utility in `libs/utils/`
- [ ] Test upload + preview flow before using it in any form

### 0.4 Global UX Patterns
- [ ] Create a reusable `<Spinner />` or skeleton component for loading states
- [ ] Create a reusable `<ErrorMessage />` component for GraphQL errors
- [ ] Create a reusable `<EmptyState />` component for empty lists
- [ ] Use these consistently across all pages — never leave a blank white area

---

## Phase 1: Trainer — Program Management

Trainers must be able to create and manage programs before users can do anything.

### 1.1 Trainer Status Gate
- [ ] After registration, a user with `memberType: AGENT` is a trainer but may need admin approval
- [ ] Show a "Pending Approval" banner on MyPage if the trainer account is not yet active
- [ ] Block access to program creation UI until the account is approved

### 1.2 Create Program Form (`AddNewProgram.tsx`)
- [ ] Rebuild the form to collect: Title, Type, Level, Duration (weeks), Workouts/week, Price, Cover Image, Description
- [ ] Map form values to `PropertyInput` using the canonical mapping above
- [ ] Upload cover image first, get the URL, then include it in `propertyImages`
- [ ] Fire the `CREATE_PROPERTY` mutation on submit
- [ ] Show success toast and redirect to MyPrograms on success

### 1.3 My Programs List (`MyPrograms.tsx`)
- [ ] Fetch trainer's programs using `GET_PROPERTIES` with `memberId` filter
- [ ] Decode display values from mapped backend fields (e.g. show "Beginner" not "SEOUL")
- [ ] Add Edit and Delete actions per program card
- [ ] Wire Delete to `DELETE_PROPERTY` mutation with a confirmation dialog

### 1.4 Edit Program
- [ ] Prefill the edit form with existing program data
- [ ] Fire `UPDATE_PROPERTY` mutation on save

---

## Phase 2: Programs — Public Listing & Detail

### 2.1 Programs Listing Page (`/programs`)
- [ ] Fetch programs from `GET_PROPERTIES` with filters
- [ ] Wire filter UI to query variables — map display labels back to backend enums
  - Difficulty dropdown → `propertyLocation` enum
  - Type dropdown → `propertyType` enum
  - Price range → `propertyPriceMin` / `propertyPriceMax`
- [ ] Wire pagination to `page` / `limit` variables
- [ ] Show loading skeletons while fetching

### 2.2 Program Detail Page (`/programs/detail`)
- [ ] Fetch single program using `GET_PROPERTY` by ID
- [ ] Display all decoded fields (title, level, type, duration, price, image, description)
- [ ] Show trainer info (link to their public profile `/member?memberId=xxx`)
- [ ] "Enroll Now" button (Phase 3 wires this up)
- [ ] Reviews section (Phase 3 wires this up)

---

## Phase 3: User Enrollment & Progress

### 3.1 Enroll in a Program
- [ ] "Enroll Now" button on Program Detail fires `CREATE_ORDER` or equivalent mutation
- [ ] After enrollment, the program appears in the user's MyPage dashboard

### 3.2 My Training Dashboard (User MyPage)
- [ ] Show enrolled programs list fetched via `GET_ORDERS` or `GET_ENROLLMENTS`
- [ ] Each program card links to the active workout day

### 3.3 Daily Progress Tracker
- [ ] Show today's workout exercises (parsed from `propertyAddress` JSON)
- [ ] Allow user to check off exercises and enter reps/weights
- [ ] Submit via `CREATE_PROGRESS_RESULT` mutation

---

## Phase 4: Social & Community

### 4.1 Comments & Reviews
- [ ] Program Detail page: fetch comments via `GET_COMMENTS`, display list
- [ ] Authenticated users can submit a comment via `CREATE_COMMENT`
- [ ] Product Detail page: same pattern

### 4.2 5-Star Rating
- [ ] After completing a program, show a rating prompt
- [ ] Submit via `CREATE_FEEDBACK` mutation
- [ ] Display average rating on the program card and detail page

### 4.3 Likes & Bookmarks
- [ ] Like button on program/article/product cards → `LIKE_TARGET` mutation
- [ ] Bookmark button → `SAVE_TARGET` mutation
- [ ] Instantly update UI state on response (optimistic update preferred)
- [ ] My Favorites / My Saved tabs in MyPage show these lists

### 4.4 Member Follows
- [ ] Follow/Unfollow button on public member profiles → `FOLLOW_MEMBER` mutation
- [ ] Followers / Following tabs in MyPage fetch real data
- [ ] Each listed user links to their public profile

---

## Phase 5: E-commerce (Products)

### 5.1 Products Listing (`/products`)
- [ ] Fetch products from `GET_PRODUCTS` with category/price filters
- [ ] Wire filters and pagination

### 5.2 Product Detail (`/products/[id]`)
- [ ] Fetch single product, display images, description, price, stock
- [ ] "Add to Cart" button updates cart context state

### 5.3 Shopping Cart & Checkout
- [ ] Create global `CartContext` (React Context)
- [ ] Cart drawer or page shows items, quantities, total
- [ ] Checkout fires `CREATE_ORDER` mutation (Stripe or placeholder)

### 5.4 Order History
- [ ] "My Orders" tab in MyPage fetches past orders

---

## Phase 6: Admin Dashboard (`/_admin`)

### 6.1 User Management
- [ ] Table of all users with search/filter
- [ ] Block/unblock user → `UPDATE_MEMBER_STATUS` mutation
- [ ] Approve trainer accounts → set `memberType` or status flag

### 6.2 Program Moderation
- [ ] Table of all programs with status (PENDING / ACTIVE / REJECTED)
- [ ] Approve/reject buttons → `UPDATE_PROPERTY_STATUS` mutation

### 6.3 Analytics Overview
- [ ] Total users, active enrollments, revenue figures
- [ ] Trending programs by views/likes

---

## Known Limitations & Future Backend Work

| Limitation | Impact | Resolution |
|---|---|---|
| Workout data stored as JSON string in `propertyAddress` | Can't query/filter by exercise | Requires new `TrainingProgram` + `Workout` + `Exercise` schemas in NestJS |
| Difficulty/Type use city/property enums | Confusing backend data | Same — needs proper enums after schema migration |
| No `Enrollment` model yet | Can't track user ↔ program relationship properly | Backend needs `Enrollment` collection |

**When the backend schema is updated**, Phase 1 mappings must be refactored everywhere simultaneously. Keep all mapping logic in one file (`libs/utils/programMapping.ts`) so there is a single place to update.
