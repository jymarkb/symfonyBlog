import { useEffect, useRef, useState } from 'react';
import MainEditor from './MainEditor';
// import { blogContentConfig } from './config/blogContentConfig'; 

// const CodeEditor = ({
//   initBindButton,
// }: {
//   initBindButton: (btnId: HTMLElement, getContent: () => string) => void;
// }) => {

const CodeEditor = ({containerTitle, contentConfig}: {containerTitle:string, contentConfig:object}) => {
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
        <div className="h-[600px] bg-white shadow border rounded-md flex items-center justify-center space-x-3">
          <i className="icon-loader-circle animate-spin text-8xl"></i>
          <span className="text-3xl font-medium">Loading...</span>
        </div>
      ) : (
        <div className="flex flex-col mt-4 h-[600px]">
          {
            editorReady ? (
              <label className="text-sm labelEditor z-20 ml-4 w-fit">
                {containerTitle}
              </label>
            ) : null // show label when editor is ready
          }
          <MainEditor editorRef={editorRef} setEditorReady={setEditorReady} contentConfig={contentConfig}/>
        </div>
      )}
    </>
  );
};

export default CodeEditor;
