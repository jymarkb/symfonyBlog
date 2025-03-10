import { Editor } from '@tinymce/tinymce-react';

const MainEditor = ({
  editorRef,
  setEditorReady,
  contentConfig,
  initialData,
}: {
  editorRef: any;
  setEditorReady: (ready: boolean) => void;
  contentConfig: any;
  initialData: any;
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
