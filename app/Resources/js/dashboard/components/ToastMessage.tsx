import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';

const ToastMessage = () =>{
  const el = document.getElementById('toaster') as HTMLElement;
  ReactDOM.createRoot(el).render(<Toaster richColors />);
}

export default ToastMessage;