import { supabase } from "../supabase";

interface BusinessSettings {
  business_name: string;
  twilio_phone_number: string;
}

export const getUserSettings = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No user found");

  const { data, error } = await supabase
    .from("users")
    .select("business_name, twilio_phone_number")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserSettings = async (settings: BusinessSettings) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No user found");

  const { error } = await supabase
    .from("users")
    .update({
      business_name: settings.business_name,
      twilio_phone_number: settings.twilio_phone_number,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw error;
  return true;
};
