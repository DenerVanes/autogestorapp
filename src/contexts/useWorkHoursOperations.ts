
import { workHoursService } from '@/services/workHoursService';
import { WorkHoursRecord } from '@/types';

export const useWorkHoursOperations = (
  setWorkHours: React.Dispatch<React.SetStateAction<WorkHoursRecord[]>>,
  authUserId: string | undefined
) => {
  const addWorkHours = async (record: Omit<WorkHoursRecord, 'id'>) => {
    if (!authUserId) throw new Error('User not authenticated');

    const newRecord = await workHoursService.createWorkHours({
      start_date_time: record.startDateTime.toISOString(),
      end_date_time: record.endDateTime.toISOString()
    });

    const transformedRecord = {
      id: newRecord.id,
      startDateTime: new Date(newRecord.start_date_time),
      endDateTime: new Date(newRecord.end_date_time)
    };

    setWorkHours(prev => [transformedRecord, ...prev]);
  };

  const updateWorkHours = async (id: string, updates: Partial<WorkHoursRecord>) => {
    if (!authUserId) throw new Error('User not authenticated');

    const updatedRecord = await workHoursService.updateWorkHours(id, {
      start_date_time: updates.startDateTime?.toISOString(),
      end_date_time: updates.endDateTime?.toISOString()
    });

    setWorkHours(prev => prev.map(w => 
      w.id === id 
        ? {
            id: updatedRecord.id,
            startDateTime: new Date(updatedRecord.start_date_time),
            endDateTime: new Date(updatedRecord.end_date_time)
          }
        : w
    ));
  };

  const deleteWorkHours = async (id: string) => {
    if (!authUserId) throw new Error('User not authenticated');

    await workHoursService.deleteWorkHours(id);
    setWorkHours(prev => prev.filter(w => w.id !== id));
  };

  return {
    addWorkHours,
    updateWorkHours,
    deleteWorkHours
  };
};
