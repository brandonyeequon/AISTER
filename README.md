# AISTER - Teacher Evaluation System (Frontend)

A modern React + Vite + Tailwind CSS frontend for the teacher evaluation system with AI integration.

## Project Structure

```
src/
├── pages/              # Route pages (Login, Dashboard, Evaluations, AdminDashboard)
├── components/         # Reusable components (Button, FormInput, Card, Navbar, etc.)
├── context/            # React Context for global state (AuthContext)
├── utils/              # Utility functions and mock API
├── styles/             # Global CSS and Tailwind setup
├── App.tsx            # Main app routing
└── main.tsx           # Entry point
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173`

### Development

#### Demo Login Credentials
- Email: any email address (e.g., `teacher@example.com`)
- Password: `123456`

#### File Structure Quick Reference

- **Pages**: `/src/pages/` - Full-page components for each route
- **Components**: `/src/components/` - Reusable UI components (Button, Card, FormInput, etc.)
- **Context**: `/src/context/` - AuthContext for authentication state
- **API**: `/src/utils/mockApi.ts` - Mock API responses (swap with real API when ready)
- **Styles**: `/src/styles/globals.css` - Global styles + Tailwind directives

#### Design Tokens

Tailwind config includes custom colors from your design:
- `primary`: `#1c6b3d` (primary green)
- `primary-dark`: `#15552b` (hover state)
- `bg`: `#e3efec` (page background)
- `card`: `#f5f5f5` (card background)
- `text`: `#8f949c` (text color)

## Building

```bash
npm run build
```

Outputs optimized build to `dist/` folder.

## API Integration

Currently using mock API (`utils/mockApi.ts`). To integrate real backend:

1. Update `VITE_API_BASE_URL` in `.env.local` to your backend URL
2. Replace mock API calls in components with real fetch calls
3. Define API contract with backend developer (see `/src/utils/mockApi.ts` for interface examples)

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **React Router v6** - Client-side routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **TypeScript** - Type safety

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (if configured)

## Next Steps

1. Design more detailed components from Figma designs
2. Integrate real API endpoints
3. Add form validation and error handling
4. Implement evaluation form builder
5. Build feedback generation UI
6. Add admin reporting features
