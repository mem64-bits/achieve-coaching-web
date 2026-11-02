---
name: shadcn-component
description: Add, find or adapt a shadcn/ui component in this repo, which uses the base-nova style on Base UI (not Radix) with the Achieve dark theme. Use whenever a task needs a dialog, sheet, select, accordion, tooltip, form control or any other shadcn primitive.
argument-hint: "[component-name]"
allowed-tools: mcp__shadcn__search_items_in_registries mcp__shadcn__view_items_in_registries mcp__shadcn__get_item_examples_from_registries mcp__shadcn__get_add_command_for_items mcp__shadcn__list_items_in_registries mcp__shadcn__get_project_registries
---

# shadcn component: $ARGUMENTS

Installed primitives: !`node -e "console.log(require('fs').readdirSync('src/components/ui').join(', '))"`

## Rules for this repo

- `components.json` uses style `base-nova`, icon library `lucide`, CSS variables, and aliases `@/components/ui`, `@/lib/utils`. Components are built on `@base-ui/react`, so props and composition differ from Radix examples found online (for example `render` props instead of `asChild`). Always read the registry item before using it.
- Theme colours come from `src/styles/theme.css`. After adding a component, make sure it reads correctly on the AMOLED black background: check `--popover`, `--border`, `--ring` and focus states.

## Steps

1. If the primitive is already installed (list above), reuse it and stop here.
2. Use the shadcn MCP server: search the registry for the component, view the item and its examples, then get the add command.
3. Run the add command (it will ask for permission). Review the diff in `src/components/ui/` and `package.json`.
4. Use the primitive from a section or island component. Do not restyle the primitive file itself unless the user agrees; prefer `className` overrides at the call site with `cn()`.
5. Run `npm run check` and look at the result in the browser (Playwright MCP) including keyboard focus and Escape-to-close for overlays.
