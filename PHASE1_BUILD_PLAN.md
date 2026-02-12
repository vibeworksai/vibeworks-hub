# Phase 1: Auth & Onboarding - Implementation Plan

## Database Schema (Neon PostgreSQL)

### 1. Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_place TEXT,
  birth_lat DECIMAL(9,6),
  birth_lng DECIMAL(9,6),
  life_path_number INTEGER NOT NULL,
  sun_sign TEXT NOT NULL,
  invite_code TEXT,
  invited_by TEXT,
  onboarding_complete BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_invite ON users(invite_code);
```

### 2. Invites Table
```sql
CREATE TABLE invites (
  code TEXT PRIMARY KEY,
  created_by TEXT REFERENCES users(id),
  used_by TEXT REFERENCES users(id),
  used_at TIMESTAMP,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invites_code ON invites(code);
```

### 3. Personalized Advice Table
```sql
CREATE TABLE personalized_advice (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  advice_date DATE NOT NULL,
  advice_text TEXT NOT NULL,
  universal_day_number INTEGER,
  horoscope_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, advice_date)
);

CREATE INDEX idx_advice_user_date ON personalized_advice(user_id, advice_date);
```

---

## NextAuth.js v5 Setup

### Dependencies
```bash
npm install next-auth@beta bcryptjs
npm install --save-dev @types/bcryptjs
```

### Files to Create

1. `lib/auth.ts` - NextAuth configuration
2. `app/api/auth/[...nextauth]/route.ts` - Auth API route
3. `middleware.ts` - Protected route middleware
4. `app/login/page.tsx` - Login page
5. `app/register/page.tsx` - Registration with invite code
6. `app/onboarding/page.tsx` - 5-step onboarding wizard

---

## Onboarding Flow

### Step 1: Welcome
- Greeting with user's name
- "Let's personalize your experience"
- Glassmorphism card with gradient

### Step 2: Birth Date
- Date picker (mobile-optimized)
- Required field
- Calculate age for validation

### Step 3: Birth Time (Optional)
- Time picker
- "For more accurate birth chart" hint
- Skip button

### Step 4: Birth Place (Optional)
- Text input with autocomplete (Google Places API or simple text)
- "For precise astrological calculations"
- Skip button

### Step 5: Review & Calculate
- Show collected data
- Calculate Life Path number (preserving 11, 22, 33)
- Determine Sun Sign from birth date
- Display results
- "Complete Setup" button

---

## Life Path Calculation

```typescript
export function calculateLifePath(birthDate: Date): number {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const year = birthDate.getFullYear();
  
  // Sum ALL individual digits
  const dateString = `${month}${day}${year}`;
  let sum = 0;
  
  for (const char of dateString) {
    sum += parseInt(char, 10);
  }
  
  // Preserve Master Numbers (11, 22, 33)
  if (sum === 11 || sum === 22 || sum === 33) {
    return sum;
  }
  
  // Reduce to single digit
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, digit) => 
      acc + parseInt(digit, 10), 0
    );
  }
  
  return sum;
}
```

## Sun Sign Determination

```typescript
export function getSunSign(birthDate: Date): string {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}
```

---

## Design Aesthetic

Matching existing VibeWorks Hub:
- Dark background (#05070d)
- Glassmorphism cards (backdrop-blur, border white/20)
- Cyan accent (#3ec8ff) for primary actions
- Gradient glows on hover
- Framer Motion for smooth transitions
- Inter font
- Mobile-first responsive

---

## Build Order

1. Create database tables in Neon (browser automation)
2. Install NextAuth dependencies
3. Set up auth configuration
4. Build login page
5. Build registration page (with invite validation)
6. Build onboarding wizard (5 steps)
7. Create protected route middleware
8. Test full flow
9. Deploy to Vercel
10. Generate initial invite codes for Ivan & Natasha

---

**Estimated Time: 3-4 hours**
