<div align="center">

# Health & Fitness AI Assistant

> **Built by: Claude Code and OpenCode**

</div>

A comprehensive, AI-powered health and fitness web application that provides personalized meal plans, exercise recommendations, nutritional analysis, and smart scheduling.

## Features

### Authentication
- User registration with username, email, phone number, and password
- Secure login with JWT tokens
- Password hashing with bcrypt (12 rounds)
- Automatic token refresh

### Onboarding / Profile Setup
- Multi-step wizard to collect user health data
- Weight, height, age, gender, and activity level input
- Automatic BMR and daily calorie calculation using Mifflin-St Jeor equation
- Feature gating: Calendar and AI features unlock only after profile completion

### AI Integration (Groq API)
- **Meal Planning**: Generate personalized breakfast, lunch, dinner, and snack recommendations
- **Exercise Recommendations**: Get workout suggestions based on your profile and goals
- **Nutrition Search**: Look up any food for detailed nutritional breakdown including:
  - Calories and macros
  - Vitamins and minerals
  - Health Score (0-100)
  - Goal compatibility assessment

### Smart Scheduling
- Calendar interface for planning meals and workouts
- Add, edit, complete, and delete schedule entries
- Visual indicators for days with scheduled items
- Type-coded entries (meal, workout, reminder)

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq SDK (Llama 3.3 70B)
- **Security**: bcryptjs, jsonwebtoken, helmet, express-rate-limit
- **Validation**: express-validator

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State**: Context API + Zustand patterns
- **HTTP**: Axios
- **Icons**: Lucide React
- **Calendar**: react-calendar

## Project Structure

```
health-fitness-ai/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase, Groq configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # JWT auth, validation
│   │   ├── routes/          # Express routes
│   │   ├── services/        # AI service (HealthBrain)
│   │   ├── utils/           # BMR calculator, password hashing
│   │   └── server.js        # Entry point
│   ├── schema.sql           # Database schema
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Reusable UI components
│   │   │   ├── auth/        # Auth-related components
│   │   │   └── ...
│   │   ├── context/         # Auth, Profile contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   └── App.jsx          # Main app with routing
│   ├── index.html
│   ├── package.json
│   └── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Groq API key (get from https://console.groq.com)

### 1. Clone and Navigate
```bash
cd "C:\Users\Wincent\Wincent VS Code\_sp\Homework\03"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env with your credentials:
# - SUPABASE_URL: Your Supabase project URL
# - SUPABASE_KEY: Your Supabase anon key
# - GROQ_API_KEY: Your Groq API key
# - JWT_SECRET: Any secure random string
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `backend/schema.sql`
4. Run the SQL to create all tables, indexes, and RLS policies

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env if needed (default: http://localhost:5000/api)
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| GET | `/api/profile/health` | Get health profile |
| POST | `/api/profile/health` | Save health profile |

### AI Features (requires health profile)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/meal-plan` | Generate meal plan |
| POST | `/api/ai/exercises` | Get exercise recommendations |
| POST | `/api/ai/nutrition-search` | Search food nutrition |
| POST | `/api/ai/analyze-meal` | Analyze a meal |

### Schedule (requires health profile)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedule` | Get schedule entries |
| POST | `/api/schedule` | Create entry |
| PUT | `/api/schedule/:id` | Update entry |
| PATCH | `/api/schedule/:id/complete` | Mark complete |
| DELETE | `/api/schedule/:id` | Delete entry |

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Health Calculations

### BMR (Mifflin-St Jeor Equation)
- **Male**: `10 x weight(kg) + 6.25 x height(cm) - 5 x age + 5`
- **Female**: `10 x weight(kg) + 6.25 x height(cm) - 5 x age - 161`
- **Other**: Average of male and female formulas

### Daily Calories
`BMR x Activity Multiplier + Goal Adjustment`

| Activity Level | Multiplier |
|---------------|------------|
| Sedentary | 1.2 |
| Light | 1.375 |
| Moderate | 1.55 |
| Active | 1.725 |
| Very Active | 1.9 |

| Goal | Adjustment |
|------|------------|
| Lose | -500 kcal |
| Maintain | 0 kcal |
| Gain | +500 kcal |

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT authentication with short-lived tokens (15 min)
- Refresh token rotation (7 days)
- Rate limiting (100 req/15min, 10 auth req/15min)
- Helmet security headers
- CORS configuration
- Input validation with express-validator
- Row Level Security (RLS) in Supabase
