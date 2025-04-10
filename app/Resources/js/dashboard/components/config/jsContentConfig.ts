import { Editor as TinyMCEEditor } from 'tinymce';
import { editorCustomStyle } from '../../utils/editorCustomStyle';
import { InitOptions } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor';

export const jsContentConfig = (textAreaId: string): InitOptions => {
  return {
    menubar: false,
    placeholder: 'Write your JavaScript code here...',
    plugins: ['code', 'autoresize'],
    min_height: 400,
    max_height: 800,
    autoresize_max_height: 800,
    autoresize_min_height: 400,
    toolbar: 'undo redo | code',
    content_style: editorCustomStyle,
    content_css: false,
    branding: false,
    promotion: false,
    telemetry: false,
    entity_encoding: 'raw',
    default_block: false, // Prevent TinyMCE from wrapping in <p>
    force_br_newlines: false,
    convert_urls: false,
    paste_as_text: true, // Keeps JS plain
    valid_elements: '*[*]', // Allow everything
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

        // Ensure proper JS formatting (basic new lines for readability)
        content = content.replace(/([{};])\s*/g, '$1\n');

        // If there's actual content, wrap it in <pre>, otherwise keep empty
        if (content) {
          editor.setContent(`<pre class="js-editor">${content}</pre>`, {
            format: 'raw',
          });
        } else {
          editor.setContent('', { format: 'raw' });
        }

        // Sync with hidden textarea
        const testTextArea = document.getElementById(
          textAreaId,
        ) as HTMLTextAreaElement;
        if (testTextArea) {
          testTextArea.value = content;
        }
      });

      editor.on('Paste PreProcess', (event) => {
        let pastedContent = event.content || '';

        // Remove <p> and <br> tags
        pastedContent = pastedContent.replace(/<\/?(p|br|div)>/gi, '').trim();

        // Format pasted content correctly
        pastedContent = pastedContent.replace(/([{};])\s*/g, '$1\n');

        // If there's content, wrap it in <pre>, otherwise leave empty
        event.content = pastedContent
          ? `<pre class="js-editor">${pastedContent}</pre>`
          : '';
      });
    },
    init_instance_callback: (editor: TinyMCEEditor) => {
      setTimeout(() => {
        editor.fire('blur');
      }, 100);
    },
  };
};
