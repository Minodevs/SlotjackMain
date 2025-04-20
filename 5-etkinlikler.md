<summary_title>
Gaming Platform Promotional Campaigns Dashboard
</summary_title>

<image_analysis>
1. Content Structure:
- Main Content Elements: 5 promotional campaign cards with branded banners
- Content Grouping: Cards arranged in grid layout with consistent formatting
- Visual Hierarchy: Large banner images dominate each card with supporting text below
- Content Types: Banner images, logos, text, progress bars, interactive elements
- Text Elements: Campaign titles in Turkish, status indicators, action buttons

2. Layout Structure:
- Content Distribution: 3-column grid layout in top row, 2-column in bottom row
- Spacing Patterns: Consistent padding between cards and internal elements
- Container Structure: Dark themed cards with orange accent borders
- Grid/Alignment: Left-aligned content within cards, responsive grid system
- Responsive Behavior: Cards likely stack vertically on smaller screens

3. UI Components (Page-Specific):
- Content Cards: Promotional campaign containers with consistent styling
- Interactive Elements: Progress bars, download/action buttons
- Data Display Elements: Status indicators, campaign metrics
- Status Indicators: Progress tracking bars with numerical values
- Media Components: Large banner images with brand integration

4. Interactive Patterns:
- Content Interactions: Clickable campaign cards with hover states
- State Changes: Progress bar updates, button hover effects
- Dynamic Content: Campaign status updates, progress tracking
- Mobile Interactions: Touch-friendly card design with adequate spacing

</image_analysis>

<development_planning>
1. Component Structure:
- CampaignCard component with banner, title, and progress tracking
- ProgressBar component for status indication
- ActionButton component for user interactions
- Campaign interface defining required data structure

2. Content Layout:
- CSS Grid implementation for responsive card layout
- Flexbox for internal card content organization
- Consistent spacing using CSS custom properties
- Dynamic height adjustment for varying content

3. Integration Points:
- Theme integration with global dark mode
- Shared button and progress bar components
- Campaign data fetching and state management
- Real-time progress updates

4. Performance Considerations:
- Lazy loading of campaign banner images
- Optimized image formats and compression
- Efficient progress bar rendering
- Minimal re-renders for status updates
</development_planning>