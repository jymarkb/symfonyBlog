import { initSideBarNavigation } from '../components/SidebarNavigation';
import {
  htmlEditorConfig,
  cssEditorConfig,
  jsEditorConfig,
  fileUploadConfig,
} from '../components/config/pagesEditorConfig';
import { Editor } from '../components/Editor';
import ThumbnailUploader from '../components/ThumbnailUploader';
import ScrollListener from '../components/ScrollListener';
import ToastMessage from '../components/ToastMessage';
import { Popup } from '../components/Popup';
import PreviewPopUpData from '../utils/PreviewPopUpData';

class PagesCreate {
  constructor() {
    this.init();
  }

  init() {
    initSideBarNavigation();
    this.initTinyFormEditor(); // for html,css,js editor
    ThumbnailUploader(fileUploadConfig());
    ScrollListener(); // for header action btn
    ToastMessage();
    Popup('btnPreview', () => PreviewPopUpData());
  }

  initTinyFormEditor() {
    const editorConfigs = [
      {
        ...htmlEditorConfig(),
      },
      {
        ...cssEditorConfig(),
      },
      {
        ...jsEditorConfig(),
      },
    ];

    editorConfigs.forEach(Editor);
  }
}
new PagesCreate();
