import { useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StaffList } from '../../../components/dashboard/components/staff/StaffList';
import { StaffForm } from '../../../components/dashboard/components/staff/StaffForm';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useStaff } from '../../../hooks/useStaff';
import { StaffMember } from '../../../types/staff';
import toast from 'react-hot-toast';
import { useStaffCheck } from '../../../hooks/useStaffCheck';
import { useTranslation } from 'react-i18next';

export function StaffManagement() {
  const { t } = useTranslation();
  const { staff, isLoading, createStaff, updateStaff, deleteStaff } =
    useStaff();
  const { isStaff, staffData } = useStaffCheck();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    member: StaffMember | null;
  }>({ isOpen: false, member: null });

  const handleCreate = async (data: any) => {
    try {
      await createStaff(data);
      setIsFormOpen(false);
      toast.success(t('personal:menber-create-successfully'));
    } catch (error: any) {
      if (error?.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            toast.error(t('personal:email-already-in-use'));
            break;
          case 'auth/invalid-email':
            toast.error(t('personal:invalid-email'));
            break;
          case 'auth/weak-password':
            toast.error(t('personal:weak-password'));
            break;
          case 'auth/operation-not-allowed':
            toast.error(t('personal:operation-not-allowed'));
            break;
          case 'auth/network-request-failed':
            toast.error(t('personal:network-request-failed'));
            break;
          default:
            toast.error(t('personal:an-error-occurred'));
            console.error('Firebase Auth Error:', error);
        }
      } else {
        toast.error(error?.message || t('personal:an-error-occurred'));
        console.error('Error creating staff:', error);
      }
    }
  };

  const handleEdit = async (data: any) => {
    if (!editingStaff) return;

    try {
      await updateStaff(editingStaff.id, data);
      setEditingStaff(null);
      setIsFormOpen(false);
      toast.success(t('personal:menber-successfully-update'));
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error(t('personal:error-during-updating'));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation.member) return;

    try {
      await deleteStaff(deleteConfirmation.member.id);
      toast.success(t('personal:perosnal-menber-successfully-deleted'));
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error(t('personal:error-during-deleting'));
    } finally {
      setDeleteConfirmation({ isOpen: false, member: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {t('personal:human-resources-management')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('personal:human-resources-management-description')}
          </p>
        </div>
        {((isStaff && staffData?.role === 'admin') || !isStaff) && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('personal:add-staff')}
          </Button>
        )}
      </div>

      <StaffList
        staff={staff}
        isLoading={isLoading}
        onEdit={member => {
          setEditingStaff(member);
          setIsFormOpen(true);
        }}
        onDelete={member =>
          setDeleteConfirmation({
            isOpen: true,
            member,
          })
        }
      />

      {((isStaff && staffData?.role === 'admin') || !isStaff) &&
        staff.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-900/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium text-amber-800 dark:text-amber-400">
                {t('personal:warning-title')}
              </h3>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-amber-700 dark:text-amber-300 font-bold">
                {t('personal:warning-description')}
              </p>
            </div>
          </div>
        )}

      {isFormOpen && (
        <StaffForm
          staff={editingStaff}
          onSave={editingStaff ? handleEdit : handleCreate}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingStaff(null);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, member: null })}
        onConfirm={handleDelete}
        title="Supprimer le membre"
        message={`Êtes-vous sûr de vouloir supprimer ${deleteConfirmation.member?.name} ? Cette action est irréversible.`}
      />
    </div>
  );
}
