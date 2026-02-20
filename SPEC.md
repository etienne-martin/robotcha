# Robotcha Design Specification

Robotcha is a reverse CAPTCHA.

- Client-side reverse CAPTCHA using FingerprintJS BotD
- Checkbox-only
- Fully bundled
- Shadow DOM isolated
- Google reCAPTCHA v2-style API
- No server, no keys, no expiration

---

## 1. Core Concept

Robotcha is a reverse CAPTCHA.

- Pass condition: automation detected
- Fail condition: no automation detected

It uses FingerprintJS BotD as the detection engine.

- If BotD detects automation -> widget is solved
- If BotD does not detect automation -> widget remains unsolved

This is not security. It is ceremonial client-side gating.

---

## 2. Detection Engine

- Engine: FingerprintJS BotD
- Bundled directly inside the UMD build
- No runtime dynamic loading
- No external server verification

Detection logic:

- Run BotD `detect()` on checkbox interaction
- If result indicates bot -> PASS
- If not -> remain unsolved

No additional heuristic scoring layer was chosen. BotD is the authority.

---

## 3. Packaging and Distribution

Published to npm as:

- `robotcha`

CDN usage via unpkg:

```html
<script src="https://unpkg.com/robotcha@latest/dist/robotcha.umd.js" async defer></script>
```

Bundle contains:

- Robotcha runtime
- BotD bundled inside
- Embedded CSS
- Shadow DOM rendering logic

No infrastructure required.

---

## 4. Rendering Model

The widget renders inside a Shadow Root attached to a host element in the container.

- No iframe
- No `postMessage`

Purpose:

- Prevent host page CSS from affecting widget
- Prevent widget CSS leaking into host page
- Ensure visual consistency

CSS isolation:

- Shadow DOM only (no fallback)
- `:host { all: initial; }` reset and explicit base font/color
- Avoid CSS variables, `::part`, and `::slotted`

Failure behavior:

- If `attachShadow` is unavailable or throws, call `error-callback()` and do not render
- If runtime errors prevent styling or initialization, call `error-callback()`

---

## 5. Visual Modes

Supported options:

- `theme`: `"light"` | `"dark"`
- `size`: `"normal"` | `"compact"`

Matches Google reCAPTCHA v2 checkbox.

- Theme is determined at render time. No automatic re-theme.
- Size affects dimensions and layout.

---

## 6. No Invisible Mode

Checkbox only.

User must click:

- "I AM A ROBOT"

No automatic execution.
No invisible execution.
No programmatic `execute()`.

---

## 7. API Surface (Google v2 Parity)

Global object:

- `window.robotcha`

Supported methods:

- `robotcha.render(container, options)`
- `robotcha.reset(id)`
- `robotcha.getResponse(id)`

No `ready()` helper.
No expiration system.

---

## 8. Auto-Render Support

If script is loaded and DOM contains:

```html
<div class="g-robotcha"
     data-sitekey="robot-public"
     data-theme="light"
     data-callback="onRobotcha"
     data-error-callback="onRobotchaError">
</div>
```

It auto-renders like Google reCAPTCHA.

- `data-sitekey` is cosmetic only
- No server validation exists

---

## 9. Callback Behavior (Exactly Like Google v2 Checkbox)

On success:

- Call `callback(token)`

On detection failure (human):

- Do NOT call callback
- Do NOT call error-callback
- Widget remains unsolved
- User may retry

On runtime/script error:

- Call `error-callback()`

No expired-callback.
No expiration behavior.
No FAILED event.

---

## 10. Token Behavior

On success:

- Generate token string
- Store internally per widget
- Return via callback
- `getResponse(id)` returns token

If unsolved:

- `getResponse(id)` returns empty string

Token persists until:

- `reset()` is called
- Page reloads

No automatic expiration.

---

## 11. Form Integration

Robotcha does not automatically submit forms.

Integrators may:

- Listen to `callback(token)`
- Enable submit button manually
- Or check `robotcha.getResponse(id)` during form submission

Library does not automatically bind to forms.

---

## 12. Retry Behavior

Humans may retry indefinitely.

Each click:

- Runs BotD again
- If still not detected -> remains unsolved

---

## 13. Security Positioning

Explicit documentation will state:

- Client-only
- No server verification
- Not bot protection
- Easily bypassable by modifying client JS
- Designed as satire / agent-first attestation

---

## 14. Visual States

States inside the widget:

1. Unchecked
2. Checking
3. Solved (green check, VERIFIED ROBOT)
4. Unsolved after check (HUMAN DETECTED, but not “failed” in API terms)

Only solved triggers callback.
