# Goal Tracker - Project Summary

## What Was Built

A beautiful, fully-functional goal tracking application with local file storage built with Next.js 16, TypeScript, shadcn/ui, and Recharts.

## Features Implemented

### Core Functionality
- ✅ **4 Goal Types** with unique tracking patterns:
  - **Numeric Goals**: Track values over time (e.g., weight loss, muscle gain)
  - **Adherence Goals**: Yes/no daily tracking with streak counter and calendar heatmap
  - **Frequency Goals**: Count occurrences within time periods
  - **Duration Goals**: Track time spent on activities

- ✅ **Entry Management**: Add, edit, and delete entries with optional notes
- ✅ **Milestone System**: Create milestones and visualize them on charts
- ✅ **Notes Support**: Add descriptions to goals and notes to entries

### Visualizations
- **Line Charts**: For numeric goals showing value trends over time
- **Calendar Heatmap**: For adherence goals with streak tracking
- **Bar Charts**: For frequency and duration goals

### Data Storage
- **Local JSON Files**: Goals and entries stored in `/data` directory
- **Simple & Private**: No database setup required, all data stays on your computer
- **Automatic File Creation**: Data files created automatically on first use

### UI/UX
- **Dashboard View**: Cards showing all goals with quick stats
- **Goal Detail Pages**: Full charts, entry history, and management options
- **Beautiful Design**: shadcn/ui components with clean, modern aesthetics
- **Responsive Dialogs**: For creating goals, adding entries, and managing milestones

## Project Structure

```
my-app/
├── app/
│   ├── api/
│   │   ├── goals/
│   │   │   ├── route.ts          # GET, POST goals
│   │   │   └── [id]/route.ts     # GET, PUT, DELETE specific goal
│   │   └── entries/
│   │       ├── route.ts          # GET, POST entries
│   │       └── [id]/route.ts     # GET, PUT, DELETE specific entry
│   ├── goals/
│   │   └── [id]/page.tsx         # Goal detail page
│   ├── page.tsx                  # Dashboard
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn components
│   ├── goal-card.tsx             # Goal card on dashboard
│   ├── add-goal-dialog.tsx       # Create new goal dialog
│   ├── add-entry-dialog.tsx      # Add/edit entry dialog
│   ├── milestone-dialog.tsx      # Manage milestones dialog
│   ├── numeric-chart.tsx         # Line chart for numeric goals
│   ├── adherence-chart.tsx       # Calendar heatmap for adherence
│   ├── frequency-chart.tsx       # Bar chart for frequency
│   └── duration-chart.tsx        # Bar chart for duration
├── lib/
│   ├── types.ts                  # TypeScript type definitions
│   ├── storage.ts                # File system operations
│   └── utils.ts                  # Utilities
└── data/                         # Local data storage
    ├── goals.json                # (auto-generated)
    └── entries.json              # (auto-generated)
```

## Technologies Used

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **shadcn/ui**: Beautiful, accessible UI components
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Powerful charting library
- **date-fns**: Date manipulation
- **Lucide React**: Icon library

## How to Run

1. **Development**:
   ```bash
   npm run dev
   ```
   Opens on http://localhost:3000

2. **Build**:
   ```bash
   npm run build
   ```

3. **Production**:
   ```bash
   npm start
   ```

## Usage Examples

### Creating a Weight Loss Goal
1. Click "New Goal"
2. Select "Numeric" type
3. Set unit to "lbs", direction to "decrease"
4. Add optional target weight and starting value
5. Create milestones like "Lost 10 lbs" at specific values

### Tracking Mouth Guard Usage
1. Click "New Goal"
2. Select "Adherence" type
3. Name it "Mouth Guard"
4. Set target days per week (optional)
5. Click goal card → Add Entry → Select date and mark completed

### Viewing Progress
- Dashboard shows quick stats for each goal
- Click any goal to see detailed charts and full entry history
- Edit or delete entries from the detail page
- Manage milestones from the detail page

## Data Storage

All data is stored in JSON format in the `/data` directory:

- `goals.json`: Contains all goal definitions and configurations
- `entries.json`: Contains all logged entries

These files are automatically created and are human-readable. You can back them up by simply copying the files.

## Future Enhancement Ideas

- Data export/import (CSV, JSON)
- Goal templates for common tracking patterns
- Auto-generated insights and statistics
- Goal archiving functionality
- Date range filters for charts
- Dark mode toggle
- Mobile app version

## Notes

- The app works entirely offline after initial load
- No authentication or user accounts needed
- All processing happens client-side or in API routes
- Data files are excluded from git via `.gitignore`
