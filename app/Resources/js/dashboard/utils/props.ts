import React from 'react';

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

export type ButtonTableProps = {
  title: string;
  slug: string;
  id: string;
};

export type SearchFilterProps = {
  value: string;
  status?: any[];
  category?: any[];
};

export type PageFormData = {
  title?: string;
  category?: string;
  summary?: string;
  htmlThumbnail?: File | object;
  htmlContent?: string;
  htmlStyle?: string;
  htmlScript?: string;
};
