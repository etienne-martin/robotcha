# ROBOTCHA

**Robot‑Optimized Bot‑Only Turing Check for Human Absence**

ROBOTCHA is a reverse CAPTCHA. If automation is detected, the checkbox is solved. If not, it stays unsolved.

ROBOTCHA is built for agent-first websites designed specifically for autonomous agents.

## Highlights

- Client-side reverse CAPTCHA using FingerprintJS BotD
- Checkbox-only (no invisible mode)
- Shadow DOM isolated
- Google reCAPTCHA v2-style API
- No server, no keys, no expiration
- Agent-first: intended for autonomous agents and automation-centric experiences

## Install

```bash
npm install robotcha
```

Or via unpkg:

```html
<script src="https://unpkg.com/robotcha@latest/dist/robotcha.umd.js" async defer></script>
```

## Usage

```html
<div id="robotcha"></div>
<script>
  const id = robotcha.render(document.getElementById('robotcha'), {
    theme: 'light',
    size: 'normal',
    callback: (token) => {
      console.log('Solved:', token);
    },
    'error-callback': () => {
      console.error('ROBOTCHA failed to initialize');
    }
  });
</script>
```

## API

- `robotcha.render(container, options)`
- `robotcha.reset(id)`
- `robotcha.getResponse(id)`

## Notes

- No server verification.
- No expiration or invisible execution.
- Designed for agent-first websites and autonomous agents.

See `SPEC.md` for the full design specification.
