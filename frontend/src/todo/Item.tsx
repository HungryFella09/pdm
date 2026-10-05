import React from 'react';
import { IonItem, IonLabel, IonCheckbox, IonItemSliding, IonItemOptions, IonItemOption, IonIcon } from '@ionic/react';
import { trash } from 'ionicons/icons';
import { ItemProps } from './ItemProps';

interface ItemPropsExt extends ItemProps {
  onEdit: (_id?: number) => void;
  onDelete: (_id?: number) => void;
}

const Item: React.FC<ItemPropsExt> = ({ id, title, priority, dueDate, isCompleted, onEdit, onDelete }) => {
  return (
    <IonItemSliding>
      <IonItem onClick={() => onEdit(id)}>
        <IonCheckbox slot="start" checked={isCompleted} disabled />
        <IonLabel>
          <h2>{title}</h2>
          <p>Priority: {priority} | Due: {dueDate}</p>
        </IonLabel>
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={() => onDelete(id)}>
          <IonIcon slot="icon-only" icon={trash} />
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default Item;