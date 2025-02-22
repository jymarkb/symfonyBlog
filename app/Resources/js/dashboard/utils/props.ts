export type PopupProps = {
    containerEl?: HTMLElement;
    onReady?: (props: PopupWrapperProps) => void;
};

export type PopupWrapperProps = {
    popup: HTMLElement | null;
    popupContainer: HTMLElement | null;
};
