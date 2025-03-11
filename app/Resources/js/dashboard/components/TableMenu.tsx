import { ReactNode, use, useState } from 'react';
import ActionDialog from './action/ActionDialog';
import {
  shareBlog,
  deleteBlog,
  editBlog,
  previewBlog,
} from './action/TableMenuAction';
import { ButtonTableProps } from '../utils/props';

const TableMenu = ({ data }: { data: ButtonTableProps }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [dialogContent, setDialogContent] = useState<ReactNode>(null);
  return (
    <>
      <div className="px-2 py-1.5 text-md font-semibold">Actions</div>
      <div
        role="separator"
        aria-orientation="horizontal"
        className="-mx-1 my-1 h-px bg-muted"
      ></div>
      <ul className="p-1 cursor-pointer text-md">
        <li
          className="hover:bg-accent hover:text-accent-foreground p-2 rounded flex"
          onClick={() => editBlog({ slug: data.slug })}
        >
          <span>Edit</span>
          <i className="ml-auto text-xs tracking-widest opacity-60 icon-pencil"></i>
        </li>
        <li
          className="hover:bg-accent hover:text-accent-foreground p-2 rounded flex"
          onClick={() => previewBlog({ slug: data.slug })}
        >
          <span>Preview</span>
          <i className="ml-auto text-xs tracking-widest opacity-60 icon-eye"></i>
        </li>
        <li
          className="hover:bg-accent hover:text-accent-foreground p-2 rounded flex"
          onClick={() => {
            setDialogContent(deleteBlog({ id: data.id, title: data.title }));
            setOpenDelete(true);
          }}
        >
          <span>Delete</span>
          <i className="ml-auto text-xs tracking-widest opacity-60 icon-trash"></i>
        </li>
        <li
          className="hover:bg-accent hover:text-accent-foreground p-2 rounded flex w-full"
          onClick={() => shareBlog({ slug: data.slug })}
        >
          <span>Share</span>
          <i className="ml-auto text-xs tracking-widest opacity-60 icon-share-2"></i>
        </li>
      </ul>

      <ActionDialog open={openDelete} setOpen={setOpenDelete}>
        {dialogContent}
      </ActionDialog>
    </>
  );
};

export default TableMenu;
