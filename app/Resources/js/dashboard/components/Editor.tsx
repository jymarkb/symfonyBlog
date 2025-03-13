import React from 'react';
import ReactDOM from 'react-dom/client';
import CodeEditor from '../components/CodeEditor';
import { InitOptions } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor';

export const Editor = ({
  containerId,
  containerTitle,
  targetField,
  contentConfig,
  isEditPage,
}: {
  containerId: string;
  containerTitle: string;
  targetField: string;
  contentConfig: InitOptions;
  isEditPage: boolean;
}) => {
  const renderContainer = document.getElementById(containerId);
  if (!renderContainer) return;

  ReactDOM.createRoot(renderContainer).render(
    <CodeEditor
      containerTitle={containerTitle}
      contentConfig={contentConfig}
      targetField={targetField}
      isEditPage={isEditPage}
    />,
  );
};
