import React from 'react';

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

export type FiltersType = Record<string, Record<string, number> | string>;

export type BlogPost = {
  title: string;
  blog_id: number;
  status: number;
  slug: string;
  created_at: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
  updated_at: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
  category_id: number;
  name: string;
  firstName: string;
  lastName: string;
};


