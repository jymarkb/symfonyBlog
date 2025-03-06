import ReactDom from 'react-dom/client';
import TableDropDown from './TableDropDown';
import TableMenu from './TableMenu';

const rootInstances = new Map<string, ReactDom.Root>();

const TableAction = () => {
  const tableId = document.getElementById('blogTable');
  if (!tableId) return;

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();

    const targetElement = e.target as HTMLElement;

    if (targetElement.closest('.dropdown-wrapper')) {
      return;
    }

    const targetBtn = targetElement.closest('button');
    if (!targetBtn || !tableId.contains(e.target as Node)) {
      closeAllDropdowns();
      return;
    }

    const dropdownId = `dropdown-${targetBtn.id}`;
    const dropdownContainer = document.getElementById(dropdownId);
    if (!dropdownContainer) return;

    toggleDropdown(dropdownId, dropdownContainer, targetBtn, targetBtn.id);
  };

  const toggleDropdown = (
    dropdownId: string,
    dropdownContainer: HTMLElement,
    targetBtn: HTMLElement,
    dataId: string,
  ) => {
    closeAllDropdowns();

    const isVisible = !dropdownContainer.classList.contains('opacity-1');
    dropdownContainer.classList.toggle('opacity-1', isVisible);
    dropdownContainer.classList.toggle('opacity-0', !isVisible);

    if (!isVisible) {
      unmountDropdown(dropdownId);
      return;
    }

    const targetY = targetBtn.getBoundingClientRect().bottom + window.scrollY;
    const targetX = targetBtn.getBoundingClientRect().left + window.scrollX;

    let root = rootInstances.get(dropdownId);
    if (!root) {
      root = ReactDom.createRoot(dropdownContainer);
      rootInstances.set(dropdownId, root);
    }

    root.render(
      <TableDropDown targetX={targetX} targetY={targetY} isVisible={isVisible}>
        <TableMenu dataId={dataId} />
      </TableDropDown>,
    );
  };

  const closeAllDropdowns = () => {
    unmountAll();
    document.querySelectorAll('.dropdown-wrapper').forEach((dropdown) => {
      dropdown.classList.remove('opacity-1');
      dropdown.classList.add('opacity-0');
    });
  };

  const unmountDropdown = (dropdownId: string) => {
    const root = rootInstances.get(dropdownId);
    if (root) {
      root.unmount();
      rootInstances.delete(dropdownId);
    }
  };

  const unmountAll = () => {
    rootInstances.forEach((root) => root.unmount());
    rootInstances.clear();
  };

  if (!document.body.dataset.tableActionInitialized) {
    document.addEventListener('click', handleClick);
    window.addEventListener('beforeunload', () => {
      document.removeEventListener('click', handleClick);
      unmountAll();
    });
    document.body.dataset.tableActionInitialized = 'true';
  }
};

export default TableAction;
