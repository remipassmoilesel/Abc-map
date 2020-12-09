import { toast } from 'react-toastify';
import { ToastOptions } from 'react-toastify/dist/types';

const defaultOptions: ToastOptions = {
  position: 'bottom-right',
  autoClose: 5_000,
  pauseOnFocusLoss: true,
  hideProgressBar: true,
};

export class ToastService {
  public info(message: string): void {
    const options = { ...defaultOptions };
    options.toastId = message;
    toast.info(message, options);
  }

  public error(message: string): void {
    const options = { ...defaultOptions };
    options.toastId = message;
    toast.error(message, options);
  }
}
