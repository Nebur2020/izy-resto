import {
  createUserWithEmailAndPassword,
  getAuth,
  deleteUser,
} from 'firebase/auth';
import { FirestoreService } from '../base/firestore.service';
import { StaffMember } from '../../types/staff';
import { app } from '../../lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';

const auth = getAuth(app);

class StaffService extends FirestoreService<StaffMember> {
  constructor() {
    super('staff');
  }

  async createStaffMember(
    email: string,
    password: string,
    data: Omit<StaffMember, 'id' | 'email'>
  ): Promise<string> {
    try {
      // Create Firebase auth user without signing in
      const currentUser = auth.currentUser;
      await createUserWithEmailAndPassword(auth, email, password);

      // Immediately switch back to admin user
      if (currentUser) {
        await auth.updateCurrentUser(currentUser);
      }

      // Create staff document
      const staffData: Omit<StaffMember, 'id'> = {
        email,
        name: data.name,
        role: data.role,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: [],
        allowedRoutes: data.allowedRoutes || [],
      };

      const id = await super.create(staffData);
      return id;
    } catch (error) {
      console.error('Error creating staff member:', error);
      throw error;
    }
  }

  async updateStaffMember(
    id: string,
    data: Partial<StaffMember>
  ): Promise<void> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await super.update(id, updateData);
    } catch (error) {
      console.error('Error updating staff member:', error);
      throw error;
    }
  }

  async deleteStaffMember(id: string): Promise<void> {
    try {
      // Get staff member data
      const staffMember = await this.getById(id);

      // Delete from Firestore
      await super.delete(id);

      // Delete Firebase auth user
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', staffMember.email)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id;
        await deleteDoc(doc(db, 'users', userId));
      }

      const currentUser = auth.currentUser;

      if (currentUser) await deleteUser(currentUser);
    } catch (error) {
      console.error('Error deleting staff member:', error);
      throw error;
    }
  }

  async getStaffByEmail(email: string): Promise<StaffMember | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('email', '==', email)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as StaffMember;
    } catch (error) {
      console.error('Error fetching staff by email:', error);
      throw error;
    }
  }
}

export const staffService = new StaffService();
