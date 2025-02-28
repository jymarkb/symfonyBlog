import { blogContentConfig } from '../components/config/blogContentConfig';
import { cssContentConfig } from '../components/config/cssContentConfig';
import { jsContentConfig } from '../components/config/jsContentConfig';
import { initSideBarNavigation } from '../components/SidebarNavigation';
import { initEditor } from './Editor';
// import { initPopup } from './pages/Popup';
// import { initEditor } from '../pages/Editor';

class PagesCreate {
  constructor() {
    this.init();
  }

  init() {
    initSideBarNavigation();

    initEditor({
      ...this.htmlEditorConfig(),
      contentConfig: blogContentConfig('create_new_page_htmlContent'),
    });

    initEditor({
      ...this.cssEditorConfig(),
      contentConfig: cssContentConfig('create_new_page_htmlStyle'),
    });

    initEditor({
      ...this.jsEditorConfig(),
      contentConfig: jsContentConfig('create_new_page_htmlScript'),
    });
  }

  htmlEditorConfig() {
    return {
      containerId: 'htmlEditor',
      containerTitle: 'Blog Content',
    };
  }

  cssEditorConfig() {
    return {
      containerId: 'cssEditor',
      containerTitle: 'CSS Content',
    };
  }

  jsEditorConfig() {
    return {
      containerId: 'jsEditor',
      containerTitle: 'JS Content',
    };
  }
}

new PagesCreate();
// create_new_page_htmlContent
