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
      value: record.value,
      pair_id: record.pair_id
    });

    const transformedRecord = {
      id: newRecord.id,
      date: new Date(newRecord.date),
      type: newRecord.type as 'inicial' | 'final',
      value: newRecord.value,
      pair_id: newRecord.pair_id
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

    await odometerService.deleteOdometerRecord(id);
    setOdometerRecords(prev => prev.filter(o => o.id !== id));
  };

  return {
    addOdometerRecord,
    updateOdometerRecord,
    deleteOdometerRecord
  };
};
