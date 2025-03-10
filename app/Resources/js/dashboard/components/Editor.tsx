import ReactDOM from 'react-dom/client';
import CodeEditor from '../components/CodeEditor';

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
  contentConfig: object;
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
