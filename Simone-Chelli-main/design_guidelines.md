# Design Guidelines - RAPPORTINI EURO EL

## Design Approach

**Selected Approach**: Design System - Material Design adapted for enterprise productivity

**Justification**: RAPPORTINI EURO EL is a utility-focused, data-intensive application requiring efficient data entry, clear information hierarchy, and professional presentation. Material Design provides excellent form handling, data tables, and visual feedback patterns ideal for daily employee time tracking and administrative oversight.

**Core Principles**:
1. **Clarity First**: Every interaction must be immediately understandable for daily users
2. **Efficiency**: Minimize clicks and cognitive load for rapid daily reporting
3. **Data Integrity**: Visual confirmation of all actions and clear editing capabilities
4. **Professional Trust**: Clean, organized interface befitting business operations

---

## Typography System

**Font Family**: 
- Primary: Inter (via Google Fonts CDN)
- Fallback: system-ui, sans-serif

**Type Scale**:
- **Page Titles/Headers**: text-3xl (30px), font-bold
- **Section Headers**: text-xl (20px), font-semibold
- **Card/Component Headers**: text-lg (18px), font-medium
- **Body Text**: text-base (16px), font-normal
- **Labels/Secondary**: text-sm (14px), font-medium
- **Meta/Helper Text**: text-xs (12px), font-normal

**Line Heights**:
- Headings: leading-tight
- Body text: leading-relaxed
- Forms/Data: leading-normal

---

## Layout & Spacing System

**Tailwind Spacing Units**: Consistent use of 2, 4, 6, 8, 12, 16 units
- Micro spacing (form elements): p-2, gap-2
- Standard component padding: p-4, p-6
- Section spacing: p-8, py-12
- Major layout gaps: gap-6, gap-8
- Page margins: px-4 md:px-8 lg:px-16

**Container Strategy**:
- Application wrapper: max-w-7xl mx-auto
- Forms/Cards: max-w-2xl
- Admin tables: w-full with horizontal scroll on mobile
- Calendar views: max-w-4xl

**Grid Patterns**:
- Employee dashboard: Single column mobile, sidebar navigation desktop
- Admin dashboard: Responsive grid (grid-cols-1 lg:grid-cols-3) for stats cards
- Data tables: Full-width responsive with sticky headers

---

## Component Library

### Navigation

**Employee Navigation**:
- Top bar with logo "RAPPORTINI EURO EL", user name, logout button
- Sticky positioning (sticky top-0)
- Height: h-16
- Padding: px-6
- Shadow: shadow-md

**Admin Navigation**:
- Sidebar layout for desktop (w-64)
- Collapsible hamburger menu for mobile
- Navigation items with icons (Heroicons)
- Active state indication with border accent

### Calendar/Timesheet Interface

**Daily Entry Card**:
- Prominent date display at top (text-2xl, font-bold)
- Radio button group for type selection: LAVORATO / MALATTIA / FERIE
- Conditional rendering: Phase dropdown appears only when LAVORATO selected
- Hours display: "8 ore" badge for MALATTIA/FERIE, dropdown for LAVORATO
- Submit button: w-full, py-3, text-lg, font-semibold
- Edit mode toggle for submitted entries

**Phase Selection Dropdown**:
- Searchable select component (use Headless UI Combobox)
- Grouped options by phase category (BOR01xx, BOR02xx, etc.)
- Full phase code and description displayed
- Max height with scroll: max-h-96 overflow-y-auto
- Clear visual separation between groups

**Hours Selection**:
- Simple dropdown with numbers 1-24
- Large touch targets (min-h-12)
- Current selection prominently displayed

### Forms & Inputs

**Input Fields**:
- All inputs: rounded-lg, border-2, px-4, py-3
- Focus state: ring-4 ring-opacity-50
- Label above input: text-sm, font-medium, mb-2
- Helper text below: text-xs, mt-1
- Error states: border-red-500 with error message

**Buttons**:
- Primary action: px-6, py-3, rounded-lg, font-semibold, shadow-md
- Secondary: px-4, py-2, rounded-lg, font-medium
- Icon buttons: p-2, rounded-full
- Disabled state: opacity-50, cursor-not-allowed

### Admin Dashboard Components

**Employee Overview Cards**:
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6
- Each card: rounded-xl, p-6, shadow-lg
- Employee name: text-lg, font-semibold
- Quick stats: Total ore lavorate, giorni malattia, giorni ferie
- Action button: "Visualizza dettagli"

**Hours Tracking Table**:
- Sticky header row: sticky top-0, font-semibold
- Zebra striping: odd:bg-gray-50
- Column structure: Fase | Ore Totali | Indicatore Soglia
- Status indicators: 
  - Badge component (rounded-full, px-3, py-1, text-xs, font-bold)
  - Green indicator: ore ≤ soglia
  - Red indicator: ore > soglia
- Sorting controls in headers (Heroicons chevrons)

**Phase Management Interface**:
- List view with edit/delete actions per row
- Add new phase: Modal dialog (max-w-lg)
- Form fields: Codice fase, Descrizione, Categoria, Soglia ore
- Bulk actions toolbar when multiple selected

**Threshold Configuration**:
- Simple input field per phase: type="number", min="1"
- Global default setting: Prominent card at top
- Real-time preview of affected phases
- Save confirmation modal

### Data Visualization

**Hours Summary Charts** (use Chart.js via CDN):
- Bar chart showing ore per fase
- Threshold line overlay
- Responsive container: aspect-w-16 aspect-h-9
- Legend positioned top-right
- Tooltips showing exact values

**Employee Activity Heatmap** (future):
- Calendar grid showing giorni lavorati
- Color intensity based on ore

### Modals & Overlays

**Confirmation Dialogs**:
- Centered overlay: fixed inset-0, flex items-center justify-center
- Backdrop: bg-black bg-opacity-50
- Dialog: rounded-xl, max-w-md, p-6
- Title: text-xl, font-bold, mb-4
- Action buttons: flex gap-4, justify-end

**Edit Entry Modal**:
- Same calendar entry form as main interface
- Pre-populated with existing values
- "Salva modifiche" primary button
- "Annulla" secondary button

### Feedback & States

**Loading States**:
- Skeleton screens for tables (animate-pulse)
- Spinner for button actions (Heroicons: ArrowPathIcon with animate-spin)
- Progress bar for bulk operations

**Success/Error Messages**:
- Toast notifications: fixed top-4 right-4, rounded-lg, p-4, shadow-xl
- Auto-dismiss after 5 seconds
- Icon + message + close button
- Slide-in animation (transition-transform)

**Empty States**:
- Centered illustration placeholder
- Helpful message: text-lg, text-center
- Call-to-action button when applicable

### Authentication

**Login Page**:
- Centered card: max-w-md, mx-auto, mt-20
- Logo/Title: text-4xl, font-bold, text-center, mb-8
- Email input with icon (Heroicons: EnvelopeIcon)
- Password input with show/hide toggle
- "Accedi" button: w-full, py-3
- Forgot password link: text-sm, text-center, mt-4

**Session Management**:
- Inactivity warning modal at 55 minutes
- Auto-logout redirect to login page
- Session indicator in navigation bar

---

## Responsive Behavior

**Breakpoints** (Tailwind defaults):
- Mobile: base (< 640px)
- Tablet: md (≥ 768px)
- Desktop: lg (≥ 1024px)
- Wide: xl (≥ 1280px)

**Mobile Adaptations**:
- Navigation: Hamburger menu replaces sidebar
- Tables: Horizontal scroll or card-based layout
- Forms: Full-width inputs, increased touch targets (min-h-12)
- Calendar: Single day view, swipe for navigation
- Admin charts: Stacked, aspect ratio adjusted

**Desktop Enhancements**:
- Sidebar always visible for admin
- Multi-column layouts for stats
- Hover states on interactive elements
- Keyboard shortcuts (future enhancement)

---

## Accessibility Standards

**WCAG 2.1 AA Compliance**:
- All interactive elements: min-h-11 for touch targets
- Form labels: always visible, properly associated
- Focus indicators: visible ring on all focusable elements
- Skip navigation link for keyboard users
- ARIA labels for icon-only buttons
- Semantic HTML: proper heading hierarchy, landmark regions

**Screen Reader Optimization**:
- Status announcements for form submissions
- Table headers properly scoped
- Dropdown current selection announced
- Loading states announced

---

## Animation & Transitions

**Minimal, Purposeful Animations**:
- Page transitions: None (instant load)
- Modal enter/exit: transition-opacity, duration-200
- Dropdown open: transition-all, duration-150
- Button feedback: scale-95 on active state
- Toast notifications: slide-in-right, duration-300
- Loading spinners: animate-spin (only when required)

**No Decorative Animations**: Focus remains on data clarity and interaction speed.

---

## Assets & Icons

**Icon Library**: Heroicons (via CDN)
- Navigation: HomeIcon, ChartBarIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon
- Forms: CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon
- Actions: PencilIcon, TrashIcon, PlusIcon, ArrowDownTrayIcon
- Status: ExclamationTriangleIcon, CheckBadgeIcon

**Logo/Branding**:
- "RAPPORTINI EURO EL" text logo in navigation
- Consistent placement: top-left, text-2xl, font-bold

**No Custom Images Required**: This is a pure data application without marketing needs.