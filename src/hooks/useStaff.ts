import { useState, useEffect } from 'react';
import { StaffMember, StaffFormData } from '../types/staff';
import { staffService } from '../services/staff/staff.service';

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const data = await staffService.getAll();
      setStaff(data);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createStaff = async (data: StaffFormData) => {
    try {
      await staffService.createStaffMember(data.email, data.password!, {
        name: data.name,
        role: data.role,
        active: true,
        createdAt: new Date().toDateString(),
        updatedAt: new Date().toDateString(),
        permissions: [],
        allowedRoutes: data.allowedRoutes || [],
      });
      await loadStaff(); // Refresh list
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  };

  const updateStaff = async (id: string, data: Partial<StaffMember>) => {
    try {
      await staffService.updateStaffMember(id, data);
      await loadStaff(); // Refresh list
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      await staffService.deleteStaffMember(id);
      await loadStaff(); // Refresh list
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  };

  return {
    staff,
    isLoading,
    createStaff,
    updateStaff,
    deleteStaff,
    refreshStaff: loadStaff,
  };
}
