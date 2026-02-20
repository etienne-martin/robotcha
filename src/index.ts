import { load } from '@fingerprintjs/botd';

export type RobotchaTheme = 'light' | 'dark';
export type RobotchaSize = 'normal' | 'compact';

export interface RobotchaRenderOptions {
  theme?: RobotchaTheme;
  size?: RobotchaSize;
  tabindex?: number;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
}

export interface RobotchaApi {
  render(container: Element | string, options?: RobotchaRenderOptions): number;
  reset(id?: number): void;
  getResponse(id?: number): string;
}

type WidgetState = 'unchecked' | 'checking' | 'solved' | 'unsolved';

type Botd = Awaited<ReturnType<typeof load>>;

type WidgetElements = {
  root: HTMLDivElement;
  input: HTMLInputElement;
  label: HTMLLabelElement;
  status: HTMLDivElement;
};

type WidgetInstance = {
  id: number;
  host: HTMLElement;
  shadow: ShadowRoot;
  options: RobotchaRenderOptions;
  elements: WidgetElements;
  state: WidgetState;
  token: string;
};

let nextId = 0;
const instances = new Map<number, WidgetInstance>();
let botdPromise: Promise<Botd> | null = null;

const REPO_HOME = 'https://github.com/etienne-martin/robotcha';
const PRIVACY_URL = `${REPO_HOME}/blob/HEAD/PRIVACY.md`;
const LICENSE_URL = `${REPO_HOME}/blob/HEAD/LICENSE`;

const LABEL_TEXT = 'I am a robot';
const STATUS_TEXT: Record<WidgetState, string> = {
  unchecked: '',
  checking: 'Checking...',
  solved: 'Verified robot',
  unsolved: 'Human detected'
};

function resolveContainer(container: Element | string): Element | null {
  if (typeof container === 'string') {
    return document.getElementById(container);
  }
  return container;
}

type ScriptConfig = {
  onload: string | null;
  renderExplicit: boolean;
};

function getScriptConfig(): ScriptConfig {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return { onload: null, renderExplicit: false };
  }

  let script = document.currentScript as HTMLScriptElement | null;
  if (!script || !script.src) {
    const scripts = Array.from(document.getElementsByTagName('script'));
    script = scripts.find((item) => item.src && item.src.includes('robotcha')) ?? null;
  }

  if (!script || !script.src) {
    return { onload: null, renderExplicit: false };
  }

  try {
    const url = new URL(script.src, window.location.href);
    const onload = url.searchParams.get('onload');
    const render = url.searchParams.get('render');
    return {
      onload,
      renderExplicit: render === 'explicit'
    };
  } catch {
    return { onload: null, renderExplicit: false };
  }
}

function ensureBotd(): Promise<Botd> {
  if (!botdPromise) {
    botdPromise = load({ monitoring: false });
  }
  return botdPromise;
}

type DebugOverride = 'bot' | 'human' | 'error' | null;

function getDebugOverride(): DebugOverride {
  if (typeof window === 'undefined' || typeof location === 'undefined') {
    return null;
  }

  const hostname = location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '';
  if (!isLocal) {
    return null;
  }

  const params = new URLSearchParams(location.search);
  const value = params.get('robotcha_debug');
  if (value === 'bot' || value === 'human' || value === 'error') {
    return value;
  }

  return null;
}

async function detectBot(): Promise<{ bot: boolean }>
{
  const override = getDebugOverride();
  if (override === 'bot') {
    return { bot: true };
  }
  if (override === 'human') {
    return { bot: false };
  }
  if (override === 'error') {
    throw new Error('debug override');
  }

  const botd = await ensureBotd();
  const result = await botd.detect();
  return { bot: Boolean(result?.bot) };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function randomDelay(): number {
  return 1000 + Math.floor(Math.random() * 1001);
}

function generateToken(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  const binary = String.fromCharCode(...bytes);
  const base64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return `rbt_${base64}`;
}

function setState(instance: WidgetInstance, state: WidgetState): void {
  instance.state = state;
  const { root, input, status } = instance.elements;

  root.classList.remove('state-unchecked', 'state-checking', 'state-solved', 'state-unsolved');
  root.classList.add(`state-${state}`);

  status.textContent = STATUS_TEXT[state];
  input.checked = state === 'solved';
  input.setAttribute('aria-busy', state === 'checking' ? 'true' : 'false');
  if (state === 'solved') {
    input.setAttribute('aria-disabled', 'true');
  } else {
    input.removeAttribute('aria-disabled');
  }
}

function focusInput(instance: WidgetInstance): void {
  const { input } = instance.elements;
  if (input.isConnected) {
    input.focus({ preventScroll: true });
  }
}

async function handleClick(instance: WidgetInstance): Promise<void> {
  if (instance.state === 'checking' || instance.state === 'solved') {
    return;
  }

  setState(instance, 'checking');
  const delay = wait(randomDelay());

  try {
    const result = await detectBot();
    await delay;

    if (result.bot) {
      const token = generateToken();
      instance.token = token;
      setState(instance, 'solved');
      instance.options.callback?.(token);
    } else {
      instance.token = '';
      setState(instance, 'unsolved');
    }
  } catch (error) {
    await delay;
    instance.token = '';
    setState(instance, 'unchecked');
    instance.options['error-callback']?.();
  }

  focusInput(instance);
}

function buildStyles(): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      display: inline-block;
      font-family: Arial, sans-serif;
      color: #222;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    .rc-root {
      --rc-control-size: 28px;
      --rc-gap: 10px;
      --rc-check-width: calc(var(--rc-control-size) * 0.78);
      --rc-check-height: calc(var(--rc-control-size) * 0.42);
      --rc-check-stroke: 4px;
      --rc-check-offset: -2px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0;
      border: 1px solid #d3d3d3;
      border-radius: 4px;
      padding: 0;
      background: #f9f9f9;
      user-select: none;
      width: 304px;
      height: 78px;
    }

    .rc-root.size-compact {
      --rc-control-size: 22px;
      --rc-gap: 8px;
      --rc-check-stroke: 3px;
      width: 220px;
      height: 60px;
    }

    .rc-label {
      display: flex;
      align-items: center;
      gap: var(--rc-gap);
      cursor: default;
      flex: 1;
      align-self: stretch;
      height: 100%;
      padding: 10px 12px;
    }

    .rc-root.size-compact .rc-label {
      padding: 6px 8px;
    }

    .rc-control {
      position: relative;
      width: var(--rc-control-size);
      height: var(--rc-control-size);
      display: inline-block;
      flex-shrink: 0;
    }

    .rc-input {
      appearance: none;
      -webkit-appearance: none;
      width: 100%;
      height: 100%;
      margin: 0;
      border: 2px solid #c1c1c1;
      border-radius: 3px;
      background: #fff;
      cursor: default;
      display: block;
    }

    .rc-label:hover .rc-input,
    .rc-label:focus-within .rc-input {
      border-color: #4d90fe;
      background: #f5f9ff;
    }

    .rc-input:focus-visible,
    .rc-input:focus {
      outline: none;
    }

    .rc-box {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      pointer-events: none;
    }

    .rc-text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0;
      min-height: var(--rc-control-size);
    }

    .rc-label-text {
      color: #111;
      cursor: default;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.3px;
      line-height: 16px;
    }

    .rc-root.size-compact .rc-label-text {
      font-size: 12px;
    }

    .rc-status {
      font-size: 11px;
      letter-spacing: 0.6px;
      margin-top: 0;
      white-space: nowrap;
      min-height: 14px;
    }

    .rc-root.size-compact .rc-status {
      font-size: 9px;
      letter-spacing: 0.4px;
      min-height: 12px;
    }

    .rc-root.state-unchecked .rc-status {
      display: none;
    }

    .rc-root.state-checking .rc-status {
      color: #9aa0a6;
    }

    .rc-root.state-solved .rc-status {
      color: #00a357;
    }

    .rc-root.state-unsolved .rc-status {
      color: #c62828;
    }

    .rc-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      color: #6b7280;
      line-height: 1.1;
      padding: 10px 12px;
    }

    .rc-root.size-compact .rc-brand {
      padding: 6px 8px;
      gap: 2px;
      font-size: 9px;
    }

    .rc-root.size-compact .rc-brand-icon {
      width: 22px;
      height: 22px;
    }

    .rc-root.size-compact .rc-brand-icon::after {
      inset: 6px;
    }

    .rc-root.size-compact .rc-brand-text {
      font-size: 10px;
      letter-spacing: 0.3px;
    }

    .rc-root.size-compact .rc-brand-links {
      font-size: 9px;
    }
    .rc-brand-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: conic-gradient(#4f7df3 0 120deg, #b0b0b0 120deg 240deg, #2f4fbf 240deg 360deg);
      position: relative;
    }

    .rc-brand-icon::after {
      content: '';
      position: absolute;
      inset: 8px;
      border-radius: 50%;
      background: #f9f9f9;
    }

    .rc-brand-text {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.4px;
      color: #6b7280;
    }

    .rc-brand-links {
      font-size: 10px;
      color: #9aa0a6;
    }

    .rc-brand-links a {
      color: inherit;
      text-decoration: none;
    }

    .rc-brand-links a:hover {
      text-decoration: underline;
    }

    .rc-check {
      width: var(--rc-check-width);
      height: var(--rc-check-height);
      border-left: var(--rc-check-stroke) solid #fff;
      border-bottom: var(--rc-check-stroke) solid #fff;
      transform: translateY(var(--rc-check-offset)) rotate(-45deg);
      opacity: 0;
      grid-area: 1 / 1;
    }

    .rc-input:checked {
      background: #00a357;
      border-color: #00a357;
    }

    .rc-root.state-solved .rc-input {
      background: transparent;
      border-color: transparent;
    }

    .rc-root.state-unsolved .rc-input {
      background: #ffebee;
      border-color: #c62828;
    }

    .rc-root.state-unsolved .rc-label:hover .rc-input,
    .rc-root.state-unsolved .rc-label:focus-within .rc-input {
      background: #ffebee;
      border-color: #c62828;
    }

    .rc-root.state-solved .rc-label:hover .rc-input,
    .rc-root.state-solved .rc-label:focus-within .rc-input {
      background: transparent;
      border-color: transparent;
    }

    .rc-input:checked + .rc-box .rc-check {
      opacity: 1;
    }

    .rc-root.state-solved .rc-check {
      border-left-color: #00a357;
      border-bottom-color: #00a357;
    }

    .rc-spinner {
      width: 100%;
      height: 100%;
      border: 3px solid rgba(77, 144, 254, 0.35);
      border-top-color: rgba(77, 144, 254, 0.95);
      border-radius: 50%;
      animation: rc-spin 0.8s linear infinite;
      opacity: 0;
      grid-area: 1 / 1;
      box-sizing: border-box;
    }

    .rc-root.state-checking .rc-spinner {
      opacity: 1;
    }

    .rc-root.state-checking .rc-check {
      opacity: 0;
    }

    .rc-root.state-checking .rc-input {
      opacity: 0;
    }

    .rc-root.theme-dark {
      background: #2a2a2a;
      border-color: #444;
      color: #eee;
    }

    .rc-root.theme-dark .rc-label-text {
      color: #eee;
    }

    .rc-root.theme-dark .rc-brand-icon::after {
      background: #2a2a2a;
    }

    .rc-root.theme-dark .rc-input {
      background: #111;
      border-color: #666;
    }

    .rc-root.theme-dark .rc-label:hover .rc-input,
    .rc-root.theme-dark .rc-label:focus-within .rc-input {
      background: #1a1f2b;
      border-color: #8ab4f8;
    }

    .rc-root.theme-dark .rc-input:checked {
      background: #00a357;
      border-color: #00a357;
    }

    .rc-root.theme-dark.state-solved .rc-input {
      background: transparent;
      border-color: transparent;
    }

    .rc-root.theme-dark.state-unsolved .rc-input {
      background: #3a1f20;
      border-color: #f28b82;
    }

    .rc-root.theme-dark.state-unsolved .rc-label:hover .rc-input,
    .rc-root.theme-dark.state-unsolved .rc-label:focus-within .rc-input {
      background: #3a1f20;
      border-color: #f28b82;
    }

    .rc-root.theme-dark.state-unsolved .rc-status {
      color: #f28b82;
    }

    .rc-root.theme-dark.state-solved .rc-label:hover .rc-input,
    .rc-root.theme-dark.state-solved .rc-label:focus-within .rc-input {
      background: transparent;
      border-color: transparent;
    }

    .rc-root.theme-dark .rc-spinner {
      border-color: rgba(138, 180, 248, 0.35);
      border-top-color: rgba(138, 180, 248, 0.95);
    }

    @keyframes rc-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  return style;
}

function buildWidget(options: RobotchaRenderOptions): WidgetElements {
  const root = document.createElement('div');
  root.className = 'rc-root';

  const label = document.createElement('label');
  label.className = 'rc-label';

  const control = document.createElement('span');
  control.className = 'rc-control';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'rc-input';
  input.setAttribute('aria-label', LABEL_TEXT);
  if (typeof options.tabindex === 'number' && Number.isFinite(options.tabindex)) {
    input.tabIndex = options.tabindex;
  }

  const check = document.createElement('span');
  check.className = 'rc-check';

  const spinner = document.createElement('span');
  spinner.className = 'rc-spinner';

  const box = document.createElement('span');
  box.className = 'rc-box';
  box.append(check, spinner);

  const text = document.createElement('div');
  text.className = 'rc-text';

  const labelText = document.createElement('div');
  labelText.className = 'rc-label-text';
  labelText.textContent = LABEL_TEXT;

  const status = document.createElement('div');
  status.className = 'rc-status';

  text.append(labelText, status);
  control.append(input, box);
  label.append(control, text);
  root.append(label);

  const brand = document.createElement('div');
  brand.className = 'rc-brand';

  const brandIcon = document.createElement('span');
  brandIcon.className = 'rc-brand-icon';

  const brandText = document.createElement('div');
  brandText.className = 'rc-brand-text';
  brandText.textContent = 'roboTCHA';

  const brandLinks = document.createElement('div');
  brandLinks.className = 'rc-brand-links';
  const privacyLink = document.createElement('a');
  privacyLink.href = PRIVACY_URL;
  privacyLink.target = '_blank';
  privacyLink.rel = 'noopener noreferrer';
  privacyLink.textContent = 'Privacy';

  const separator = document.createTextNode(' - ');

  const licenseLink = document.createElement('a');
  licenseLink.href = LICENSE_URL;
  licenseLink.target = '_blank';
  licenseLink.rel = 'noopener noreferrer';
  licenseLink.textContent = 'License';

  brandLinks.append(privacyLink, separator, licenseLink);

  brand.append(brandIcon, brandText, brandLinks);
  root.append(brand);

  const theme = options.theme === 'dark' ? 'dark' : 'light';
  const size = options.size === 'compact' ? 'compact' : 'normal';
  root.classList.add(`theme-${theme}`, `size-${size}`, 'state-unchecked');

  return { root, input, label, status };
}

function createInstance(container: Element, options: RobotchaRenderOptions): WidgetInstance | null {
  if (!('attachShadow' in HTMLElement.prototype)) {
    options['error-callback']?.();
    return null;
  }

  const host = document.createElement('div');
  host.className = 'robotcha-host';
  (container as HTMLElement).textContent = '';
  container.appendChild(host);

  let shadow: ShadowRoot;
  try {
    shadow = host.attachShadow({ mode: 'open' });
  } catch (error) {
    options['error-callback']?.();
    return null;
  }

  const elements = buildWidget(options);
  shadow.append(buildStyles(), elements.root);

  const id = ++nextId;
  const instance: WidgetInstance = {
    id,
    host,
    shadow,
    options,
    elements,
    state: 'unchecked',
    token: ''
  };

  const onActivate = (event: Event) => {
    event.preventDefault();
    void handleClick(instance);
  };

  elements.label.addEventListener('click', onActivate);
  elements.input.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    void handleClick(instance);
  });
  elements.input.addEventListener('blur', () => {
    if (instance.state === 'unsolved') {
      instance.token = '';
      setState(instance, 'unchecked');
    }
  });
  elements.input.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      void handleClick(instance);
    }
  });

  return instance;
}

export function render(container: Element | string, options: RobotchaRenderOptions = {}): number {
  if (typeof document === 'undefined') {
    options['error-callback']?.();
    return -1;
  }

  const target = resolveContainer(container);
  if (!target) {
    options['error-callback']?.();
    return -1;
  }

  const instance = createInstance(target, options);
  if (!instance) {
    return -1;
  }

  instances.set(instance.id, instance);
  return instance.id;
}

export function reset(id?: number): void {
  if (typeof id === 'number') {
    const instance = instances.get(id);
    if (!instance) {
      return;
    }
    instance.token = '';
    setState(instance, 'unchecked');
    return;
  }

  instances.forEach((instance) => {
    instance.token = '';
    setState(instance, 'unchecked');
  });
}

export function getResponse(id?: number): string {
  if (typeof id !== 'number') {
    return '';
  }

  return instances.get(id)?.token ?? '';
}

function parseOptionsFromDataset(element: HTMLElement): RobotchaRenderOptions {
  const options: RobotchaRenderOptions = {};

  const theme = element.getAttribute('data-theme');
  if (theme === 'light' || theme === 'dark') {
    options.theme = theme;
  }

  const size = element.getAttribute('data-size');
  if (size === 'normal' || size === 'compact') {
    options.size = size;
  }

  const tabindexValue = element.getAttribute('data-tabindex');
  if (tabindexValue !== null) {
    const parsed = Number.parseInt(tabindexValue, 10);
    if (Number.isFinite(parsed)) {
      options.tabindex = parsed;
    }
  }

  const callbackName = element.getAttribute('data-callback');
  if (callbackName && typeof (window as any)[callbackName] === 'function') {
    options.callback = (window as any)[callbackName] as (token: string) => void;
  }

  const errorCallbackName = element.getAttribute('data-error-callback');
  if (errorCallbackName && typeof (window as any)[errorCallbackName] === 'function') {
    options['error-callback'] = (window as any)[errorCallbackName] as () => void;
  }

  return options;
}

function autoRender(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const nodes = Array.from(document.querySelectorAll<HTMLElement>('.e-robotcha'));
  nodes.forEach((node) => {
    if (node.dataset.robotchaRendered === 'true') {
      return;
    }
    node.dataset.robotchaRendered = 'true';
    const id = render(node, parseOptionsFromDataset(node));
    if (id >= 0) {
      node.dataset.robotchaId = String(id);
    }
  });
}

const robotcha: RobotchaApi = {
  render,
  reset,
  getResponse
};

if (typeof window !== 'undefined') {
  (window as any).robotcha = robotcha;

  if (typeof document !== 'undefined') {
    const scriptConfig = getScriptConfig();
    if (!scriptConfig.renderExplicit) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoRender, { once: true });
      } else {
        autoRender();
      }
    }

    if (scriptConfig.onload) {
      const callback = (window as any)[scriptConfig.onload];
      if (typeof callback === 'function') {
        callback();
      }
    }
  }
}

export default robotcha;
