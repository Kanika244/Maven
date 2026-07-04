import { z } from "zod";

export const registerSchema = z.object({
  // Step 1
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),

  dob: z.string().min(1, "Date of birth is required"),

  gender: z.string().min(1, "Please select a gender"),

  occupation: z.string().min(1, "Please select an occupation"),

  annualIncome: z.string().min(1, "Please select your income"),

  city: z.string().min(2, "City is required"),

  state: z.string().min(1, "Please select your state"),

  // Step 2
  email: z.email("Invalid email"),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN"),

  aadhaar: z
    .string()
    .regex(/^\d{12}$/, "Invalid Aadhaar number"),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters"),

  confirmPassword: z.string(),

  // Step 3
  personaAnswers: z.array(z.number()),
})
.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type RegisterFormData = z.infer<typeof registerSchema>;