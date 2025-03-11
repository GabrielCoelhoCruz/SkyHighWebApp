# CSS Refactoring Documentation

## Approach to CSS Refactoring

This project is in the process of migrating from traditional CSS files to Tailwind CSS. The approach follows these principles:

### 1. Progressive Migration
- **Backward Compatibility**: Original CSS files are maintained during the transition
- **Component-by-Component**: Each React component is refactored individually with Tailwind classes
- **CSS Equivalents**: CSS files include comments showing the Tailwind equivalents

### 2. Implementation Strategy

#### For Components:
- New components use Tailwind classes exclusively
- Refactored components use Tailwind classes but maintain compatibility with existing CSS
- Class-based components gradually transition to functional components with Tailwind

#### For CSS:
- Global CSS is moved to `src/styles/index.css` with proper Tailwind directives
- Complex animations and specialized styles remain in CSS (inside `@layer components`)
- Media queries are replaced with responsive prefixes (e.g., `md:`, `lg:`)

### 3. Best Practices
- Use semantic class names with Tailwind
- Group related Tailwind utilities
- Extract common patterns into components using `@apply`
- Maintain consistent color schemes defined in `tailwind.config.js`

## CSS Organization

- **Global Styles**: `src/styles/index.css`
- **Legacy Styles**: `src/components/Home.css` (being phased out)
- **Component-Specific Styles**: Embedded in components with Tailwind classes

## Examples

### Before:
```css
.button {
  background-color: #1a237e;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
}
```

### After:
```jsx
<button className="bg-indigo-900 text-white py-3 px-6 rounded-full font-semibold">
  Click Me
</button>
```

## Utilities

For complex UI patterns that are used repeatedly, we define Tailwind components using `@apply`:

```css
@layer components {
  .card-hover {
    @apply hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px];
  }
}
```

Then use them in components:
```jsx
<div className="bg-white rounded-xl p-6 card-hover">
  Card content
</div>
``` 