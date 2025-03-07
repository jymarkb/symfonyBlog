import ReactDOM from "react-dom/client";
import { Toaster, toast } from "sonner";

const ToastMessage = () => {
  const el = document.getElementById("toaster") as HTMLElement;
  ReactDOM.createRoot(el).render(<Toaster richColors />);

  // Listen for custom toast events
  document.addEventListener("show-toast", (event: Event) => {
    const customEvent = event as CustomEvent<{ type: string; message: string }>;
    const { type, message } = customEvent.detail;

    if (type === "success") {
      toast.success(message, { duration: 1500 });
    } else if (type === "error") {
      toast.error(message, { duration: 1500 });
    }
  });
};

export default ToastMessage;
