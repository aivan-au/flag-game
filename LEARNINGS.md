# Session Learnings & Collaboration Preferences

This document captures learnings from our UI redesign session to inform future collaboration.

---

## Project Approach

### Experimentation Strategy
- **Branch for experiments**: Create separate branches (`ui-experiment`) to avoid affecting working code
- **Alternative entry points**: Use files like `index2.html` for visual experiments before integrating
- **Debug modes**: Add toggleable debug borders/overlays during development to visualize layout structure
- **Frequent visual validation**: Take screenshots at each iteration to verify changes look correct

### Development Philosophy
- **Iterate, don't overthink**: Start with structure, refine details progressively
- **Keep working version intact**: Never experiment directly on production code
- **Test multiple viewports**: Always verify on both desktop and mobile dimensions

---

## Technical Preferences

### Stack & Dependencies
- **Vanilla over frameworks**: For projects of moderate complexity, prefer vanilla CSS/JS
  - No build step = simpler deployment, especially for PWAs
  - Acceptable to reconsider if code becomes unwieldy
- **Inline SVG for icons**: Zero dependencies, full CSS control, no external requests
  - Lucide-style icons work well (stroke-based, 24x24 viewBox)
- **CSS custom properties**: Use for theming and consistent design tokens
- **No unnecessary abstractions**: Keep solutions direct and minimal

### Layout & Responsive Design
- **CSS Grid for structure**: 3-row grid (header/content/footer) ensures viewport fit
- **`100dvh` for mobile**: Use dynamic viewport height to avoid scroll issues
- **Mobile-first responsive**: Design for mobile, enhance for larger screens
- **Equal priority**: Support both tablet and phone equally

### Code Organization
- **Consistent naming**: BEM-ish conventions for CSS classes
- **Grouped CSS sections**: Clear comment headers for different components
- **Design tokens at top**: All variables in `:root` for easy theming

---

## Design Preferences

### Visual Style
- **Clean and minimal**: Remove unnecessary elements (dropped "Flag Game" title from headers)
- **Visual over textual**: Prefer visual indicators (progress pips) over numbers/text
- **Consistent alignment**: Elements should align to container edges (icons touching borders)
- **Simpler is better**: If something doesn't add value, remove it (dropped current question highlight)

### Component Styling
- **Custom form elements**: Standard checkboxes/inputs should be styled to match overall design
- **Icon buttons**: Solid color, no background, bold stroke for visibility
- **Primary buttons**: Include icons alongside text for visual interest (rocket + Start)
- **Segmented controls**: Preferred over dropdowns for small option sets (5/10/20 questions)

### Color Palette (Current)
```css
--color-primary: #430098;      /* Purple - buttons, icons, selections */
--color-success: #35AF64;      /* Green - correct answers */
--color-error: #FB7C01;        /* Orange - wrong answers */
--color-border: #e2e8f0;       /* Light gray - borders, inactive states */
```

### Typography & Spacing
- **Uppercase for labels**: Pack names, button text, headers
- **Nunito font**: Friendly, rounded sans-serif
- **Consistent spacing scale**: Use defined spacing tokens (space-1 through space-8)

---

## Communication & Decision Style

### How to Present Options
- Provide 2-4 concrete options with trade-offs explained
- Recommend one option but respect that preferences may differ
- Be ready to implement alternatives quickly

### Iteration Pattern
- Willing to try things and see results before deciding
- Not afraid to revert decisions if something doesn't feel right
- Values seeing actual screenshots over descriptions

### Feedback Style
- Gives clear, direct feedback ("I liked it more", "interface is cleaner without it")
- Explains reasoning when suggesting changes
- Open to counter-suggestions with good rationale

---

## UX Considerations

### Target Users
- Primary: Child on tablet (son)
- Secondary: Friends/family via shared URL on phones
- Design should work without instructions

### Accessibility & Usability
- Large touch targets for mobile/tablet
- Clear visual feedback for interactions
- No scrolling required within game screens
- Exit/back options always available

---

## Session-Specific Decisions

### Layout Structure
- 3-row grid: `header | content | footer`
- Header: navigation/status (left-aligned icons)
- Content: main game area (centered, flexible)
- Footer: primary actions (centered buttons)

### Navigation Flow
- Start Screen → Game Screen → End Screen → (Play Again → Game | Exit → Start)
- Options accessible from Start Screen header

### Progress Indicator
- Horizontal pips showing all questions
- Green = correct, Orange = wrong, Gray = unanswered
- No highlight for current question (cleaner)
- Responsive sizing (smaller on mobile)

### Options Available
- Music toggle (default: on)
- Voice toggle (default: on)
- Auto-advance toggle (default: off)
- Questions per round: 5 / 10 / 20 (default: 10)

---

## Future Recommendations

1. **Before starting UI work**: Create experimental branch and alternative entry point
2. **During development**: Keep debug borders on, take frequent screenshots
3. **For new components**: Match existing design tokens and patterns
4. **When uncertain**: Present options visually, iterate based on feedback
5. **Integration**: Once design is approved, migrate changes to main files incrementally

---

*Last updated: Session on UI experiment branch*
