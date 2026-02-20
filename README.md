# roboTCHA

**Robot‑Operated Bot‑Only Turing Check for Headless Agent**

roboTCHA is a free client-side service that helps protect an agent-only website from humans. This guide explains how to embed the widget, configure it, and integrate it into an agent-only website.

<img src="https://raw.githubusercontent.com/etienne-martin/robotcha/main/roboTCHA.png" alt="roboTCHA widget" width="456" height="117">

## Automatically render the roboTCHA widget

The easiest method for rendering the roboTCHA widget on your page is to include the necessary JavaScript resource and an `e-robotcha` tag. The `e-robotcha` tag is a DIV element with class name `e-robotcha`:

```html
<div
  class="e-robotcha"
  data-theme="light"
  data-size="normal"
  data-callback="onRobotcha"
  data-error-callback="onRobotchaError"
></div>
<script>
  window.onRobotcha = (token) => {
    console.log('Solved:', token);
  };
  window.onRobotchaError = () => {
    console.error('roboTCHA failed to initialize');
  };
</script>
<script async defer src="https://unpkg.com/robotcha@latest/dist/robotcha.min.js"></script>
```

The script must be loaded using the HTTPS protocol and can be included from any point on the page without restriction.

## Explicitly render the roboTCHA widget

Deferring the render can be achieved by specifying your onload callback function and adding parameters to the JavaScript resource.

1. Specify your `onload` callback function. This function will get called when all the dependencies have loaded.

```
<script type="text/javascript">
  var onloadCallback = function() {
    alert("robotcha is ready!");
  };
</script>
```

If you want to keep the script async, use an onload callback and render explicitly:

```html
<div id="robotcha"></div>
<script>
  var onloadCallback = function () {
    robotcha.render('#robotcha', {
      callback: (token) => console.log('Solved:', token)
    });
  };
</script>
<script async defer src="https://unpkg.com/robotcha@latest/dist/robotcha.min.js?onload=onloadCallback&render=explicit"></script>
```

**Recommended pattern**

roboTCHA is most useful when you intentionally allow automated agents and want to block human interaction. A common pattern is to keep the primary action disabled until the token is returned.

If you want to gate a form submit or agent-only action, enable the button only after the callback fires:

```html
<button id="submit" disabled>Continue</button>
<script>
  const submit = document.getElementById('submit');
  robotcha.render('#robotcha', {
    callback: () => {
      submit.disabled = false;
    }
  });
</script>
```

**Bundlers (optional)**

If you prefer bundling, install via npm:

```bash
npm install robotcha
```

Then use ESM (CommonJS is also available):

**ESM**

```ts
import robotcha from 'robotcha';

const id = robotcha.render('#robotcha', {
  theme: 'dark',
  size: 'compact',
  callback: (token) => console.log('Solved:', token)
});
```

**Auto-render (data attributes)**

```html
<div
  class="e-robotcha"
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

## Configuration

### JavaScript resource (api.js) parameters

| Parameter | Value | Description |
| --- | --- | --- |
| `onload` | _optional_ | The name of your callback function to be executed once all the dependencies have loaded. |
| `render` | `explicit` \| `onload` | Whether to render the widget explicitly. Defaults to `onload`, which renders the widget in the first `e-robotcha` tag it finds. |

### e-robotcha tag attributes and robotcha.render parameters

| e-robotcha tag attribute | robotcha.render parameter | Value | Default | Description |
| --- | --- | --- | --- | --- |
| `data-theme` | `theme` | `dark` \| `light` | `light` | Optional. The color theme of the widget. |
| `data-size` | `size` | `compact` \| `normal` | `normal` | Optional. The size of the widget. |
| `data-tabindex` | `tabindex` | _not supported_ | _none_ | Optional. Tabindex override is not supported. |
| `data-callback` | `callback` | function name | _none_ | Optional. The name of your callback function, executed when automation is detected. The token is passed to your callback. |
| `data-expired-callback` | `expired-callback` | _not supported_ | _none_ | Optional. Expiration callbacks are not supported. |
| `data-error-callback` | `error-callback` | function name | _none_ | Optional. The name of your callback function, executed when roboTCHA encounters a runtime error. |

## JavaScript API

| Method | Description |
| --- | --- |
| `robotcha.render(container, options)` | Renders the container as a roboTCHA widget and returns the ID of the newly created widget. |
| `robotcha.reset(opt_widget_id)` | Resets the roboTCHA widget. |
| `robotcha.getResponse(opt_widget_id)` | Gets the response token for the roboTCHA widget. |

## Notes

- No server verification.
- No expiration or invisible execution.
- Designed for use on agent-only websites by autonomous agents.

See `SPEC.md` for the full design specification.
