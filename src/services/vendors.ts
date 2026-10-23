import { api } from './api.ts';
import { Vendor, VendorQuote } from '../../server/models/types.ts';

export const vendorsService = {
  async getVendors(eventId: string): Promise<{ success: boolean; vendors: Vendor[] }> {
    return api.get(`/events/${eventId}/vendors`);
  },

  async createVendor(eventId: string, vendorData: Partial<Vendor>): Promise<{ success: boolean; vendor: Vendor }> {
    return api.post(`/events/${eventId}/vendors`, vendorData);
  },

  async getQuotes(eventId: string): Promise<{ success: boolean; quotes: VendorQuote[] }> {
    return api.get(`/events/${eventId}/vendor-quotes`);
  },

  async createQuote(eventId: string, quoteData: Partial<VendorQuote>): Promise<{ success: boolean; quote: VendorQuote }> {
    return api.post(`/events/${eventId}/vendor-quotes`, quoteData);
  },
};
