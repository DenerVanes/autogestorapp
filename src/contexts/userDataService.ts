
import { profileService } from '@/services/profileService';
import { transactionService } from '@/services/transactionService';
import { odometerService } from '@/services/odometerService';
import { workHoursService } from '@/services/workHoursService';
import { User, Transaction, OdometerRecord, WorkHoursRecord } from '@/types';

export class UserDataService {
  static async loadUserProfile(authUserId: string): Promise<User> {
    let profile;
    try {
      profile = await profileService.getUserProfile(authUserId);
    } catch (error: any) {
      console.log('Profile not found, creating new profile');
      // Create profile if it doesn't exist
      profile = await profileService.updateUserProfile(authUserId, {
        name: 'Usuário',
        email: ''
      });
    }

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      vehicleType: profile.vehicle_type,
      vehicleModel: profile.vehicle_model,
      fuelConsumption: profile.fuel_consumption
    };
  }

  static async loadAllUserData(): Promise<{
    transactions: Transaction[];
    odometerRecords: OdometerRecord[];
    workHours: WorkHoursRecord[];
  }> {
    const [transactionsData, odometerData, workHoursData] = await Promise.all([
      transactionService.getTransactions(),
      odometerService.getOdometerRecords(),
      workHoursService.getWorkHours()
    ]);

    return {
      transactions: transactionsData.map(t => ({
        id: t.id,
        type: t.type as 'receita' | 'despesa',
        date: new Date(t.date),
        value: Number(t.value),
        category: t.category,
        fuelType: t.fuel_type,
        pricePerLiter: t.price_per_liter ? Number(t.price_per_liter) : undefined,
        subcategory: t.subcategory,
        observation: t.observation
      })),
      odometerRecords: odometerData.map(o => ({
        id: o.id,
        date: new Date(o.date),
        type: o.type as 'inicial' | 'final',
        value: o.value
      })),
      workHours: workHoursData.map(w => ({
        id: w.id,
        startDateTime: new Date(w.start_date_time),
        endDateTime: new Date(w.end_date_time)
      }))
    };
  }
}
