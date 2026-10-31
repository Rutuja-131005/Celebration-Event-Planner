import { api } from './api.ts';
import { Vendor, VendorQuote } from '../../server/models/types.ts';

const fallbackVendors: Vendor[] = [
  {
    id: 'vnd_heritage_decor',
    name: 'Heritage Decorators',
    serviceCategory: 'Mandap & Floral Lighting',
    location: 'Lake Palace Road, Udaipur',
    contactPerson: 'Vikramaditya Singh',
    phone: '+91 98290 12345',
    verificationStatus: 'verified',
    rating: 4.9,
    reviewCount: 38,
    avatarInitials: 'HD',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBjwbpYlPCWO2NQ80FXL_zDTeyXIDinVbGXzmvL3ZSp9JTFFjjpprdt4Y3LeBnfLyDJ_XrW3cQPEB9dEIezE6NUJAaVy-tMB7C4iqL_93ePbK3myo2lmn5QI8-n0I7TapbFi9W1nmWKBr9srWZOhnM96uCNK3iCd61k880IUp_iryYmiEIoE7qT3DIq0YEOe0YMO_zZuGbLaHRq4Azp4eqqRUooV_jahEDgbvFvP_39S3YvfKvv-AROdA',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'vnd_svaram_ensemble',
    name: 'Svaram Live Ensemble',
    serviceCategory: 'Sangeet & Sufi Night',
    location: 'Hathi Pole, Udaipur',
    contactPerson: 'Aarti Kashyap',
    phone: '+91 94140 78910',
    verificationStatus: 'preferred',
    rating: 4.8,
    reviewCount: 29,
    avatarInitials: 'SL',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBsfu2a_xoqA5FF3gugrDbhX2HP2YTCHdMQy9-MqhKSZOLHyEXmqTgkZOAD4KzmKaBM-lgJ31jIpqRcVyqdfBqRTqQ9wMRjMOtUwxqp1AmyiaF7TxQxTPZbcFa9meagCQJX0yzRQnXWBUVr8fMrWILinCA_GtjnxUWQq2MLsTZJ8RYikOlg2m4fJYO6m9yaKepV3Yh_jjoD1996T-ghCudPU1EdjVg3JdLudHHyOGbGgNskM6qGK3bm0A',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'vnd_vintage_frame',
    name: 'The Vintage Frame Studio',
    serviceCategory: 'Cinematic Drone & Stills',
    location: 'Udaipur / Mumbai Studios',
    contactPerson: 'Kabir & Meera',
    phone: '+91 98201 44512',
    verificationStatus: 'certified',
    rating: 4.9,
    reviewCount: 42,
    avatarInitials: 'VF',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBTNQmdvoE1hQRN07BGXwItCuJu3O4aVNWGrNUAjkfoAelDuapEKlVQ7YFRmQBK_5oapcQTzmNxSqHifqIF1tTv2FMyMw4-l_G_e5kw0CtUdxKvblbe8uzkrCv3WdnSXdWCHDcFsKQ546g9IYHykgVMAPL5erC1I_4FQOGwdJkrwjCoUz9BtI7o1hZTxEFpSJQQgQ-BersZ5_rsSTBrqm46VTDbJO7ZPBIBs6tSes7gA_zaNJuNiedvzg',
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
  },
  {
    id: 'vnd_royal_mewari',
    name: 'Royal Mewari Catering',
    serviceCategory: 'Royal Gastronomy',
    location: 'Lake Palace Road, Udaipur',
    contactPerson: 'Maharaj Shivraj',
    phone: '+91 97840 55667',
    verificationStatus: 'certified',
    rating: 5.0,
    reviewCount: 56,
    avatarInitials: 'RM',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAK3Pri2JjYTQoriXQeyW9VR1EyFt8CwAh4D6OoobsQjO54J83dM60IznrVWf5qC7_R5nKVmWs95xzECjgDWiEOlVWcftgHPx2Q9-fMmsxImGMb4aSohSmwZyy3Rg7wE6Ergpc5dNtr0RJ0D4m3XiV62HLkbjkU8hTyzZJJLF7_c-pZ31yqLyPesNWpOPyp-ScThshxnzR-dfdPof1g_OqiFTfEpOK3_SoqljIxURrtSg8CKkbaXVMUOQ',
    createdAt: '2025-01-25T00:00:00Z',
    updatedAt: '2025-01-25T00:00:00Z',
  },
];

const fallbackQuotes: VendorQuote[] = [
  {
    id: 'qte_1',
    eventId: 'evt_ananya_rohan',
    vendorId: 'vnd_heritage_decor',
    vendorName: 'Royal Rajputana Events',
    category: 'Decor & Scenography',
    quotedAmount: 530000,
    quoteDate: '2025-10-18',
    validUntil: '2025-11-18',
    bookingStatus: 'approved',
    isAiRecommended: true,
    contractScope: [
      '20ft Hand-Carved Floral Mandap (Mogra & Marigold)',
      '400 Handcrafted Brass Diyas & Urli Setups',
      'Fairy Canopy (1,200 sq.ft Courtyard, 2700K Glow)',
      '2 Stage Setups (Varmala + Sangeet with Dual Truss)',
    ],
    inclusions: ['Brassware provided', 'Crew standby (16h)', 'Transportation within Udaipur'],
    exclusions: ['Imported Dutch Orchids (Optional +₹90k)'],
    paymentTerms: '25% Advance / 50% Mid / 25% Wrap',
    notes:
      'Studio Co-Pilot Recommendation: Delivers authentic Marwari craftsmanship at ₹80,000 lower net expenditure with 98% on-time track record.',
    createdAt: '2025-10-18T00:00:00Z',
    updatedAt: '2025-10-18T00:00:00Z',
  },
  {
    id: 'qte_3',
    eventId: 'evt_ananya_rohan',
    vendorId: 'vnd_vintage_frame',
    vendorName: 'The Vintage Frame Studio',
    category: 'Cinematography & Stills',
    quotedAmount: 280000,
    quoteDate: '2025-03-20',
    validUntil: '2025-12-20',
    bookingStatus: 'contract_signed',
    contractScope: [
      '2 Full Shooting Days across Udaipur Lakefront',
      'Aerial Drone permissions & Cinematic Teaser Film',
      'Hand-bound Italian leather photobook (80 pages)',
    ],
    inclusions: ['3 Master Cinematographers', '4K Master Archive Drive'],
    paymentTerms: '30% Advance Paid / 50% On-site / 20% Delivery',
    notes: 'Contract signed; advance of ₹84,000 cleared.',
    createdAt: '2025-03-20T00:00:00Z',
    updatedAt: '2025-03-28T00:00:00Z',
  },
  {
    id: 'qte_5',
    eventId: 'evt_ananya_rohan',
    vendorId: 'vnd_royal_mewari',
    vendorName: 'Royal Mewari Catering',
    category: 'Royal Gastronomy',
    quotedAmount: 760000,
    quoteDate: '2025-03-18',
    validUntil: '2025-12-18',
    bookingStatus: 'approved',
    contractScope: [
      'Curated Royal Rajasthani Daawat (320 Pax Guaranteed @ ₹2,200/plate)',
      'Slow-cooked Dal Baati Churma, Laal Maas, and Ker Sangri',
      'Interactive live Pan-Asian wok counter for Sangeet night',
    ],
    inclusions: ['Traditional silver thali ware', '5 Master Royal Chefs'],
    paymentTerms: '50% Staging Advance / 50% Event Close',
    notes: 'Menu tasting confirmed for Nov 12.',
    createdAt: '2025-03-18T00:00:00Z',
    updatedAt: '2025-04-09T00:00:00Z',
  },
];

export const vendorsService = {
  async getVendors(eventId: string): Promise<{ success: boolean; vendors: Vendor[] }> {
    try {
      const res = await api.get<{ success: boolean; vendors: Vendor[] }>(`/events/${eventId}/vendors`);
      if (res?.success) return res;
    } catch {}

    return { success: true, vendors: fallbackVendors };
  },

  async createVendor(eventId: string, vendorData: Partial<Vendor>): Promise<{ success: boolean; vendor: Vendor }> {
    try {
      const res = await api.post<{ success: boolean; vendor: Vendor }>(`/events/${eventId}/vendors`, vendorData);
      if (res?.success) return res;
    } catch {}

    const newVendor: Vendor = {
      id: `vnd_${Date.now()}`,
      name: vendorData.name || 'New Vendor',
      serviceCategory: vendorData.serviceCategory || 'Service',
      location: vendorData.location || 'Location',
      contactPerson: vendorData.contactPerson || 'Contact',
      phone: vendorData.phone || '+91 98000 00000',
      verificationStatus: vendorData.verificationStatus || 'verified',
      rating: 4.8,
      reviewCount: 12,
      avatarInitials: (vendorData.name || 'NV').slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { success: true, vendor: newVendor };
  },

  async getQuotes(eventId: string): Promise<{ success: boolean; quotes: VendorQuote[] }> {
    try {
      const res = await api.get<{ success: boolean; quotes: VendorQuote[] }>(`/events/${eventId}/vendor-quotes`);
      if (res?.success) return res;
    } catch {}

    return { success: true, quotes: fallbackQuotes };
  },

  async createQuote(eventId: string, quoteData: Partial<VendorQuote>): Promise<{ success: boolean; quote: VendorQuote }> {
    try {
      const res = await api.post<{ success: boolean; quote: VendorQuote }>(`/events/${eventId}/vendor-quotes`, quoteData);
      if (res?.success) return res;
    } catch {}

    const newQuote: VendorQuote = {
      id: `qte_${Date.now()}`,
      eventId,
      vendorId: quoteData.vendorId || 'vnd_heritage_decor',
      vendorName: quoteData.vendorName || 'Vendor Partner',
      category: quoteData.category || 'Decor',
      quotedAmount: quoteData.quotedAmount || 50000,
      quoteDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      bookingStatus: 'under_review',
      contractScope: quoteData.contractScope || ['Custom Scope Deliverables'],
      inclusions: ['Setup and teardown included'],
      paymentTerms: '50% advance / 50% wrap',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { success: true, quote: newQuote };
  },
};
