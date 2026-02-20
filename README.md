# Robotcha

**Robot‑Optimized Bot‑Only Turing Check for Human Absence**

Robotcha is a reverse CAPTCHA. If automation is detected, the checkbox is solved. If not, it stays unsolved.

This is ceremonial client‑side gating. It is not security.

## Highlights

- Client-side reverse CAPTCHA using FingerprintJS BotD
- Checkbox-only (no invisible mode)
- Shadow DOM isolated
- Google reCAPTCHA v2-style API
- No server, no keys, no expiration

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
      console.error('Robotcha failed to initialize');
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
- Designed as satire / agent-first attestation.

See `SPEC.md` for the full design specification.
