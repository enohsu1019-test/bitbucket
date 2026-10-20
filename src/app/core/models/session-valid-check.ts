export interface SessionValidCheck {
    checkSessionValid(response: {success?: () => any, fail?: () => any}): void;
}