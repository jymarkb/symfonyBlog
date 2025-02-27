import { useEffect, useRef, useState } from 'react';
import MainEditor from './MainEditor';
import { blogContenConfig } from './config/blogContenConfig';

// const CodeEditor = ({
//   initBindButton,
// }: {
//   initBindButton: (btnId: HTMLElement, getContent: () => string) => void;
// }) => {

const CodeEditor = () => {
  const editorRef = useRef<any>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const checkButton = () => {
    //   const btnId = document.getElementById('getClass') as HTMLElement;
    //   if (!btnId) return;

    //   initBindButton(btnId, () => editorRef.current?.getContent() || '');
    // };

    setTimeout(() => setLoading(false), 500);

    // if (editorReady) {
    //   checkButton();
    // }
  }, [editorReady]);

  return (
    <>
      {loading ? (
        <div className="h-[500px] bg-white shadow border rounded-md flex items-center justify-center space-x-3">
          <i className="icon-loader-circle animate-spin text-8xl"></i>
          <span className="text-3xl font-medium">Loading...</span>
        </div>
      ) : (
        <div className="flex flex-col mt-4 h-[500px]">
          {
            editorReady ? (
              <label className="text-sm labelEditor z-100 ml-4 w-fit">
                Blog Content
              </label>
            ) : null // show label when editor is ready
          }
          <MainEditor editorRef={editorRef} setEditorReady={setEditorReady} blogContenConfig={blogContenConfig}/>
        </div>
      )}
    </>
  );
};

export default CodeEditor;
