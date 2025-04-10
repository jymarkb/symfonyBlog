import React from 'react';
import { toast } from 'sonner';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

export const editBlog = ({ slug }: { slug: string }) => {
  const targetLoc = `${window.location.origin}/dashboard/pages/edit/${slug}`;
  window.location.href = targetLoc;
};

export const previewBlog = async ({ slug }: { slug: string }) => {
  const fullUrl = `${window.location.origin}/blog/${slug}`;
  window.open(fullUrl, '_blank');
};

export const deleteBlog = ({ id, title }: { id: string; title: string }) => {
  const handleConfirm = async (id: string) => {
    console.log(id);

    const res = await fetch(`/dashboard/pages/delete/${id}`).then((response) =>
      response.json(),
    );

    if (res.success) {
      location.reload();
    } else {
      toast.error('Deletion Failed', {
        description: <p className='text-sm font-semibold text-red-900'>The blog could not be deleted. Please try again later.</p>,
        duration: 1500,
      });
    }
  };

  return (
    <DialogContent>
      <DialogHeader className="space-y-2">
        <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
          <AlertTriangle className="w-5 h-5 text-red-500" /> Delete Blog
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-600">
          This action is <strong className="text-red-500">permanent</strong> and
          cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <p className="text-gray-700">
        Are you sure you want to delete the blog titled:
      </p>
      <p className="font-semibold border border-gray-300 bg-gray-100 p-3 rounded-md">
        {title}
      </p>

      <DialogFooter>
        <button
          onClick={() => handleConfirm(id)}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white w-full"
        >
          Confirm
        </button>
      </DialogFooter>
    </DialogContent>
  );
};

export const shareBlog = async ({ slug }: { slug: string }) => {
  const fullUrl = `${window.location.origin}/blog/${slug}`;
  navigator.clipboard.writeText(fullUrl);
  toast.success('Link Copied!', {
    description: <p className='text-sm font-semibold text-green-900'>The link has been copied to your clipboard</p>,
    duration: 1500,
  });
};
