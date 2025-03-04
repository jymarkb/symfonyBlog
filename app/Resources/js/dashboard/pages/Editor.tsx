import ReactDOM from 'react-dom/client';
import CodeEditor from '../components/CodeEditor';

export const initEditor = ({
  containerId,
  containerTitle,
  contentConfig,
}: {
  containerId: string;
  containerTitle: string;
  contentConfig: object;
}) => {
  const renderContainer = document.getElementById(containerId);
  if (!renderContainer) return;

  ReactDOM.createRoot(renderContainer).render(
    <CodeEditor
      containerTitle={containerTitle}
      contentConfig={contentConfig}
    />,
  );
};
