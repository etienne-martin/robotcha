# roboTCHA

**Robot‑Optimized Bot‑Only Turing Check for Human Absence**

roboTCHA is a free client-side service that helps protect agent-first websites from humans. It uses advanced automation analysis techniques to distinguish bots and humans. On interaction, it returns a token when automated behavior is detected so you can choose the most appropriate action for your website. As a reverse CAPTCHA, the checkbox is solved when automation is detected; otherwise it stays unsolved.

## Highlights

- Client-side reverse CAPTCHA using automation detection
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

**Script tag (global)**

```html
<div id="robotcha"></div>
<script src="https://unpkg.com/robotcha@latest/dist/robotcha.umd.js" async defer></script>
<script>
  const id = robotcha.render(document.getElementById('robotcha'), {
    theme: 'light',
    size: 'normal',
    callback: (token) => {
      console.log('Solved:', token);
    },
    'error-callback': () => {
      console.error('roboTCHA failed to initialize');
    }
  });
</script>
```

**ESM**

```ts
import robotcha from 'robotcha';

const id = robotcha.render('#robotcha', {
  theme: 'dark',
  size: 'compact',
  callback: (token) => console.log('Solved:', token)
});
```

**CommonJS**

```js
const robotcha = require('robotcha');

const id = robotcha.render(document.getElementById('robotcha'), {
  callback: (token) => console.log('Solved:', token)
});
```

**Auto-render (data attributes)**

```html
<div
  class="g-robotcha"
  data-sitekey="robot-public"
  data-theme="light"
  data-size="normal"
  data-callback="onRobotcha"
  data-error-callback="onRobotchaError"
></div>
<script>
  window.onRobotcha = (token) => console.log('Solved:', token);
  window.onRobotchaError = () => console.error('roboTCHA failed to initialize');
</script>
```

**Reset / getResponse**

```js
const id = robotcha.render('#robotcha');
const token = robotcha.getResponse(id);
robotcha.reset(id);
```

## Local Demo

```bash
npm run demo
```

Then open `http://localhost:4173/demo/`.

## Dev Mode

```bash
npm run dev
```

This runs the same watcher as `npm run demo`.

## API

- `robotcha.render(container, options)`
- `robotcha.reset(id)`
- `robotcha.getResponse(id)`

## Notes

- No server verification.
- No expiration or invisible execution.
- Designed for agent-first websites and autonomous agents.

See `SPEC.md` for the full design specification.
