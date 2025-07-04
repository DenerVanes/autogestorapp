
import { odometerService } from '@/services/odometerService';
import { OdometerRecord } from '@/types';

export const useOdometerOperations = (
  setOdometerRecords: React.Dispatch<React.SetStateAction<OdometerRecord[]>>,
  authUserId: string | undefined
) => {
  const addOdometerRecord = async (record: Omit<OdometerRecord, 'id'>) => {
    if (!authUserId) throw new Error('User not authenticated');

    const newRecord = await odometerService.createOdometerRecord({
      date: typeof record.date === 'string' ? record.date : record.date.toISOString(),
      type: record.type,
      value: record.value
    });

    const transformedRecord = {
      id: newRecord.id,
      date: new Date(newRecord.date),
      type: newRecord.type as 'inicial' | 'final',
      value: newRecord.value
    };

    setOdometerRecords(prev => [transformedRecord, ...prev]);
  };

  const updateOdometerRecord = async (id: string, updates: Partial<OdometerRecord>) => {
    if (!authUserId) throw new Error('User not authenticated');

    const updatedRecord = await odometerService.updateOdometerRecord(id, {
      date: updates.date?.toISOString(),
      type: updates.type,
      value: updates.value
    });

    setOdometerRecords(prev => prev.map(o => 
      o.id === id 
        ? {
            id: updatedRecord.id,
            date: new Date(updatedRecord.date),
            type: updatedRecord.type as 'inicial' | 'final',
            value: updatedRecord.value
          }
        : o
    ));
  };

  const deleteOdometerRecord = async (id: string) => {
    if (!authUserId) throw new Error('User not authenticated');

    console.log('Deleting odometer record:', id);
    
    // Delete from database first
    await odometerService.deleteOdometerRecord(id);
    
    // Then update local state
    setOdometerRecords(prev => prev.filter(o => o.id !== id));
    
    console.log('Odometer record deleted successfully');
  };

  const deleteMultipleOdometerRecords = async (ids: string[]) => {
    if (!authUserId) throw new Error('User not authenticated');

    console.log('Deleting multiple odometer records:', ids);
    
    // Filter out any undefined/null ids
    const validIds = ids.filter(id => id && id.trim() !== '');
    
    if (validIds.length === 0) {
      console.log('No valid IDs to delete');
      return;
    }
    
    // Delete from database first
    await odometerService.deleteMultipleOdometerRecords(validIds);
    
    // Then update local state
    setOdometerRecords(prev => prev.filter(o => !validIds.includes(o.id)));
    
    console.log('Multiple odometer records deleted successfully');
  };

  return {
    addOdometerRecord,
    updateOdometerRecord,
    deleteOdometerRecord,
    deleteMultipleOdometerRecords
  };
};
