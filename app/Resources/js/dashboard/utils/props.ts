import React from "react";

export type PopupProps = {
    containerEl?: HTMLElement;
    onReady?: (props: PopupWrapperProps) => void;
};

export type PopupWrapperProps = {
    popup: HTMLElement | null;
    popupContainer: HTMLElement | null;
};

export type TableDropDownProps = {
    targetX: number;
    targetY: number;
    isVisible: boolean;
    children: React.ReactNode;
};