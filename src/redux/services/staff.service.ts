import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  QueryReturnValue,
} from '@reduxjs/toolkit/query/react';
import { db } from '../../lib/firebase/config';
import { app } from '../../lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
} from 'firebase/auth';
import { StaffMember } from '../../types/staff';
const auth = getAuth(app);

export const staffApi = createApi({
  reducerPath: 'staffApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: builder => ({
    createStaffMember: builder.mutation<
      string,
      {
        email: string;
        password: string;
        data: Omit<StaffMember, 'id' | 'email'>;
      }
    >({
      async queryFn({ email, password, data }) {
        try {
          const currentUser = auth.currentUser;
          await createUserWithEmailAndPassword(auth, email, password);

          if (currentUser) {
            await auth.updateCurrentUser(currentUser);
          }

          const staffData: Omit<StaffMember, 'id'> = {
            email,
            name: data.name,
            role: data.role,
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            permissions: [],
          };

          const docRef = await addDoc(collection(db, 'staff'), staffData);
          return { data: docRef.id };
        } catch (error: any) {
          console.error('Error creating staff member:', error);
          return {
            error: {
              status: 'CUSTOM_ERROR',
              data: null,
              error: 'Failed to create staff member: ' + error.message,
            },
          };
        }
      },
    }),

    updateStaffMember: builder.mutation<
      void,
      { id: string; data: Partial<StaffMember> }
    >({
      async queryFn(
        { id, data },
        _api,
        _extraOptions,
        _baseQuery
      ): Promise<QueryReturnValue<void, FetchBaseQueryError, undefined>> {
        try {
          const docRef = doc(db, 'staff', id);
          await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString(),
          });

          return { data: undefined };
        } catch (error: any) {
          console.error('Error updating staff member:', error);
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error.message,
            },
          };
        }
      },
    }),

    deleteStaffMember: builder.mutation<void, string>({
      async queryFn(
        id,
        _api,
        _extraOptions,
        _baseQuery
      ): Promise<QueryReturnValue<void, FetchBaseQueryError, undefined>> {
        try {
          const staffDoc = await getDocs(
            query(collection(db, 'staff'), where('id', '==', id))
          );
          if (staffDoc.empty) throw new Error('Staff member not found');

          const staffMember = staffDoc.docs[0].data() as StaffMember;

          await deleteDoc(doc(db, 'staff', id));

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

          return { data: undefined };
        } catch (error: any) {
          console.error('Error deleting staff member:', error);
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error.message,
            },
          };
        }
      },
    }),

    getStaffByEmail: builder.query<StaffMember | null, string>({
      async queryFn(email) {
        try {
          const q = query(collection(db, 'staff'), where('email', '==', email));
          const snapshot = await getDocs(q);

          if (snapshot.empty) return { data: null };

          const doc = snapshot.docs[0];
          return {
            data: {
              id: doc.id,
              ...doc.data(),
            } as StaffMember,
          };
        } catch (error: any) {
          console.error('Error fetching staff by email:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch staff by email',
              error: error.message,
            },
          };
        }
      },
    }),

    getAllStaffMembers: builder.query<StaffMember[], void>({
      async queryFn() {
        try {
          const q = query(collection(db, 'staff'));
          const snapshot = await getDocs(q);

          if (snapshot.empty) return { data: [] };

          const staffMembers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as StaffMember[];

          return { data: staffMembers };
        } catch (error: any) {
          console.error('Error fetching all staff members:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch all staff members',
              error: error.message,
            },
          };
        }
      },
    }),
  }),
});

export const {
  useCreateStaffMemberMutation,
  useUpdateStaffMemberMutation,
  useDeleteStaffMemberMutation,
  useGetStaffByEmailQuery,
  useGetAllStaffMembersQuery,
} = staffApi;
