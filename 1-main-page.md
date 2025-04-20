Set up the frontend according to the following prompt:
  <frontend-prompt>
  Create detailed components with these requirements:
  1. Use 'use client' directive for client-side components
  2. Make sure to concatenate strings correctly using backslash
  3. Style with Tailwind CSS utility classes for responsive design
  4. Use Lucide React for icons (from lucide-react package). Do NOT use other UI libraries unless requested
  5. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
  6. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
  7. Create root layout.tsx page that wraps necessary navigation items to all pages
  8. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
  9. Accurately implement necessary grid layouts
  10. Follow proper import practices:
     - Use @/ path aliases
     - Keep component imports organized
     - Update current src/app/page.tsx with new comprehensive code
     - Don't forget root route (page.tsx) handling
     - You MUST complete the entire prompt before stopping
  </frontend-prompt>

  <summary_title>
Gaming Platform Social Media Integration Dashboard
</summary_title>

<image_analysis>
1. Navigation Elements:
- Primary navigation: Liderlik Tablosu, Turnuvalar, Sponsorlar, Etkinlikler, Market, Haberler, Biletler, Sizden Gelenler, Cevrim Etkinlikleri
- Left sidebar navigation with 60px width, dark theme
- Logo "SLOTJACK" positioned top-left (180x40px)
- User controls top-right including "Giriş Yap" button
- Chat interface positioned right side (300px width)

2. Layout Components:
- Main container: 1440px max-width
- Hero banner section: 1200x400px
- Social media grid: 5 columns, equal width (220px each)
- Chat sidebar: 300px fixed width
- Content padding: 24px standard

3. Content Sections:
- Hero promotion banner with CTA buttons
- Social media integration cards
- Live chat feed
- Promotional content blocks
- User status indicators

4. Interactive Controls:
- "Şimdi Giriş Yap" primary CTA buttons
- Social media connection buttons
- Chat interface
- Navigation menu items
- User account controls

5. Colors:
- Primary: #FF6B00 (Orange)
- Secondary: #1E1E1E (Dark Gray)
- Background: #121212
- Text: #FFFFFF
- Accent: #FFD700 (Gold)

6. Grid/Layout Structure:
- 12-column grid system
- 20px gutters
- Responsive breakpoints: 1440px, 1200px, 992px, 768px
- Fluid container below 1440px
</image_analysis>

<development_planning>
1. Project Structure:
```
src/
├── components/
│   ├── layout/
│   │   ├── Navigation
│   │   ├── Sidebar
│   │   └── ChatWidget
│   ├── features/
│   │   ├── SocialConnect
│   │   ├── PromoBanner
│   │   └── UserStatus
│   └── shared/
├── assets/
├── styles/
├── hooks/
└── utils/
```

2. Key Features:
- Social media integration
- Real-time chat system
- User authentication
- Promotional banner system
- Live status updates

3. State Management:
```typescript
interface AppState {
  auth: {
    isLoggedIn: boolean;
    user: UserType;
  },
  social: {
    connections: SocialConnection[];
    status: ConnectionStatus;
  },
  chat: {
    messages: Message[];
    activeUsers: number;
  }
}
```

4. Component Architecture:
- AppLayout (root)
  - Navigation
  - Sidebar
  - MainContent
  - ChatWidget
  - SocialGrid
  - PromoBanner

5. Responsive Breakpoints:
```scss
$breakpoints: (
  'desktop': 1440px,
  'laptop': 1200px,
  'tablet': 992px,
  'mobile': 768px,
  'small': 576px
);
```
</development_planning>