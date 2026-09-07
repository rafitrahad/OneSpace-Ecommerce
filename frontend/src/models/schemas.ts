import { z } from 'zod';

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/\d/, 'Password must include a number');

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: strongPassword,
  phone: z.string().optional(),
  address: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  imageUrl: z.string().optional(),
  categoryId: z.string().optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: strongPassword,
  role: z.enum(['admin', 'manager']),
});
export type StaffInput = z.infer<typeof staffSchema>;

export const inventoryAdjustSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  type: z.enum(['restock', 'sale', 'adjustment', 'return']),
  quantityChange: z.coerce.number().int(),
  reason: z.string().optional(),
});
export type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>;

export const checkoutSchema = z.object({
  shippingAddress: z.string().min(4, 'Enter a shipping address'),
  note: z.string().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
