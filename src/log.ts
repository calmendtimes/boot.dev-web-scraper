
export const DEBUG = false;

export function log(...args: any[]) {
    if (DEBUG) console.log(...args);
}