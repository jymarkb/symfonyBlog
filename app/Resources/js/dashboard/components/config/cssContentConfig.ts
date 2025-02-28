import { Editor as TinyMCEEditor } from 'tinymce';

export const cssContentConfig = (textAreaId: string) => ({
  menubar: false,
  placeholder: 'Write your CSS code here...',
  height: 600,
  plugins: ['code'],
  toolbar: 'undo redo | code',
  content_css: false,
  branding: false,
  promotion: false,
  telemetry: false,
  entity_encoding: 'raw',
  default_block: false,
  force_br_newlines: false,
  convert_urls: false,
  paste_as_text: true,
  valid_elements: '*[*]', 
  extended_valid_elements: 'pre[class],code[class]',
  formats: {
    removeformat: [{ selector: 'pre,code', remove: 'all', split: false }],
  },

  setup: (editor: TinyMCEEditor) => {
    editor.on('blur', function () {
      if (!editor) return;
      let content = editor.getContent({ format: 'text' })?.trim() || '';

      // Remove unnecessary HTML tags
      content = content.replace(/<\/?(p|br|div)>/gi, '').trim();

      // Remove non-breaking spaces (&nbsp;)
      content = content.replace(/\u00A0/g, ' ');

      // Normalize whitespace (remove unnecessary line breaks)
      content = content.replace(/\s*\n\s*\n+/g, '\n').trim();

      // Preserve CSS structure (add new lines after {, }, ;)
      content = content.replace(/([{};])\s*/g, '$1\n');

      // **Only wrap in <pre> if there's content**
      if (content) {
        editor.setContent(`<pre class="css-editor">${content}</pre>`, { format: 'raw' });
      } else {
        editor.setContent('', { format: 'raw' });
      }

      // Sync with hidden textarea
      const textArea = document.getElementById(textAreaId) as HTMLTextAreaElement;
      if (textArea) {
        textArea.value = content;
      }
    });

    editor.on('Paste PreProcess', (event) => {
      let pastedContent = event.content || '';

      // Remove <p> and <br> tags
      pastedContent = pastedContent.replace(/<\/?(p|br|div)>/gi, '').trim();

      // Remove non-breaking spaces (&nbsp;)
      pastedContent = pastedContent.replace(/\u00A0/g, ' ');

      // Normalize whitespace (remove unnecessary line breaks)
      pastedContent = pastedContent.replace(/\s*\n\s*\n+/g, '\n').trim();

      // Preserve CSS structure (add new lines after {, }, ;)
      pastedContent = pastedContent.replace(/([{};])\s*/g, '$1\n');

      // **Only wrap in <pre> if there's content**
      event.content = pastedContent ? `<pre class="css-editor">${pastedContent}</pre>` : '';
    });
  },
});
