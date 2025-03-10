const isEditPage = window.location.pathname.includes('/pages/edit/');
import { blogContentConfig } from './blogContentConfig';
import { cssContentConfig } from './cssContentConfig';
import { jsContentConfig } from './jsContentConfig';

export const htmlEditorConfig = () => ({
  containerId: 'htmlEditor',
  containerTitle: 'Blog Content',
  targetField: 'create_new_page_htmlContent',
  isEditPage: isEditPage,
  contentConfig: blogContentConfig('create_new_page_htmlContent'),
});

export const cssEditorConfig = () => ({
  containerId: 'cssEditor',
  containerTitle: 'CSS Content',
  targetField: 'create_new_page_htmlStyle',
  isEditPage: isEditPage,
  contentConfig: cssContentConfig('create_new_page_htmlStyle'),
});

export const jsEditorConfig = () => ({
  containerId: 'jsEditor',
  containerTitle: 'JS Content',
  targetField: 'create_new_page_htmlScript',
  isEditPage: isEditPage,
  contentConfig: jsContentConfig('create_new_page_htmlScript'),
});

export const fileUploadConfig = () => ({
  isEditPage: isEditPage,
  targetField: 'create_new_page_htmlThumbnail',
});
