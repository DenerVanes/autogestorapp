import { profileService } from '@/services/profileService';
import { transactionService } from '@/services/transactionService';
import { odometerService } from '@/services/odometerService';
import { workHoursService } from '@/services/workHoursService';
import { lancamentoService } from '@/services/lancamentoService';
import { User, Transaction, OdometerRecordFull, WorkHoursRecord } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export class UserDataService {
  static async loadUserProfile(authUserId: string): Promise<User> {
    // Retry logic to handle potential delay in profile creation after signup
    for (let i = 0; i < 3; i++) {
      try {
        const profile = await profileService.getUserProfile(authUserId);
        // Profile found, return mapped data
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          vehicleType: profile.vehicle_type,
          vehicleModel: profile.vehicle_model,
          fuelConsumption: profile.fuel_consumption
        };
      } catch (error) {
        console.log(`Attempt ${i + 1}: Profile not found, retrying in 1 second...`);
        if (i < 2) await new Promise(res => setTimeout(res, 1000));
      }
    }

    // Fallback if profile is still not found after retries
    console.error("Failed to load profile after multiple retries. Using fallback data from auth.");
    const { data: { user: authUser } } = await supabase.auth.getUser();
    return {
      id: authUserId,
      name: authUser?.user_metadata.name || 'Usuário',
      email: authUser?.email || '',
      vehicleType: '',
      vehicleModel: '',
      fuelConsumption: undefined,
    };
  }

  static async loadAllUserData(): Promise<{
    transactions: Transaction[];
    odometerRecords: OdometerRecordFull[];
    workHours: WorkHoursRecord[];
    lancamentos: any[];
  }> {
    const [transactionsData, odometerData, workHoursData, lancamentosData] = await Promise.all([
      transactionService.getTransactions(),
      odometerService.getOdometerRecords(),
      workHoursService.getWorkHours(),
      lancamentoService.getLancamentos()
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
        user_id: o.user_id,
        date: new Date(o.date),
        type: o.type as 'inicial' | 'final',
        value: o.value,
        pair_id: o.pair_id,
        odometro_inicial: o.odometro_inicial,
        odometro_final: o.odometro_final,
        ciclo: o.ciclo,
        created_at: new Date(o.created_at),
        updated_at: new Date(o.updated_at)
      })),
      workHours: workHoursData.map(w => ({
        id: w.id,
        startDateTime: new Date(w.start_date_time),
        endDateTime: new Date(w.end_date_time)
      })),
      lancamentos: lancamentosData
    };
  }
} 