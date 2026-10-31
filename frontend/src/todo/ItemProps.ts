export interface ItemProps {
  id?: number;
  title: string;
  priority: number;
  dueDate: string;
  isCompleted: boolean;
  pending?: boolean; 
  lat?: number;
  lng?: number;
  photoPath?: string;
  webviewPath?: string;
}