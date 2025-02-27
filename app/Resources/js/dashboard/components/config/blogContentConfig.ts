import { Editor as TinyMCEEditor, EditorEvent } from 'tinymce';
export const blogContentConfig = {
  menubar: false,
  placeholder: 'Start typing your content here...',
  height: 500,
  plugins: [
    'code',
    'image',
    'link',
    'media',
    'visualblocks',
    'wordcount',
    'lists',
    'table',
  ],
  // 🔹 Allow ALL elements and attributes
  valid_elements: '*[*]',
  valid_children: '+body[iframe][video|audio],+div[iframe][video|audio]',
  extended_valid_elements:
    'iframe[src|width|height|frameborder|allowfullscreen],pre[class],code[class],audio[controls|src],video[controls|width|height|src]',

  entity_encoding: 'raw', // Prevent escaping HTML entities
  remove_linebreaks: false,
  convert_urls: false,
  forced_root_block: 'false', // Ensure content is not auto-wrapped
  force_br_newlines: true,
  // Paste settings
  paste_as_text: false,
  paste_data_images: true,
  paste_webkit_styles: 'all',
  paste_merge_formats: false,
  paste_auto_cleanup_on_paste: false,
  toolbar:
    'undo redo | formatselect | bold italic underline strikethrough | link image media | code | bullist numlist | table',
  content_style: `body { background: transparent !important; }`,
  branding: false,
  promotion: false,
  telemetry: false,
  allow_script_urls: true,
  allow_iframe: true,
  iframe_sandbox: false,
  sandbox_iframes: false,
  content_css: false,
  invalid_elements: 'marquee',
  setup: (editor: TinyMCEEditor) => {
    editor.on('Paste', (event: EditorEvent<ClipboardEvent>) => {
      event.preventDefault();

      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      let pastedHtml =
        clipboardData.getData('text/html') ||
        clipboardData.getData('text/plain');
      if (!pastedHtml) return;

      // Regex for detecting raw HTML tags that should be inserted as-is
      const rawHtmlTags =
        /<(?:iframe|script|style|embed|object|video|audio|source|picture|img|svg|math|canvas|form|input|textarea|button|select|option|label|fieldset|legend|details|summary|menu|dialog)[\s\S]*?>/i;

      if (rawHtmlTags.test(pastedHtml)) {
        editor.insertContent(pastedHtml);
        return;
      }

      // Remove unnecessary fragment markers
      pastedHtml = pastedHtml.replace(
        /<!--StartFragment-->|<!--EndFragment-->/g,
        '',
      );

      // Convert HTML to text while preserving meaningful structure
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pastedHtml;
      pastedHtml = tempDiv.textContent || tempDiv.innerText || '';

      // Normalize spaces & ensure proper formatting
      pastedHtml = pastedHtml.replace(/\s+/g, ' ').trim();

      // Preserve block-level structure by inserting line breaks where necessary
      pastedHtml = pastedHtml.replace(
        /<\/(h[1-6]|p|div|ul|ol|li|blockquote|pre|table|tr|td|th)>/g,
        '</$1>\n',
      );

      editor.insertContent(pastedHtml);
    });
  },
};
