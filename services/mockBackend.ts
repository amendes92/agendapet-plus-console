import { Appointment, AppointmentStatus, Customer } from '../types';
const AVAILABLE_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const CUSTOMERS_DB: Customer[] = [
  { id: 'c1', name: 'Ana Silva', phoneNumber: '+5511999999999', pets: [{ name: 'Rex', breed: 'Golden Retriever', restrictions: 'Alergia a shampoo comum' }] },
  { id: 'c2', name: 'Carlos Souza', phoneNumber: '+5511888888888', pets: [{ name: 'Luna', breed: 'Poodle' }] }
];
const APPOINTMENTS_DB: Appointment[] = [{ id: 'a1', customerId: 'c1', date: new Date().toISOString().split('T')[0], time: '10:00', service: 'Banho e Tosa', status: AppointmentStatus.CONFIRMED }];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const MockBackend = {
  getCustomerByPhone: async (phone: string) => { await delay(300); return CUSTOMERS_DB.find(c => c.phoneNumber === phone); },
  getAvailableSlots: async (date: string) => { await delay(300); const taken = APPOINTMENTS_DB.filter(a => a.date === date && a.status !== AppointmentStatus.CANCELLED).map(a => a.time); return AVAILABLE_SLOTS.filter(s => !taken.includes(s)); },
  bookAppointment: async (customerId: string, date: string, time: string, service: string) => { await delay(300); const isTaken = APPOINTMENTS_DB.some(a => a.date === date && a.time === time && a.status !== AppointmentStatus.CANCELLED); if (isTaken) return { success: false, message: 'Indisponível' }; const newAppt = { id: Math.random().toString(36).substr(2), customerId, date, time, service, status: AppointmentStatus.CONFIRMED }; APPOINTMENTS_DB.push(newAppt); return { success: true, appointment: newAppt, message: 'Agendado!' }; },
  getCustomerContext: async (customerId: string) => { const c = CUSTOMERS_DB.find(x => x.id === customerId); if(!c) return "Novo"; return `Cliente: ${c.name}. Pets: ${c.pets.map(p => p.name).join(', ')}`; }
};