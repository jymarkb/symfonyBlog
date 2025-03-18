// events.ts
export function CustomEventDispatch<T>({ eventTitle, message }: { eventTitle: string; message?: T }) {
    document.dispatchEvent(new CustomEvent(eventTitle, { detail: message }));
}
export function CustomEventListener<T>(eventTitle: string, callback: (detail: T) => void): void {
    console.log('here');

    document.addEventListener(eventTitle, (ev: Event) => {
        const customEvent = ev as CustomEvent<T>;
        callback(customEvent.detail);
    });
}