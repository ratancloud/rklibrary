import { ShiftType } from '@/generated/prisma/enums';
import { z } from 'zod';

// Library Validation
export const librarySchema = z.object({
  name: z.string().min(1, 'Library name is required').max(255),
  email: z.email('Invalid email address'),
  contactNumber: z.string().min(10, 'Invalid phone number'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{5,6}$/, 'Invalid pincode'),
  facilities: z.array(z.string()),
});

export type Library = z.infer<typeof librarySchema> & { id: string };

// Seat Validation
export const seatSchema = z.object({
  id: z.cuid(),
  number: z.number().int().min(1),
  isActive: z.boolean(),
  floorId: z.string(),
});

export type Seat = z.infer<typeof seatSchema>;

// Floor Validation
export const floorSchema = z.object({
  name: z.string().min(1, 'Floor name is required').max(100),
  totalSeats: z.number("No. of seats is required").int('Seats must be a whole number').min(1, 'At least 1 seat required').max(1000),
});

export const floorWithIdSchema = floorSchema.extend({
  id: z.cuid(),
});

// Floor with database seats (for API responses)
export const floorWithSeatsSchema = z.object({
  id: z.cuid(),
  name: z.string(),
  libraryId: z.string(),
  seats: z.array(seatSchema),
});

export type Floor = z.infer<typeof floorWithIdSchema>;
export type FloorInput = z.infer<typeof floorSchema>;
export type FloorWithSeats = z.infer<typeof floorWithSeatsSchema>;

// Shift Validation
export const shiftSchema = z.object({
  name: z.enum(ShiftType),
  startTime: z.number().min(0).max(1440),
  endTime: z.number().min(0).max(1440),
  price: z.number("Monthly price is required").min(0, 'Price cannot be negative').max(999999),
  isActive: z.boolean(),
});

export const shiftWithIdSchema = shiftSchema.extend({
  id: z.cuid(),
});

export type Shift = z.infer<typeof shiftWithIdSchema>;
export type ShiftInput = z.infer<typeof shiftSchema>;

// API Response Schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  data: z.unknown().optional(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  status: z.number().optional(),
});

// Form State Validation
export const libraryFormSchema = librarySchema.extend({
  id: z.string().optional(),
});

export type LibraryFormState = z.infer<typeof libraryFormSchema>;

// Master Setup Validation
export const librarySetupSchema = librarySchema.extend({
  floors: z.array(floorSchema).min(1, 'At least one floor is required'),
  shifts: z.array(shiftSchema)
    .refine((shifts) => shifts.some(s => s.isActive), {
      message: 'At least one active shift is required',
    }),
});

// payload type for library setup
export type LibrarySetupPayload = z.input<typeof librarySetupSchema>;

// --- Student Validation ---
export const studentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  gender: z.string().min(1, 'Gender is required'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  address: z.string().optional().nullable(),
  lockerNumber: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().optional()
  ),
});

export type Student = z.infer<typeof studentSchema> & { id: string; memberId: number };

// --- Subscription Validation ---
export const subscriptionSchema = z.object({
  // In your new schema, Subscription tracks shiftName (ShiftType) 
  // and SeatAssignment tracks multiple shifts via shiftId
  shiftIds: z.array(z.string()).min(1, 'At least one shift must be selected'),
  floorId: z.string().min(1, 'Floor is required'),
  seatId: z.string().min(1, 'Seat is required'),
  
  startDate: z.coerce.date(), // Use coerce to handle string-to-date conversion
  endDate: z.coerce.date(),
  
  totalAmount: z.number().min(0),
  amountPaid: z.number().min(0),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;

// --- Student Registration (Combined) Validation ---
export const studentRegistrationSchema = studentSchema.extend({
  shiftIds: z.array(z.string()).min(1, 'At least one shift must be selected'),
  floorId: z.string().min(1, 'Floor is required'),
  seatId: z.string().min(1, 'Seat is required'),
  
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  
  totalAmount: z.number().min(0),
  amountPaid: z.number().min(0),
});

export type StudentRegistration = z.infer<typeof studentRegistrationSchema>;