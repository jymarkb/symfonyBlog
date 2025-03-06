import { toast } from 'sonner';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const editBlog = ({ id }: { id: string }) => {
  console.log(id);
};

export const previewBlog = ({ id }: { id: string }) => {
  console.log(id);
};

export const deleteBlog = ({ id }: { id: string }) => {
  console.log(id);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Blog</DialogTitle>
        <DialogDescription >You're trying to delete a blog page.</DialogDescription>
      </DialogHeader>
      <p>{`Are you sure you want to delete the blog titled ${id}?`}</p>
    </DialogContent>
  );
};

export const shareBlog = ({ id }: { id: string }) => {
  console.log(id);
  toast.success('Link Copied!', {
    description: 'The link has been copied to your clipboard.',
    duration: 1500,
  });
};
