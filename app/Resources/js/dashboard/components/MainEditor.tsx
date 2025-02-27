import { Editor } from '@tinymce/tinymce-react';

const MainEditor = ({
  editorRef,
  setEditorReady,blogContenConfig
}: {
  editorRef: any;
  setEditorReady: (ready: boolean) => void;
  blogContenConfig:any;
}) => {
  return (
    <Editor
      apiKey="aka2grej8ep92h73fxkxy6it07v988udxrkje2ru6xv0fgt2"
      onInit={(_evt, editor) => {
        editorRef.current = editor;
        setEditorReady(true);
      }}
      init={
        blogContenConfig
      }
    />
  );
};

export default MainEditor;
