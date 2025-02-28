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
  // editorConfig:{'height':'500px', 'placeholder': 'Start typing your content here...', value:'', title:'Blog Content' }
  // const initBindButton = (
  //   btnId: HTMLElement | null,
  //   getContent: () => string,
  // ) => {
  //   if (!btnId) return;

  //   btnId.addEventListener('click', () => {
  //     console.log(getContent());
  //   });
  // };

  const renderContainer = document.getElementById(containerId);
  if (!renderContainer) return;

  ReactDOM.createRoot(renderContainer).render(
    <CodeEditor
      containerTitle={containerTitle}
      contentConfig={contentConfig}
    />,
    // <CodeEditor initBindButton={initBindButton} />,
  );

  // tinymce.get("myTextarea").setContent("<p>Hello world!</p>");
};
