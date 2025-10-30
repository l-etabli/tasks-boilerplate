# shadcn/ui Monorepo Setup

This document describes the shadcn/ui configuration in this monorepo, following the latest 2025 recommendations.

## Architecture

The project uses a **monorepo structure** for shadcn/ui components:

```
packages/ui/              # Shared UI components package
  ├── src/
  │   ├── components/     # shadcn/ui components
  │   ├── lib/            # Utility functions (cn, utils)
  │   ├── hooks/          # Shared React hooks
  │   └── styles/
  │       └── globals.css # Tailwind CSS with shadcn theme variables
  ├── components.json     # shadcn CLI configuration
  └── package.json        # Package exports

apps/web/                 # Main web application
  ├── src/
  │   └── styles.css      # Imports @tasks/ui/globals.css
  ├── components.json     # shadcn CLI configuration for this app
  └── tsconfig.json       # Path aliases for @tasks/ui
```

## Key Features

### 1. Centralized UI Components

All shadcn/ui components are stored in `packages/ui` and can be imported by any app in the monorepo:

```tsx
import { Button } from "@tasks/ui/components/button";
import { Badge } from "@tasks/ui/components/badge";
```

### 2. Shared Theme and Styles

The theme is defined in `packages/ui/src/styles/globals.css` using:
- **Tailwind CSS v4** with the new `@import` syntax
- **CSS Variables** for theming (light/dark mode support)
- **shadcn/ui "new-york" style** with neutral base color

Apps import this global stylesheet:

```css
/* apps/web/src/styles.css */
@import "@tasks/ui/globals.css";
```

### 3. shadcn CLI Support

Both `packages/ui` and `apps/web` have `components.json` files, enabling the shadcn CLI to work correctly in the monorepo:

```bash
# From the root, add components to packages/ui
cd packages/ui
npx shadcn@latest add [component-name]

# Components are automatically available to all apps
```

The CLI configuration uses these aliases:
- `@tasks/ui/components/*` → Component imports
- `@tasks/ui/lib/utils` → Utility functions (cn helper)
- `@tasks/ui/hooks/*` → Shared hooks

### 4. TypeScript Configuration

Apps are configured to resolve `@tasks/ui` imports through:

1. **Workspace dependencies** in `package.json`:
```json
{
  "dependencies": {
    "@tasks/ui": "workspace:*"
  }
}
```

2. **Path aliases** in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@tasks/ui/*": ["../../packages/ui/src/*"]
    }
  }
}
```

3. **Package exports** in `packages/ui/package.json`:
```json
{
  "exports": {
    "./globals.css": "./src/styles/globals.css",
    "./lib/*": "./src/lib/*.ts",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts"
  }
}
```

## Available Components

Current shadcn/ui components in the package:

- ✅ **Button** - Multiple variants (default, secondary, destructive, outline, ghost, link)
- ✅ **Badge** - Status badges with variants
- ✅ **Dropdown Menu** - Accessible dropdown menus
- ✅ **Theme Provider** - Dark/light mode support with next-themes
- ✅ **Mode Toggle** - Theme switcher component

## Adding New Components

To add a new shadcn/ui component:

```bash
# Navigate to the UI package
cd packages/ui

# Add the component using shadcn CLI
npx shadcn@latest add [component-name]

# The component will be automatically available in all apps
```

## Usage Example

See `apps/web/src/components/example/ShadcnExample.tsx` for a working example:

```tsx
import { Button } from "@tasks/ui/components/button";
import { Badge } from "@tasks/ui/components/badge";

export function MyComponent() {
  return (
    <div>
      <Button variant="default">Click me</Button>
      <Badge>New</Badge>
    </div>
  );
}
```

## Theme Customization

To customize the theme, edit `packages/ui/src/styles/globals.css`:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  /* ... more CSS variables */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... dark mode variables */
}
```

## Technology Stack

- **Tailwind CSS v4** - Latest version with new features
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **class-variance-authority** - Variant API for components
- **next-themes** - Theme management

## Benefits of This Setup

1. ✅ **Single Source of Truth** - Components defined once, used everywhere
2. ✅ **Consistent Design** - Shared theme across all apps
3. ✅ **Easy Maintenance** - Update components in one place
4. ✅ **Type Safety** - Full TypeScript support
5. ✅ **CLI Compatible** - Works with `shadcn@latest` CLI
6. ✅ **Developer Experience** - Auto-imports, IntelliSense, etc.

## Notes

- The setup follows the **official shadcn/ui monorepo recommendations for 2025**
- Components use the **"new-york" style** (you can change this in `components.json`)
- The theme uses **CSS variables** for easy customization
- All components support **dark mode** out of the box
