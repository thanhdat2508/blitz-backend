import bcrypt from "bcrypt";

export const generateOtp = (length: number = 6): string => {
  let digits = "";
  for (let i = 0; i < length; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  return digits;
};

export const hashOtp = async (code: string): Promise<string> => {
  return await bcrypt.hash(code, 10);
};

export const verifyOtp = async (code: string, hashedCode: string): Promise<boolean> => {
  return await bcrypt.compare(code, hashedCode);
};