import { blogContentConfig } from '../components/config/blogContentConfig';
import { cssContentConfig } from '../components/config/cssContentConfig';
import { jsContentConfig } from '../components/config/jsContentConfig';
import { initSideBarNavigation } from '../components/SidebarNavigation';
import {
  htmlEditorConfig,
  cssEditorConfig,
  jsEditorConfig,
} from '../components/config/pagesEditorConfig';
import { initEditor } from '../components/Editor';
import ThumbnailUploader from '../components/ThumbnailUploader';
import ScrollListener from '../components/ScrollListener';
import ToastMessage from '../components/ToastMessage';
import { popUpModal } from '../components/Popup';
import PreviewPopUpData from '../utils/PreviewPopUpData';

class PagesCreate {
  constructor() {
    this.init();
  }

  init() {
    initSideBarNavigation();
    this.initTinyFormEditor(); // for html,css,js editor
    ThumbnailUploader();
    ScrollListener(); // for header action btn
    ToastMessage();
    popUpModal('btnPreview', () => PreviewPopUpData());
  }

  async initTinyFormEditor() {
    const editorConfigs = [
      {
        ...htmlEditorConfig(),
        contentConfig: blogContentConfig('create_new_page_htmlContent'),
      },
      {
        ...cssEditorConfig(),
        contentConfig: cssContentConfig('create_new_page_htmlStyle'),
      },
      {
        ...jsEditorConfig(),
        contentConfig: jsContentConfig('create_new_page_htmlScript'),
      },
    ];

    editorConfigs.forEach(initEditor);
  }
}
new PagesCreate();
