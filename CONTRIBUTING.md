# Contributing

Thanks for helping improve roboTCHA.

## Development setup

1. Install dependencies:

```bash
npm install
```

2. Run the local demo (builds on change and serves the demo page):

```bash
npm run demo
```

Open `http://localhost:4173/demo/`.

3. Or use the dev alias:

```bash
npm run dev
```

## Build and test

```bash
npm run build
```

```bash
npm test
```

## Style and structure

- Keep the public API stable.
- Avoid adding new runtime dependencies unless necessary.
- Keep the widget styles isolated.
