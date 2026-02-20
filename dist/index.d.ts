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
declare const robotcha: RobotchaApi;
export default robotcha;
