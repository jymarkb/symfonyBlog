import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
import { InitOptions } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor';

interface MainEditorProps {
  editorRef: React.MutableRefObject<TinyMCEEditor | null>;
  setEditorReady: (ready: boolean) => void;
  contentConfig: InitOptions;
  initialData: string;
}

const MainEditor: React.FC<MainEditorProps> = ({
  editorRef,
  setEditorReady,
  contentConfig,
  initialData,
}) => {
  return (
    <Editor
      apiKey="aka2grej8ep92h73fxkxy6it07v988udxrkje2ru6xv0fgt2"
      onInit={(_evt, editor) => {
        editorRef.current = editor;
        setEditorReady(true);
      }}
      init={contentConfig}
      initialValue={initialData}
    />
  );
};

export default MainEditor;
