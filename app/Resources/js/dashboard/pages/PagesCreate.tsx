import React from 'react';
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
import PreviewPopUpData from '../utils/PreviewPopUpData';
import { Popup } from '../components/Popup';

class PagesCreate {
  constructor() {
    this.init();
  }

  init() {
    initSideBarNavigation();
    this.initTinyFormEditor(); // for html,css,js editor, todo: switch to "MONACO EDITOR"
    ThumbnailUploader(fileUploadConfig());
    ScrollListener(); // for header action btn
    ToastMessage();
    Popup({ btnTrigger: 'btnPreview', isFilter:false, popUpdata: <PreviewPopUpData/> }); // preview popup
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
