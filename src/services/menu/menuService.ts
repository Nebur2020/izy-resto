import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { MenuItem } from '../../types';
import { MenuFilters, MenuServiceError, MenuItemInput } from './types';

const COLLECTION_NAME = 'menu_items';

export async function getMenuItems(filters?: MenuFilters): Promise<MenuItem[]> {
  try {
    let q = collection(db, COLLECTION_NAME);
    const constraints = [];

    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as MenuItem)
    );
  } catch (error) {
    const serviceError = new Error(
      'Failed to fetch menu items'
    ) as MenuServiceError;
    serviceError.code = 'menu/fetch-error';
    throw serviceError;
  }
}

export async function createMenuItem(item: MenuItemInput): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...item,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    const serviceError = new Error(
      'Failed to create menu item'
    ) as MenuServiceError;
    serviceError.code = 'menu/create-error';
    throw serviceError;
  }
}

export async function updateMenuItem(
  id: string,
  item: Partial<MenuItemInput>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...item,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    const serviceError = new Error(
      'Failed to update menu item'
    ) as MenuServiceError;
    serviceError.code = 'menu/update-error';
    throw serviceError;
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    const serviceError = new Error(
      'Failed to delete menu item'
    ) as MenuServiceError;
    serviceError.code = 'menu/delete-error';
    throw serviceError;
  }
}
