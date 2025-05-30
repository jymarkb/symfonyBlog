import React from 'react';
import { useEffect, useRef, useState } from 'react';
import MainEditor from './MainEditor';
import { InitOptions } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor';
import { Editor as TinyMCEEditor } from 'tinymce';

const CodeEditor = ({
  containerTitle,
  contentConfig,
  targetField,
  isEditPage,
}: {
  containerTitle: string;
  contentConfig: InitOptions;
  targetField: string;
  isEditPage: boolean;
}) => {
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<string>('');
  useEffect(() => {
    if (isEditPage) {
      const targetValue = document.getElementById(
        targetField,
      ) as HTMLTextAreaElement;
      setInitialData(targetValue?.value);
    }
    setTimeout(() => setLoading(true), 300);
  }, [editorReady]);

  return (
    <>
      {loading ? (
        <div className="min-h-[400px] bg-white shadow border rounded-md flex items-center justify-center space-x-3">
          <i className="icon-loader-circle animate-spin text-8xl"></i>
          <span className="text-3xl font-medium">Loading...</span>
        </div>
      ) : (
        <div className="flex flex-col mt-4 min-h-[400px]">
          {
            editorReady ? (
              <label className="text-sm labelEditor z-20 ml-4 w-fit">
                {containerTitle}
              </label>
            ) : null // show label when editor is ready
          }
          <MainEditor
            editorRef={editorRef}
            setEditorReady={setEditorReady}
            contentConfig={contentConfig}
            initialData={initialData}
          />
        </div>
      )}
    </>
  );
};

export default CodeEditor;
