export type RobotchaTheme = 'light' | 'dark';
export type RobotchaSize = 'normal' | 'compact';

export interface RobotchaRenderOptions {
  theme?: RobotchaTheme;
  size?: RobotchaSize;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
}

export interface RobotchaApi {
  render(container: Element | string, options?: RobotchaRenderOptions): number;
  reset(id?: number): void;
  getResponse(id?: number): string;
}

let nextId = 0;
const responses = new Map<number, string>();

function resolveContainer(container: Element | string): Element | null {
  if (typeof container === 'string') {
    return document.getElementById(container);
  }
  return container;
}

function render(container: Element | string, options: RobotchaRenderOptions = {}): number {
  const target = resolveContainer(container);
  if (!target) {
    options['error-callback']?.();
    return -1;
  }

  const id = ++nextId;
  responses.set(id, '');
  return id;
}

function reset(id?: number): void {
  if (typeof id === 'number') {
    responses.set(id, '');
    return;
  }

  responses.clear();
}

function getResponse(id?: number): string {
  if (typeof id !== 'number') {
    return '';
  }

  return responses.get(id) ?? '';
}

const robotcha: RobotchaApi = {
  render,
  reset,
  getResponse
};

export default robotcha;
