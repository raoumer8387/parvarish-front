# Child Games - Route Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN PAGE                               │
│  User selects: [ Parent ] or [ Child ]                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
      PARENT                 CHILD
          │                     │
          ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│  Parent Routes   │   │  Child Routes    │
│  (Dashboard,     │   │  /child/games    │
│   Chatbot,       │   │                  │
│   Settings)      │   │  Games Hub:      │
│                  │   │  ┌──────────────┐│
│  ❌ Cannot       │   │  │ Memory Match ││
│     access       │   │  │ Mood Picker  ││
│     /child/*     │   │  │ Scenario     ││
└──────────────────┘   │  │ Islamic Quiz ││
                       │  └──────┬───────┘│
                       │         │        │
                       │         ▼        │
                       │  ┌──────────────┐│
                       │  │ Game Screen  ││
                       │  │ (Submit API) ││
                       │  └──────────────┘│
                       │                  │
                       │  ❌ Cannot       │
                       │     access       │
                       │     parent pages │
                       └──────────────────┘
```

---

## 📍 Route Mapping

### Child Routes (Protected)

```
/child/games                 → GamesPage (hub with 4 cards)
/child/games/memory          → MemoryGame component
/child/games/mood            → MoodPickerGame component
/child/games/scenario        → ScenarioGame component
/child/games/islamic-quiz    → IslamicQuizGame component
```

### Parent Routes (Hidden from children)

```
/                            → ParentDashboard or ChatbotInterface
/parent-onboarding           → ParentOnboarding wizard
(sidebar pages: dashboard, chatbot, settings, activities)
```

---

## 🔒 Access Control Matrix

| Route               | Parent Access | Child Access |
|---------------------|---------------|--------------|
| `/`                 | ✅ Yes        | ❌ No → redirect to `/child/games` |
| `/chatbot`          | ✅ Yes        | ❌ No → redirect to `/child/games` |
| `/settings`         | ✅ Yes        | ❌ No → redirect to `/child/games` |
| `/dashboard`        | ✅ Yes        | ❌ No → redirect to `/child/games` |
| `/child/games`      | ❌ No → redirect to `/` | ✅ Yes |
| `/child/games/*`    | ❌ No → redirect to `/` | ✅ Yes |

---

## 🔄 API Flow (Child Game Submission)

```
┌─────────────────────────────────────────────────────────────┐
│  CHILD PLAYS GAME                                            │
│  (e.g., Memory Match at /child/games/memory)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Click "Submit Result" │
         └───────────┬───────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │ getChildId() from localStorage│
      │ (validates child_id exists)   │
      └───────────┬──────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────────┐
   │ POST /api/v1/games/memory/submit    │
   │ Headers: Authorization: Bearer {JWT}│
   │ Body: {                             │
   │   child_id: 123,                    │
   │   total_flips: 20,                  │
   │   correct_matches: 8,               │
   │   wrong_matches: 2,                 │
   │   time_taken_seconds: 45            │
   │ }                                   │
   └───────────┬─────────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
   SUCCESS           ERROR
      │                 │
      ▼                 ▼
┌─────────────┐  ┌──────────────────┐
│ Show Toast: │  │ Show Error Toast:│
│ "Nice job!  │  │ - 403: "You can  │
│ Cognitive:  │  │   only submit    │
│ 78, Focus:  │  │   your own       │
│ 70"         │  │   results"       │
│             │  │ - Network error  │
└─────────────┘  └──────────────────┘
```

---

## 📊 Parent Analysis Flow (Future Dashboard Integration)

```
┌───────────────────────────────────────────────┐
│ PARENT DASHBOARD                               │
│ Viewing child progress for child_id: 123      │
└────────────────┬──────────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────┐
    │ GET /api/v1/games/123/analysis  │
    │ Headers: Authorization: Bearer  │
    └────────────┬────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────┐
    │ Response:                        │
    │ {                                │
    │   dominant_strength: "Cognitive",│
    │   needs_improvement: "Moral",    │
    │   suggested_task: "Honesty task",│
    │   category_scores: {             │
    │     emotional: 72,               │
    │     cognitive: 80,               │
    │     moral: 60,                   │
    │     spiritual: 55                │
    │   }                              │
    │ }                                │
    └────────────┬────────────────────┘
                 │
                 ▼
       ┌──────────────────┐
       │ Render Charts &  │
       │ Insights         │
       └──────────────────┘
```

---

## 🎮 Game Cards (Games Hub)

```
┌────────────────────────────────────────────────────┐
│  Pick a game to play today! Your progress helps   │
│  unlock new activities.                            │
└────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 🧠 Memory    │ 😊 Mood      │ 🎯 What      │ 📖 Islamic   │
│    Match     │    Picker    │    Would     │    Quiz      │
│              │              │    You Do?   │              │
│ Test your    │ Choose       │ Make wise    │ Learn and    │
│ focus and    │ feelings for │ choices      │ answer       │
│ memory       │ different    │              │              │
│              │ situations   │              │              │
│              │              │              │              │
│ [Play Now]   │ [Play Now]   │ [Play Now]   │ [Play Now]   │
│              │              │              │              │
│ Easy         │ Easy         │ Medium       │ Easy         │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 🏗️ Component Hierarchy

```
App
├── LoginPage
│   └── [Child/Parent Selection]
│
├── ParentOnboarding (if needed)
│
├── Child Flow (userType === 'child')
│   ├── /child/games → GamesPage
│   │   └── Game Cards (4 games)
│   │       ├── onClick → handleStartGame('memory')
│   │       ├── onClick → handleStartGame('mood')
│   │       ├── onClick → handleStartGame('scenario')
│   │       └── onClick → handleStartGame('islamic-quiz')
│   │
│   └── Game Routes (conditional rendering)
│       ├── /child/games/memory → MemoryGame
│       ├── /child/games/mood → MoodPickerGame
│       ├── /child/games/scenario → ScenarioGame
│       └── /child/games/islamic-quiz → IslamicQuizGame
│
└── Parent Flow (userType === 'parent')
    ├── AppSidebar
    ├── ParentDashboard
    ├── ChatbotInterface
    ├── SettingsPage
    └── ActivitiesPage
```

---

## 🔐 Security Checks (Frontend + Backend)

### Frontend (Role Gating)
```typescript
// Check on every path change
if (userType === 'child' && !path.startsWith('/child')) {
  redirect('/child/games');
}
if (userType === 'parent' && path.startsWith('/child')) {
  redirect('/');
}
```

### Backend (Expected Validation)
```python
# Example pseudo-code for backend validation
def submit_game_result(request):
    jwt_user = decode_jwt(request.headers['Authorization'])
    submitted_child_id = request.body['child_id']
    
    # Verify child_id matches JWT profile
    if jwt_user.child_id != submitted_child_id:
        return 403 Forbidden("You can only submit your own results")
    
    # Process submission...
    return 200 OK
```

---

**All routes are protected, API submissions validated, and role-based access enforced!** 🚀
