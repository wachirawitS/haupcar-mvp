# 05 — UI components, feedback & errors

> **When to read:** When building screens, tables, dialogs, or feedback.

## 6. UI components

- **shadcn/ui** components with Tailwind. Use the installed primitives before writing new ones.
- `components/ui/` holds generic primitives only: no API calls, no `Car` types. Car-specific UI lives in `features/cars/components/`.
- Do not override a primitive's size, colour, or padding at the call site (`className="h-11 text-sm"`). Use its `variant` or `size`. To change the look everywhere, change the primitive once.
- Layout classes at the call site are fine (width, grid, spacing between blocks, truncation).
- Use the `cn()` helper from `lib/utils.ts` to merge classes.

### 6.1 Usability basics 👁️

- One obvious primary action per screen (e.g. "Add car").
- Labels on every input. Keyboard and focus work. Readable contrast. The layout works on mobile width.
- Destructive actions (delete) always need a confirmation dialog that names the car (registration number).
- Keep the user's input on failure.

## 7. Feedback & error presentation

Choose the presentation by **where the user can fix the problem**, not by HTTP status.

| Situation | Use | Behaviour |
|---|---|---|
| Invalid field | Inline field error | Next to the input, input kept |
| Form rejected, no specific field | Alert inside the form | Stays visible, says what to do next |
| List failed to load | Error state in the list area | Retry button. Never looks like "no cars" |
| No cars yet / no search results | Empty state | Different text for "empty" vs "no match"; offers "Add car" / "Clear search" |
| Saved / deleted successfully | Toast | Short. Skip it if the screen change already makes it obvious |
| Action failed, nothing to fix in place | Error toast | Context kept |
| Before delete | Alert Dialog | Explicit "Delete" / "Cancel"; on failure, show the error inside the still-open dialog |
| Wrong login | Alert near the login button | Does not say which field was wrong |
| Unexpected render crash | Next.js `error.tsx` | Safe message plus retry |

- One owner per notification: the API client, hook, and component must not all announce the same failure. 👁️
- Never show a raw API `message`, stack trace, or technical error. Map `code` to UI text, with a generic fallback.
