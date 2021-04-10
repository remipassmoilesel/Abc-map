import { Env } from './Env';
import { Logger } from '@abc-map/frontend-shared';

const logger = Logger.get('FileIO.ts');

export enum InputType {
  Multiple = 'Multiple',
  Single = 'Single',
}

export enum InputResultType {
  Confirmed = 'Confirmed',
  Canceled = 'Canceled',
}

export interface FilesSelected {
  type: InputResultType.Confirmed;
  files: File[];
}

export interface Canceled {
  type: InputResultType.Canceled;
}

export declare type FileInputResult = FilesSelected | Canceled;

export class FileIO {
  public static openInput(type = InputType.Single, accept?: string): Promise<FileInputResult> {
    const fileNode = document.createElement('input');
    fileNode.setAttribute('type', 'file');
    fileNode.multiple = type === InputType.Multiple;
    fileNode.style.display = 'none';
    fileNode.dataset.cy = 'file-input';
    fileNode.accept = accept || '';
    document.body.appendChild(fileNode);

    return new Promise<FileInputResult>((resolve, reject) => {
      fileNode.onchange = () => {
        const files = fileNode.files ? Array.from(fileNode.files) : [];
        fileNode.remove();
        resolve({ type: InputResultType.Confirmed, files: files || [] });
      };

      fileNode.oncancel = () => {
        fileNode.remove();
        resolve({ type: InputResultType.Canceled });
      };

      fileNode.onerror = (err) => {
        logger.error('Error during file selection: ', err);
        reject(new Error('Error during file selection'));
      };

      if (!Env.isE2e()) {
        fileNode.click();
      }
    });
  }

  public static outputBlob(blob: Blob, name: string): void {
    this.outputString(URL.createObjectURL(blob), name);
  }

  public static outputString(dataStr: string, name: string): void {
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', name);
    anchor.dataset.cy = 'file-output';

    document.body.appendChild(anchor);
    if (!Env.isE2e()) {
      anchor.click();
      anchor.remove();
    }
  }
}