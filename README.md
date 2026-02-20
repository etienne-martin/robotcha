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

```html
<script type="text/javascript">
  var onloadCallback = function() {
    alert("robotcha is ready!");
  };
</script>
```

2. Insert the JavaScript resource, setting the `onload` parameter to the name of your onload callback function and the `render` parameter to `explicit`.

```html
<script async defer src="https://unpkg.com/robotcha@latest/dist/robotcha.min.js?onload=onloadCallback&render=explicit"></script>
```

When your callback is executed, you can call the `robotcha.render` method from the [JavaScript API](#javascript-api).

> Your **onload** callback function must be defined before the roboTCHA API loads. To ensure there are no race conditions:
> - Order your scripts with the callback first, and then roboTCHA
> - Use the **async** and **defer** parameters in the `script` tags

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
| `data-tabindex` | `tabindex` | number | `0` | Optional. Tabindex override for keyboard navigation. |
| `data-callback` | `callback` | function name | _none_ | Optional. The name of your callback function, executed when automation is detected. The token is passed to your callback. |
| `data-error-callback` | `error-callback` | function name | _none_ | Optional. The name of your callback function, executed when roboTCHA encounters a runtime error. |

## JavaScript API

| Method | Description |
| --- | --- |
| `robotcha.render(container, options)` | Renders the container as a roboTCHA widget and returns the ID of the newly created widget. |
| `robotcha.reset(opt_widget_id)` | Resets the roboTCHA widget. |
| `robotcha.getResponse(opt_widget_id)` | Gets the response token for the roboTCHA widget. |

### Examples

Explicit rendering after an onload callback

```html
<html>
  <head>
    <title>roboTCHA demo: Explicit render after an onload callback</title>
    <script type="text/javascript">
      var onloadCallback = function() {
        robotcha.render('robotcha_element', { theme: 'dark' });
      };
    </script>
  </head>
  <body>
    <form action="?" method="POST">
      <div id="robotcha_element"></div>
      <br>
      <input type="submit" value="Submit">
    </form>
    <script async defer src="https://unpkg.com/robotcha@latest/dist/robotcha.min.js?onload=onloadCallback&render=explicit"></script>
  </body>
</html>
```

Explicit rendering for multiple widgets

```html
<html>
  <head>
    <title>roboTCHA demo: Explicit render for multiple widgets</title>
    <script type="text/javascript">
      var verifyCallback = function(response) {
        alert(response);
      };
      var widgetId1;
      var widgetId2;
      var onloadCallback = function() {
        // Renders the HTML element with id 'example1' as a roboTCHA widget.
        // The id of the roboTCHA widget is assigned to 'widgetId1'.
        widgetId1 = robotcha.render('example1', {
          theme: 'light'
        });
        widgetId2 = robotcha.render(document.getElementById('example2'), {});
        robotcha.render('example3', {
          callback: verifyCallback,
          theme: 'dark'
        });
      };
    </script>
  </head>
  <body>
    <!-- The response token displays in an alert message upon submit. -->
    <form action="javascript:alert(robotcha.getResponse(widgetId1));">
      <div id="example1"></div>
      <br>
      <input type="submit" value="getResponse">
    </form>
    <br>
    <!-- Resets roboTCHA widgetId2 upon submit. -->
    <form action="javascript:robotcha.reset(widgetId2);">
      <div id="example2"></div>
      <br>
      <input type="submit" value="reset">
    </form>
    <br>
    <!-- POSTs back to the page's URL upon submit. -->
    <form action="?" method="POST">
      <div id="example3"></div>
      <br>
      <input type="submit" value="Submit">
    </form>
    <script async defer src="https://unpkg.com/robotcha@latest/dist/robotcha.min.js?onload=onloadCallback&render=explicit"></script>
  </body>
</html>
```
