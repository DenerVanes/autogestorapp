
-- Add vehicle profile fields to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN vehicle_type TEXT,
ADD COLUMN vehicle_model TEXT,
ADD COLUMN fuel_consumption DECIMAL(4,1);

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;

CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW 
  EXECUTE PROCEDURE public.handle_updated_at();
