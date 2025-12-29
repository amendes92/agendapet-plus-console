export enum Sender { USER = 'USER', CLIENT = 'CLIENT', SYSTEM = 'SYSTEM' }
export enum AppointmentStatus { PENDING = 'PENDING', CONFIRMED = 'CONFIRMED', CANCELLED = 'CANCELLED' }
export interface Pet { name: string; breed: string; restrictions?: string; }
export interface Customer { id: string; name: string; phoneNumber: string; pets: Pet[]; }
export interface Appointment { id: string; customerId: string; date: string; time: string; service: string; status: AppointmentStatus; }
export interface Message { id: string; text: string; sender: Sender; timestamp: Date; isAiGenerated?: boolean; }
export interface ChatSession { id: string; customer: Customer; messages: Message[]; unreadCount: number; isAiActive: boolean; lastActivity: Date; }