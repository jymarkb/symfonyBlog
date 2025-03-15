import React from 'react';
import ReactDOM from 'react-dom/client';
import { BlogPost } from '../../utils/props';
import { TableRows } from './TableRows';

let tableRoot: ReactDOM.Root | null = null;

export const TableRenderAction = ({ fetchData }: { fetchData: BlogPost[] }) => {
  const tableBody = document.getElementById('blogTableBody');
  try {
    if (!tableBody) return;

    if (!tableRoot) {
      tableRoot = ReactDOM.createRoot(tableBody);
    }
    tableRoot.render(<TableRows fetchData={fetchData} />);
  } catch (error) {
    console.log('Error', error);
  }
};
