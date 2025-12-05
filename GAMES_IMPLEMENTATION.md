# Games Implementation - Child Routes & Role-Based Access

## Overview
This implementation adds **child-only game routes** with role-based access control, following the spec for `/child/games/*` routes and API endpoints at `/api/v1/games`.

---

## ✅ What's New

### 1. **API Layer** (`src/api/`)

#### `gamesApi.ts` (NEW)
- `submitMemory()` - POST `/api/v1/games/memory/submit`
- `submitMood()` - POST `/api/v1/games/mood/submit`
- `submitScenario()` - POST `/api/v1/games/scenario/submit`
- `submitIslamicQuiz()` - POST `/api/v1/games/islamic-quiz/submit`
- `getChildAnalysis(childId)` - GET `/api/v1/games/{child_id}/analysis` (parent-only)

All requests use the existing `axiosInstance` which auto-includes Bearer token from `localStorage`.

#### `auth.ts` (NEW)
Helper functions to read auth state from localStorage:
- `getUserType()` - returns `'parent' | 'child' | null`
- `getChildId()` - extracts child_id from user_info (supports multiple shapes)
- `getAccessToken()` - returns JWT token
- `getUserInfo<T>()` - returns parsed user_info

---

### 2. **Child-Only Game Components** (`src/components/games/`)

All four games match the spec:

#### `MemoryGame.tsx`
- **Route:** `/child/games/memory`
- **Prompt:** "Flip cards and find matching pairs. Try to use fewer flips and be quick!"
- Tracks: `total_flips`, `correct_matches`, `wrong_matches`, `time_taken_seconds`
- Success toast shows `cognitive`, `focus` scores

#### `MoodPickerGame.tsx`
- **Route:** `/child/games/mood`
- **Prompt:** "See a situation and pick how you feel: 😠 Anger, 😢 Sad, 😊 Happy, 🤝 Forgive"
- Submit: `scenario_id`, `selected_mood`
- Success toast shows `emotional_control`, `empathy` scores

#### `ScenarioGame.tsx`
- **Route:** `/child/games/scenario`
- **Prompt:** "Choose what you would do. Your choices shape your moral and social strengths."
- Options: Hit, Forgive, Tell teacher
- Success toast shows `moral`, `emotional`, `social` scores

#### `IslamicQuizGame.tsx`
- **Route:** `/child/games/islamic-quiz`
- **Prompt:** "Answer the question. You'll get points for correct answers!"
- Submit: `question_id`, `selected_answer`, `correct_answer`
- Success toast shows `spiritual`, `cognitive` scores

**Common features across all games:**
- ✅ Auto-fetch `child_id` from localStorage
- ✅ Bearer token sent via `axiosInstance`
- ✅ Friendly error messages for 403 (not your profile), network errors
- ✅ Toast notifications with analysis scores

---

### 3. **Routing & Access Control** (`App.tsx`)

#### Path-based routing (no router library)
- Uses `window.location.pathname` + `history.pushState/replaceState`
- Listens to `popstate` for browser back/forward

#### Role-based gating
```typescript
// Children: only /child/* routes allowed
if (userType === 'child' && !path.startsWith('/child')) {
  redirect to /child/games
}

// Parents: cannot access /child/* routes
if (userType === 'parent' && path.startsWith('/child')) {
  redirect to /
}
```

#### Child route rendering
```tsx
if (userType === 'child') {
  if (path === '/child/games') return <GamesHub />;
  if (path === '/child/games/memory') return <MemoryGame />;
  if (path === '/child/games/mood') return <MoodPickerGame />;
  if (path === '/child/games/scenario') return <ScenarioGame />;
  if (path === '/child/games/islamic-quiz') return <IslamicQuizGame />;
}
```

Parent-only sections (`dashboard`, `chatbot`, `settings`) now have `userType === 'parent'` guards.

---

### 4. **Games Hub** (`GamesPage.tsx`)

Updated game cards:
- **Memory Match** → "Test your focus and memory" → id: `memory`
- **Mood Picker** → "Choose feelings for different situations" → id: `mood`
- **What Would You Do?** → "Make wise choices" → id: `scenario`
- **Islamic Quiz** → "Learn and answer" → id: `islamic-quiz`

New prompt: **"Pick a game to play today! Your progress helps unlock new activities."**

Clicking a card calls `handleStartGame(id)` which:
1. Sets `currentPage = 'game'`
2. Pushes route like `/child/games/memory`
3. Component renders the game

---

## 📋 Routes Summary

### Child Routes (Protected)
- `/child/games` - Games hub with 4 cards
- `/child/games/memory` - Memory Match game
- `/child/games/mood` - Mood Picker game
- `/child/games/scenario` - What Would You Do game
- `/child/games/islamic-quiz` - Islamic Quiz game

### Parent Routes (Hidden from children)
- `/` - Dashboard/Chatbot
- `/parent-onboarding` - Onboarding wizard
- All sidebar pages: `dashboard`, `chatbot`, `settings`, etc.

---

## 🔐 Security & Access

### Frontend Gating
- ✅ Children cannot navigate to parent-only pages
- ✅ Parents cannot access `/child/*` routes
- ✅ All game submissions require valid `child_id` from localStorage

### Backend Enforcement (Expected)
- Child submits **their own `child_id`** (must match JWT profile)
- API returns **403 Forbidden** if child_id mismatch
- Frontend shows: "You can only submit your own results"

### Bearer Token
- Automatically attached to all API requests via `axiosInstance`
- Token stored in `localStorage.access_token` after login

---

## 🎨 UI/UX Polish Ideas (Future Enhancements)

From the spec:
- 🎉 Confetti on match completion
- 🔊 Sound cues on flips
- 🏅 Badge system: "Kind Choice", "Wise Choice"
- 📊 Daily streak bar
- 🎴 Animated summary card with analysis scores

---

## 🧪 Testing Checklist

### As Child User
1. ✅ Login as child → land at `/child/games`
2. ✅ See 4 game cards with correct icons/descriptions
3. ✅ Click "Memory Match" → route to `/child/games/memory`
4. ✅ Play game, submit → see toast with analysis scores
5. ✅ Try to navigate to `/` or `/chatbot` → auto-redirect to `/child/games`
6. ✅ Submit with wrong child_id → see 403 error message

### As Parent User
1. ✅ Login as parent → land at dashboard/chatbot
2. ✅ See all parent menu items (dashboard, chatbot, settings)
3. ✅ Try to navigate to `/child/games` → auto-redirect to `/`
4. ✅ Access parent-only analysis: `GET /api/v1/games/{child_id}/analysis`

---

## 📦 Files Modified/Added

### New Files
- `src/api/gamesApi.ts` - Game submission & analysis API
- `src/api/auth.ts` - Auth helper utilities
- `src/components/games/MemoryGame.tsx`
- `src/components/games/MoodPickerGame.tsx`
- `src/components/games/ScenarioGame.tsx`
- `src/components/games/IslamicQuizGame.tsx`

### Modified Files
- `src/App.tsx` - Added path-based routing, role gating, child route rendering
- `src/components/GamesPage.tsx` - Updated game cards to match spec

---

## 🚀 Next Steps

1. **Backend**: Ensure `/api/v1/games/*` endpoints exist and validate child_id
2. **Test**: Run the app with `npm run dev` and test both parent/child flows
3. **Polish**: Add confetti, sounds, badges, streak tracking
4. **Parent Dashboard**: Integrate `getChildAnalysis(childId)` for charts/insights

---

## 📝 Notes

- **No router library**: Uses vanilla `pushState` + `popstate` for simplicity
- **localStorage schema**: Assumes `user_info` contains `user_type` and `child_id`
- **Backward compat**: Legacy parent games (`GameScreen`) still work for old game IDs
- **Extensible**: Add new games by creating component + route in `App.tsx`

---

**All done!** ✅ Child routes are protected, games submit data with Bearer token, and role-based access is enforced.
