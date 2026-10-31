import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  User,
  Event,
  BudgetCategory,
  Expense,
  Task,
  Vendor,
  VendorQuote,
  AIPlanVersion,
  Prediction,
} from '../models/types.ts';
import { hashPassword } from '../utils/security.ts';

export interface DatabaseSchema {
  users: User[];
  events: Event[];
  budgetCategories: BudgetCategory[];
  expenses: Expense[];
  tasks: Task[];
  vendors: Vendor[];
  vendorQuotes: VendorQuote[];
  aiPlans: AIPlanVersion[];
  predictions: Prediction[];
  scenarios: Array<{
    id: string;
    eventId: string;
    title: string;
    guestShift: number;
    decorTier: string;
    barPackage: string;
    simulatedOutlay: number;
    variance: number;
    createdAt: string;
  }>;
}

const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const BUNDLED_DB_FILE = path.resolve(process.cwd(), 'data', 'atelier_db.json');
const DB_FILE = isServerless ? path.join(os.tmpdir(), 'atelier_db.json') : BUNDLED_DB_FILE;

function getInitialSeedData(): DatabaseSchema {
  const defaultUser: User = {
    id: 'usr_priya_lead',
    name: 'Rutuja Jadhav',
    email: 'rutuja@atelier.com',
    role: 'Lead Planner',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD86wFMv7GznXchX3b4O0dO0Rfez-G3ls1BbhsDJ0csLCul8V7slfahg9diMslJ1IoVgS44Ez3ew_HFxaRBsRsXAra2Tfahx2dEi1psEBko4A9GOcglUSNHJkeWtIhe90bEwS4Pd0HEFlR_MQ6jWaLs6Tmg8gYFOpdYpoTVe6UTJ3SPEB_cF_LAzhIkZA1B4eeLHhgwBJ0G9JGPfwa3g7bfhVB94BhsEVkIMxGpgrMstBUC8ijg7jOxDw',
    passwordHash: hashPassword('atelier2025'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const flagshipEvent: Event = {
    id: 'evt_ananya_rohan',
    ownerUserId: defaultUser.id,
    name: "Ananya & Rohan's Royal Heritage Wedding",
    eventType: 'Royal Wedding Celebration',
    eventDate: '2025-12-14',
    location: 'Udaipur, Rajasthan',
    venueName: 'Jagmandir Island Palace, Lake Pichola',
    guestCount: 320,
    confirmedGuestCount: 285,
    budgetAmount: 2500000,
    currencyCode: 'INR',
    theme: 'Royal Marwar & Rajputana Florals',
    eventPreferences: {
      ambiance: 'Lakeside Candlelight & Acoustic Sufi',
      cateringStyle: 'Mewari Royal Thali & Artisanal Bar',
      decorCap: 750000,
      targetPax: 320,
    },
    status: 'in_progress',
    daysRemaining: 42,
    readinessScore: 84,
    code: 'ATELIER-2025-UDR',
    createdAt: '2025-03-12T00:00:00Z',
    updatedAt: new Date().toISOString(),
  };

  const otherEvents: Event[] = [
    {
      id: 'evt_dev_samaira',
      ownerUserId: defaultUser.id,
      name: "Dev & Samaira's Sangeet Gala",
      eventType: 'Sangeet & Cocktail',
      eventDate: '2025-11-28',
      location: 'Jaipur, Rajasthan',
      venueName: 'Rambagh Palace Lawn',
      guestCount: 220,
      confirmedGuestCount: 195,
      budgetAmount: 1800000,
      currencyCode: 'INR',
      theme: 'Jaipuri Mirrorwork & Emerald Twilight',
      eventPreferences: {},
      status: 'in_progress',
      daysRemaining: 26,
      readinessScore: 78,
      code: 'ATELIER-2025-JPR',
      createdAt: '2025-04-10T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt_vikram_radhika',
      ownerUserId: defaultUser.id,
      name: "Vikram & Radhika's Fort Imperial",
      eventType: 'Heritage Wedding',
      eventDate: '2026-01-18',
      location: 'Jodhpur, Rajasthan',
      venueName: 'Umaid Bhawan Courtyard',
      guestCount: 400,
      confirmedGuestCount: 310,
      budgetAmount: 3200000,
      currencyCode: 'INR',
      theme: 'Sandstone Gold & Velvet Indigo',
      eventPreferences: {},
      status: 'planning',
      daysRemaining: 77,
      readinessScore: 62,
      code: 'ATELIER-2026-JDH',
      createdAt: '2025-05-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt_aarav_meera',
      ownerUserId: defaultUser.id,
      name: "Aarav & Meera's Coastal Soirée",
      eventType: 'Destination Reception',
      eventDate: '2026-02-14',
      location: 'North Goa',
      venueName: 'Aguada Clifftop Pavilion',
      guestCount: 180,
      confirmedGuestCount: 140,
      budgetAmount: 1400000,
      currencyCode: 'INR',
      theme: 'Bohemian Botanicals & Sea Breeze',
      eventPreferences: {},
      status: 'planning',
      daysRemaining: 104,
      readinessScore: 50,
      code: 'ATELIER-2026-GOA',
      createdAt: '2025-06-15T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt_kabir_tara',
      ownerUserId: defaultUser.id,
      name: "Kabir & Tara's Engagement Soirée",
      eventType: 'Engagement & Dinner',
      eventDate: '2025-11-15',
      location: 'Delhi NCR',
      venueName: 'The Lodhi Glasshouse',
      guestCount: 150,
      confirmedGuestCount: 145,
      budgetAmount: 1200000,
      currencyCode: 'INR',
      theme: 'Champagne Flutes & Modern Ivory',
      eventPreferences: {},
      status: 'in_progress',
      daysRemaining: 13,
      readinessScore: 92,
      code: 'ATELIER-2025-DEL',
      createdAt: '2025-07-20T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt_aria_birthday',
      ownerUserId: defaultUser.id,
      name: "Aria's 30th Bohemian Sunset Birthday",
      eventType: 'Birthday Milestone Party',
      eventDate: '2025-11-20',
      location: 'Bandra West, Mumbai',
      venueName: 'The Glass Horizon Rooftop Terrace',
      guestCount: 75,
      confirmedGuestCount: 68,
      budgetAmount: 450000,
      currencyCode: 'INR',
      theme: 'Sunset Terracotta, Amber Glow & Velvet Vinyl',
      eventPreferences: {
        musicStyle: 'Live Vinyl & Indie Electronic',
        cocktailFocus: 'Botanical Gin & Clarified Citrus',
        cakeTier: '3-Tier Sculptural Lemon Raspberry',
      },
      status: 'in_progress',
      daysRemaining: 18,
      readinessScore: 88,
      code: 'ATELIER-2025-BOM',
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt_meadowbrook_festival',
      ownerUserId: defaultUser.id,
      name: 'Meadowbrook Cultural Harvest Festival',
      eventType: 'Community Festival & Fair',
      eventDate: '2025-12-06',
      location: 'Central Park Commons, Bengaluru',
      venueName: 'Community Amphitheater & South Lawn',
      guestCount: 450,
      confirmedGuestCount: 380,
      budgetAmount: 800000,
      currencyCode: 'INR',
      theme: 'Forest Evergreen, Sunlit Canvas & Local Artisans',
      eventPreferences: {
        ecoFocus: 'Certified Zero-Waste & Seedling Exchange',
        communityStalls: 30,
        musicActs: 6,
      },
      status: 'planning',
      daysRemaining: 34,
      readinessScore: 76,
      code: 'ATELIER-2025-BLR',
      createdAt: '2025-08-15T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
  ];

  const budgetCategories: BudgetCategory[] = [
    {
      id: 'cat_venue',
      eventId: flagshipEvent.id,
      categoryName: 'Venue & Lodging',
      plannedAmount: 600000,
      committedAmount: 600000,
      actualAmount: 600000,
      priority: 'high',
      status: 'paid_100',
      notes: 'The Oberoi Udaivilas · 42 suites',
      createdAt: '2025-03-15T00:00:00Z',
      updatedAt: '2025-04-18T00:00:00Z',
    },
    {
      id: 'cat_catering',
      eventId: flagshipEvent.id,
      categoryName: 'Catering & Hospitality',
      plannedAmount: 800000,
      committedAmount: 760000,
      actualAmount: 380000,
      priority: 'high',
      status: 'advance_50',
      notes: 'Marwar Gourmet Culinary • 4 meals',
      createdAt: '2025-03-15T00:00:00Z',
      updatedAt: '2025-04-09T00:00:00Z',
    },
    {
      id: 'cat_decor',
      eventId: flagshipEvent.id,
      categoryName: 'Decor & Floral Production',
      plannedAmount: 500000,
      committedAmount: 530000,
      actualAmount: 150000,
      priority: 'high',
      status: 'quoted',
      notes: 'Lotus Blossom Design Atelier / Royal Rajputana',
      createdAt: '2025-03-15T00:00:00Z',
      updatedAt: '2025-04-14T00:00:00Z',
    },
    {
      id: 'cat_photo',
      eventId: flagshipEvent.id,
      categoryName: 'Photography & Cinema',
      plannedAmount: 300000,
      committedAmount: 280000,
      actualAmount: 84000,
      priority: 'medium',
      status: 'booked',
      notes: 'Karan Kapoor Studios (3-Day Docu)',
      createdAt: '2025-03-15T00:00:00Z',
      updatedAt: '2025-03-25T00:00:00Z',
    },
    {
      id: 'cat_entertainment',
      eventId: flagshipEvent.id,
      categoryName: 'Entertainment & Sound',
      plannedAmount: 180000,
      committedAmount: 150000,
      actualAmount: 0,
      priority: 'medium',
      status: 'booked',
      notes: 'Sufi Ensemble & DJ Tejas Setup',
      createdAt: '2025-03-15T00:00:00Z',
      updatedAt: '2025-03-28T00:00:00Z',
    },
    {
      id: 'cat_invitations',
      eventId: flagshipEvent.id,
      categoryName: 'Invitations & Gifting',
      plannedAmount: 120000,
      committedAmount: 95000,
      actualAmount: 95000,
      priority: 'normal',
      status: 'in_progress',
      notes: 'Handmade Linen Stationery & Hampers',
      createdAt: '2025-03-15T00:00:00Z',
      updatedAt: '2025-04-02T00:00:00Z',
    },
  ];

  const expenses: Expense[] = [
    {
      id: 'exp_1',
      eventId: flagshipEvent.id,
      budgetCategoryId: 'cat_venue',
      categoryName: 'Venue',
      voucherCode: 'TRX-9942',
      description: 'Royal Suite Booking (50% Deposit)',
      vendorName: 'The Oberoi Udaivilas',
      estimatedAmount: 300000,
      actualAmount: 300000,
      expenseDate: '2025-04-18',
      paymentMethod: 'Bank NEFT',
      paymentStatus: 'settled',
      receiptRef: 'PDF-402',
      isReconciled: true,
      notes: 'Initial suite tranche settled',
      createdAt: '2025-04-18T10:00:00Z',
      updatedAt: '2025-04-18T10:00:00Z',
    },
    {
      id: 'exp_2',
      eventId: flagshipEvent.id,
      budgetCategoryId: 'cat_decor',
      categoryName: 'Decor',
      voucherCode: 'TRX-9881',
      description: 'Floral Stage Arch Rigging Retainer',
      vendorName: 'Lotus Blossom Design',
      estimatedAmount: 150000,
      actualAmount: 150000,
      expenseDate: '2025-04-14',
      paymentMethod: 'UPI Transfer',
      paymentStatus: 'drawdown_partial',
      receiptRef: 'REC-883',
      isReconciled: false,
      notes: 'Drawdown 1 of 3 for floral rigging',
      createdAt: '2025-04-14T11:30:00Z',
      updatedAt: '2025-04-14T11:30:00Z',
    },
    {
      id: 'exp_3',
      eventId: flagshipEvent.id,
      budgetCategoryId: 'cat_catering',
      categoryName: 'Catering',
      voucherCode: 'TRX-9750',
      description: 'Tasting Menu & Sommelier Retainer',
      vendorName: 'Marwar Gourmet Culinary',
      estimatedAmount: 380000,
      actualAmount: 380000,
      expenseDate: '2025-04-09',
      paymentMethod: 'RTGS Transfer',
      paymentStatus: 'settled',
      receiptRef: 'INV-210',
      isReconciled: true,
      notes: '50% advance for 4 wedding weekend banquets',
      createdAt: '2025-04-09T14:15:00Z',
      updatedAt: '2025-04-09T14:15:00Z',
    },
    {
      id: 'exp_4',
      eventId: flagshipEvent.id,
      budgetCategoryId: 'cat_invitations',
      categoryName: 'Stationery',
      voucherCode: 'TRX-9602',
      description: 'Calligraphy & Gold-foil Invitations',
      vendorName: 'The Letterpress Guild',
      estimatedAmount: 95000,
      actualAmount: 95000,
      expenseDate: '2025-04-02',
      paymentMethod: 'Cheque #49201',
      paymentStatus: 'settled',
      receiptRef: 'REC-119',
      isReconciled: true,
      notes: '320 bespoke linen foil suites printed',
      createdAt: '2025-04-02T09:00:00Z',
      updatedAt: '2025-04-02T09:00:00Z',
    },
    {
      id: 'exp_5',
      eventId: flagshipEvent.id,
      budgetCategoryId: 'cat_photo',
      categoryName: 'Photography',
      voucherCode: 'TRX-9540',
      description: 'Initial Booking Advance: The Vintage Frame Studio',
      vendorName: 'The Vintage Frame Studio',
      estimatedAmount: 84000,
      actualAmount: 84000,
      expenseDate: '2025-03-28',
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'settled',
      receiptRef: 'REC-092',
      isReconciled: true,
      notes: '30% booking retainer cleared Oct 28',
      createdAt: '2025-03-28T16:00:00Z',
      updatedAt: '2025-03-28T16:00:00Z',
    },
  ];

  const tasks: Task[] = [
    {
      id: 'tsk_1',
      eventId: flagshipEvent.id,
      title: 'Finalize Sangeet Choreographer contract & advance deposit',
      description: 'Assigned to: Rutuja Jadhav · Sangeet Gala · Advance sum: ₹75,000',
      dueDate: '2025-11-04',
      priority: 'high',
      status: 'pending',
      assignedTo: 'Rutuja Jadhav',
      dueLabel: 'Due in 2 days',
      category: 'Entertainment',
      createdAt: '2025-10-20T00:00:00Z',
      updatedAt: '2025-10-20T00:00:00Z',
    },
    {
      id: 'tsk_2',
      eventId: flagshipEvent.id,
      title: 'Review tasting menu revision with Royal Rajputana Caterers',
      description: 'Add 3 bespoke vegan dessert options & artisanal mocktail bar blueprint',
      dueDate: '2025-11-06',
      priority: 'medium',
      status: 'pending',
      assignedTo: 'Rutuja Jadhav',
      dueLabel: 'Due in 4 days',
      category: 'Catering',
      createdAt: '2025-10-20T00:00:00Z',
      updatedAt: '2025-10-20T00:00:00Z',
    },
    {
      id: 'tsk_3',
      eventId: flagshipEvent.id,
      title: 'Confirm floral garland procurement counts with Udaipur Mandi vendors',
      description: 'Marigold, Mogra & White Lotus shipments timed for morning Pooja',
      dueDate: '2025-11-08',
      priority: 'normal',
      status: 'pending',
      assignedTo: 'Vikramaditya Singh',
      dueLabel: 'Due in 6 days',
      category: 'Decor',
      createdAt: '2025-10-21T00:00:00Z',
      updatedAt: '2025-10-21T00:00:00Z',
    },
    {
      id: 'tsk_4',
      eventId: flagshipEvent.id,
      title: 'Send digital RSVP reminders to 35 overseas guests',
      description: 'Automated custom email folio with visa assistance guidelines attached',
      dueDate: '2025-11-10',
      priority: 'routine',
      status: 'pending',
      assignedTo: 'Rutuja Jadhav',
      dueLabel: 'In 1 week',
      category: 'Guest Relations',
      createdAt: '2025-10-22T00:00:00Z',
      updatedAt: '2025-10-22T00:00:00Z',
    },
    {
      id: 'tsk_5',
      eventId: flagshipEvent.id,
      title: 'Mandap 3D Scenography Approval & Lighting Layout',
      description: 'Central floating stage design approved by bride & groom',
      dueDate: '2025-10-15',
      priority: 'high',
      status: 'completed',
      assignedTo: 'Rutuja Jadhav',
      dueLabel: 'Completed Oct 15',
      category: 'Decor',
      createdAt: '2025-10-01T00:00:00Z',
      updatedAt: '2025-10-15T00:00:00Z',
    },
    {
      id: 'tsk_6',
      eventId: flagshipEvent.id,
      title: 'Secure Lake Pichola Jetty Boat Slips Permit',
      description: 'Municipal lake transport licenses for evening guest shuttles',
      dueDate: '2025-10-18',
      priority: 'medium',
      status: 'completed',
      assignedTo: 'Local Concierge',
      dueLabel: 'Completed Oct 18',
      category: 'Logistics',
      createdAt: '2025-10-05T00:00:00Z',
      updatedAt: '2025-10-18T00:00:00Z',
    },
  ];

  const vendors: Vendor[] = [
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
    {
      id: 'vnd_shringar_bridal',
      name: 'Shringar Bridal Styling',
      serviceCategory: 'Bridal & Groom Couture',
      location: 'Saheli Nagar, Udaipur',
      contactPerson: 'Meera Kapoor',
      phone: '+91 98980 11223',
      verificationStatus: 'verified',
      rating: 4.8,
      reviewCount: 31,
      avatarInitials: 'SB',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBx7Ukm-cdmiDbzqtT6JcT3lJEl-qYhKlEQWb78_pVkfDo7mxTxoh7IroA-lg8F2yY90GA1XM9GBaoT-0Ar7jSd1v8v9xsob_NCRU8myMSmSeOT64lGOJmBinn1Dd-YgFrhZt30Bqlf5Jxff3eJoiz6KnFp7yrkdrZTXlBQmnsB6G_ZPhxD-5DPVtvY3pb9mEssXr5M6KVDsqxoyqOFjTxxwXXfq2qCikZNsyjjINdqvoYGLaPqaaVTAA',
      createdAt: '2025-02-01T00:00:00Z',
      updatedAt: '2025-02-01T00:00:00Z',
    },
  ];

  const vendorQuotes: VendorQuote[] = [
    {
      id: 'qte_1',
      eventId: flagshipEvent.id,
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
      inclusions: [
        'Brassware provided',
        'Crew standby (16h)',
        'Transportation within Udaipur',
      ],
      exclusions: ['Imported Dutch Orchids (Optional +₹90k)'],
      paymentTerms: '25% Advance / 50% Mid / 25% Wrap',
      notes:
        'Studio Co-Pilot Recommendation: Delivers authentic Marwari craftsmanship at ₹80,000 lower net expenditure with 98% on-time track record.',
      createdAt: '2025-10-18T00:00:00Z',
      updatedAt: '2025-10-18T00:00:00Z',
    },
    {
      id: 'qte_2',
      eventId: flagshipEvent.id,
      vendorId: 'vnd_heritage_decor',
      vendorName: 'Virasat Floral & Decor',
      category: 'Decor & Scenography',
      quotedAmount: 610000,
      quoteDate: '2025-10-14',
      validUntil: '2025-11-14',
      bookingStatus: 'under_review',
      isAiRecommended: false,
      contractScope: [
        '25ft Imported Flower Mandap (Ecuador Roses, High-density)',
        'Laser Light & Kinetic Ceiling Rigging (Sangeet Night)',
        '3 Bespoke Stage Setups (Mehendi, Haldi, Varmala)',
        'Dedicated Floral Artisan Crew on Standby (12h)',
      ],
      inclusions: ['Kinetic light truss', 'Floral maintenance crew'],
      exclusions: ['Brass Antique Urli Ware (Self-sourced)'],
      paymentTerms: '40% Advance / 40% Setup / 20% Post (+18% GST)',
      notes: 'Luxury contemporary styling with imported rose elements.',
      createdAt: '2025-10-14T00:00:00Z',
      updatedAt: '2025-10-14T00:00:00Z',
    },
    {
      id: 'qte_3',
      eventId: flagshipEvent.id,
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
      id: 'qte_4',
      eventId: flagshipEvent.id,
      vendorId: 'vnd_svaram_ensemble',
      vendorName: 'Svaram Live Ensemble',
      category: 'Sangeet & Sufi Night',
      quotedAmount: 150000,
      quoteDate: '2025-04-05',
      validUntil: '2025-11-30',
      bookingStatus: 'deposit_pending',
      contractScope: [
        '7-Piece Acoustic Manganiyar & Sufi Ensemble',
        '3.5 Hours live performance set on Sangeet night',
        'Sound engineering & dedicated acoustic monitors',
      ],
      inclusions: ['Instruments & Microphones', 'Sound Technician'],
      paymentTerms: '50% Advance / 50% Post-performance',
      notes: 'Awaiting technical rider approval before deposit release.',
      createdAt: '2025-04-05T00:00:00Z',
      updatedAt: '2025-04-05T00:00:00Z',
    },
    {
      id: 'qte_5',
      eventId: flagshipEvent.id,
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

  const aiPlans: AIPlanVersion[] = [
    {
      id: 'plan_v1_3',
      eventId: flagshipEvent.id,
      versionNumber: 'v1.3',
      versionTitle: 'Current • Floral Optimized',
      curationConcept: 'Royal Lakeside Mirage',
      inputPrompt:
        'Plan a traditional Sangeet & Reception evening for 320 guests at an outdoor lakeside pavilion. Prioritize authentic Rajasthani catering, warm ambient brass lanterns, acoustic Sufi ensemble, and keep total decor strictly under ₹7,50,000.',
      planJson: {
        aestheticFeasibilityScore: 98,
        colorPalette: [
          {
            name: 'Deep Plum',
            hex: '#512C3D',
            usage: 'Velvet Drapes & Stage Backdrop',
          },
          {
            name: 'Mewari Terracotta',
            hex: '#FE9D7F',
            usage: 'Marigold Carpets & Urli Pots',
          },
          {
            name: 'Aged Champagne',
            hex: '#E8E1DC',
            usage: 'Linen Tables & Chiffon Canopies',
          },
          {
            name: 'Eucalyptus Sage',
            hex: '#BDCBAC',
            usage: 'Foliage Runners & Lakeside Edge',
          },
        ],
        spatialBlueprint: {
          headline: 'Central Floating Stage & Tuberose Chandeliers',
          description:
            'A bespoke floating stage overlooking Lake Pichola with cascading 2700K fairy lights and authentic hand-beaten brass urlis.',
          lightingArchitecture:
            'Continuous 2700K amber canopy overhead with 140 clustered brass floor lamps along the promenade. Zero synthetic floodlights; soft directional wash onto historic stone pillars.',
          olfactoryTactileSignature:
            'Subtle vaporized rosewater misting along arrival stairs, handwoven raw tussar silk table runners, and pure beeswax candle scent profiles paired with fresh sweet rajnigandha.',
          decibelRegulations:
            'Outdoor lakeside sound cutoff set for 22:00 IST in accordance with Udaipur Lakefront Preservation Regulations. Acoustic lounge indoor transition certified.',
        },
        budgetRebalance: {
          totalBudget: 2500000,
          catering: {
            amount: 850000,
            percentage: 34.0,
            note: '320 Covers • Live Mewari Thali + Mocktail Bar',
          },
          decor: {
            amount: 720000,
            percentage: 28.8,
            note: 'Lakeside Pavilion • Brass Diyas & Local Flora',
            belowCapSavings: 30000,
          },
          venueSound: {
            amount: 480000,
            percentage: 19.2,
            note: 'Heritage Pier Rental + Specialized Sufi Audio Rig',
          },
          artistsChoreography: {
            amount: 250000,
            percentage: 10.0,
            note: 'Acoustic Sufi Ensemble + Rajasthani Welcome Dholis',
          },
          contingencyReserve: {
            amount: 200000,
            percentage: 8.0,
            note: 'Lakeside sound licensing & weather canopy reserve',
          },
          arbitrageInsight:
            'By substituting imported white orchids with indigenous wild Rajnigandha and seasonal Genda blossoms from Pushkar wholesale mandis, the studio unlocked ₹1,40,000 in immediate floral savings. This surplus was automatically rechanneled to the dual acoustic monitor system required for the lakeside open-air Sufi performance.',
        },
        itinerary: [
          {
            time: '17:30',
            title: 'Arrival & Shehnai Prelude',
            locationTag: 'Entrance Pier',
            description:
              'Guests arrive via illuminated boat transfer. Traditional Mewari Shehnai & Nagada welcome at the stone jetty, accompanied by gentle fresh rose petal shower and fragrant sandalwood chandan tilak.',
            colorDot: '#381727',
          },
          {
            time: '18:45',
            title: 'Twilight Sundowner & Acoustic Sufi Set',
            locationTag: 'Lakeside Lawn',
            description:
              'Ambient brass hurricane lanterns spark as dusk settles. Nizami acoustic ensemble commences 45-minute semi-classical Sufi set. Signature royal saffron-infused cocktails and live chaat counters open.',
            colorDot: '#944831',
          },
          {
            time: '20:15',
            title: 'Grand Couple Entry & Cold Pyro Cascade',
            locationTag: 'Promenade Stage',
            description:
              'High-tempo live dhol procession escorting Ananya and Rohan onto the central floating dais. 6-point synchronized cold pyro sparklers timed to the chorus drop with floral explosion.',
            colorDot: '#512c3d',
          },
          {
            time: '21:00',
            title: 'Royal Mewari Banquet & Family Performances',
            locationTag: 'Grand Pavilion',
            description:
              'Full copper-service royal buffet opens. 8 scheduled choreographed family dance performances on stage interspersed with speech toasts.',
            colorDot: '#1a2510',
          },
          {
            time: '23:30',
            title: 'Intimate After-Hours Heritage Lounge',
            locationTag: 'Courtyard Bar',
            description:
              'Sound levels modulated to heritage municipal norms. Unplugged indie-acoustic transition, hot dessert stations (Ghewar & Malpua), and lounge seating around floating fire bowls.',
            colorDot: '#817478',
          },
        ],
        culinaryAteliers: [
          {
            title: 'Royal Bajra & Dal Baati Churma Ateliers',
            categoryTag: 'Live Artisanal Stations',
            description:
              'Live slow-cooked Daal Baati baked over coal embers in brass sigris with five distinct artisanal churned ghee churmas (Rose, Almond, Cardamom, Dry Fig, Regular).',
          },
          {
            title: 'Botanical Saffron & Vetiver Infusions',
            categoryTag: 'Artisanal Bar Chemistry',
            description:
              'Low-ABV and zero-proof handcrafted elixirs featuring smoked Udaipur royal rose essence, spiced dried plum reductions, and clarified citrus tonics served in hand-cut glass tumblers.',
          },
        ],
      },
      isDevelopmentFallback: false,
      createdAt: '2025-10-22T14:30:00Z',
    },
    {
      id: 'plan_v1_2',
      eventId: flagshipEvent.id,
      versionNumber: 'v1.2',
      versionTitle: 'Pre-Rebalance',
      curationConcept: 'Royal Lakeside Mirage (Draft 2)',
      inputPrompt:
        'Initial setup with imported floral mandap elements and 3 stage arrangements.',
      planJson: {
        aestheticFeasibilityScore: 89,
        colorPalette: [
          { name: 'Deep Plum', hex: '#512C3D', usage: 'Drapes' },
          { name: 'Gold', hex: '#D4AF37', usage: 'Accents' },
        ],
        spatialBlueprint: {
          headline: 'Initial High-Expense Draft',
          description: 'Exceeded cap by ₹80,000 before floral substitution.',
          lightingArchitecture: 'Mixed halogen & lanterns',
          olfactoryTactileSignature: 'Rose water',
          decibelRegulations: 'Standard 22:00 cutoff',
        },
        budgetRebalance: {
          totalBudget: 2500000,
          catering: { amount: 800000, percentage: 32, note: 'Standard' },
          decor: {
            amount: 830000,
            percentage: 33.2,
            note: 'Exceeded cap by ₹80,000',
            belowCapSavings: -80000,
          },
          venueSound: { amount: 470000, percentage: 18.8, note: 'Standard' },
          artistsChoreography: {
            amount: 250000,
            percentage: 10,
            note: 'Standard',
          },
          contingencyReserve: {
            amount: 150000,
            percentage: 6,
            note: 'Restricted',
          },
          arbitrageInsight: 'Unhedged imported flora.',
        },
        itinerary: [],
        culinaryAteliers: [],
      },
      isDevelopmentFallback: false,
      createdAt: '2025-10-21T11:00:00Z',
    },
    {
      id: 'plan_v1_0',
      eventId: flagshipEvent.id,
      versionNumber: 'v1.0',
      versionTitle: 'Initial Prompt',
      curationConcept: 'Baseline Concept Draft',
      inputPrompt: 'Baseline draft for Ananya and Rohan lakeside wedding.',
      planJson: {
        aestheticFeasibilityScore: 82,
        colorPalette: [],
        spatialBlueprint: {
          headline: 'Raw baseline draft',
          description: 'Preliminary venue concept.',
          lightingArchitecture: 'Basic setup',
          olfactoryTactileSignature: 'Standard',
          decibelRegulations: '22:00 cutoff',
        },
        budgetRebalance: {
          totalBudget: 2500000,
          catering: { amount: 800000, percentage: 32, note: 'Standard' },
          decor: {
            amount: 750000,
            percentage: 30,
            note: 'At cap',
            belowCapSavings: 0,
          },
          venueSound: { amount: 450000, percentage: 18, note: 'Standard' },
          artistsChoreography: {
            amount: 250000,
            percentage: 10,
            note: 'Standard',
          },
          contingencyReserve: {
            amount: 250000,
            percentage: 10,
            note: 'Standard',
          },
          arbitrageInsight: 'Initial baseline allocations.',
        },
        itinerary: [],
        culinaryAteliers: [],
      },
      isDevelopmentFallback: false,
      createdAt: '2025-10-18T09:00:00Z',
    },
  ];

  const predictions: Prediction[] = [
    {
      id: 'pred_latest',
      eventId: flagshipEvent.id,
      predictionType: 'cost_forecast',
      predictedValue: 2415000,
      lowerEstimate: 2380000,
      upperEstimate: 2470000,
      riskProbability: 0.06,
      modelVersion: 'AI Predictive Model v2.4',
      confidenceScore: 0.94,
      featureSnapshot: {
        guestCount: 320,
        confirmedPax: 285,
        daysRemaining: 42,
        committedPct: 67.2,
        historicalBenchmarkWeddings: 120,
        region: 'Rajasthan & Delhi NCR',
      },
      explanation:
        'Automated analysis cross-referenced against 120+ atelier weddings in Rajasthan & Delhi NCR indicates low overall risk with high probability of ₹85,000 (3.4%) net surplus under approved baseline budget.',
      primaryVariable: {
        title: 'Venue & Lodging Stability',
        clause: 'Fixed Price Clause',
        status: 'Locked',
        description:
          'Committed hotel master agreements carry zero peak-rate volatility. Catering guarantees locked at 320 plates.',
      },
      watchlistItems: [
        {
          title: 'Beverage & Spirits Consumption',
          badge: 'Volatile',
          description:
            'Current forecast models 2.4 drinks/guest. A ±10% shift in attendance (±32 guests) introduces an unhedged +₹45,000 variance.',
          simulatedDeviation: '+1.8% of budget',
        },
        {
          title: 'Guest Attendance Velocity',
          badge: '91% Turnout Projected',
          description:
            'High velocity of confirmations and regional flight records into Maharana Pratap Airport. Recommendation: Set catering buffer to +25 plates instead of +40 to save approx. ₹42,000.',
          simulatedDeviation: '-₹42,000 potential saving',
        },
        {
          title: 'Logistics Surge Rate Alert',
          badge: 'Caution',
          description:
            'Peak winter tourist season in Udaipur creates potential 15–20% surge rate on luxury passenger vans and lakeside motor boats. Action: Lock transport vendor before Nov 15.',
          simulatedDeviation: '+15-20% transport surge',
        },
      ],
      actionPlan: {
        title: 'Execute Returnable Stock Deal',
        description:
          'Contract premium single-malts & champagne through verified distributor with a 100% buyback clause on unopened sealed crates.',
        potentialSavings: 'Saves ~₹38,000 risk',
        actionLabel: 'Apply Clause',
      },
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    users: [defaultUser],
    events: [flagshipEvent, ...otherEvents],
    budgetCategories,
    expenses,
    tasks,
    vendors,
    vendorQuotes,
    aiPlans,
    predictions,
    scenarios: [
      {
        id: 'scn_1',
        eventId: flagshipEvent.id,
        title: 'Couture +15 Guests Baseline',
        guestShift: 15,
        decorTier: 'couture',
        barPackage: 'baseline',
        simulatedOutlay: 2437500,
        variance: 22500,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

class Database {
  private data: DatabaseSchema;
  private initialized = false;

  constructor() {
    this.data = getInitialSeedData();
    this.init();
  }

  private init() {
    try {
      if (isServerless && !fs.existsSync(DB_FILE) && fs.existsSync(BUNDLED_DB_FILE)) {
        try {
          const bundledRaw = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
          fs.writeFileSync(DB_FILE, bundledRaw, 'utf-8');
        } catch {}
      }

      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        try {
          fs.mkdirSync(dataDir, { recursive: true });
        } catch {}
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.events && parsed.users) {
          this.data = parsed;
          // Merge any newly introduced seed events that aren't in this.data.events yet
          const initial = getInitialSeedData();
          for (const ev of initial.events) {
            if (!this.data.events.some((e) => e.id === ev.id)) {
              this.data.events.push(ev);
            }
          }
          // Ensure default seed user has passwordHash if loaded from older JSON
          const userLead = this.data.users.find((u) => u.id === 'usr_priya_lead' || u.email === 'rutuja@atelier.com' || u.email === 'priya@atelier.com');
          if (userLead && !userLead.passwordHash) {
            userLead.passwordHash = hashPassword('atelier2025');
          }
          this.persist();
          this.initialized = true;
          return;
        }
      }

      // First time save
      this.persist();
      this.initialized = true;
    } catch (err) {
      console.warn('Database persistence init failed, running in-memory:', err);
      this.initialized = true;
    }
  }

  private writeQueue: Promise<void> = Promise.resolve();

  /**
   * Persists database state atomically using temporary file + atomic rename
   * and serialized write queue to prevent race conditions during concurrent requests.
   */
  public async persistAtomic(): Promise<void> {
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const tempFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`;
    const payload = JSON.stringify(this.data, null, 2);

    this.writeQueue = this.writeQueue.then(async () => {
      try {
        await fs.promises.writeFile(tempFile, payload, 'utf-8');
        try {
          await fs.promises.rename(tempFile, DB_FILE);
        } catch {
          await fs.promises.copyFile(tempFile, DB_FILE);
          await fs.promises.unlink(tempFile);
        }
      } catch (err) {
        try {
          if (fs.existsSync(tempFile)) await fs.promises.unlink(tempFile);
        } catch {}
      }
    });

    return this.writeQueue;
  }

  private persist() {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const tempFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      try {
        fs.renameSync(tempFile, DB_FILE);
      } catch {
        fs.copyFileSync(tempFile, DB_FILE);
        try {
          fs.unlinkSync(tempFile);
        } catch {}
      }
    } catch {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (innerErr) {
        console.error('Fatal persistence write error:', innerErr);
      }
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // User operations
  public getUser(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  public createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  // Event operations
  public getEvents(userId?: string): Event[] {
    if (userId) {
      return this.data.events.filter((e) => e.ownerUserId === userId);
    }
    return this.data.events;
  }

  public getEvent(id: string): Event | undefined {
    return this.data.events.find((e) => e.id === id);
  }

  public createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event {
    const newEvent: Event = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.events.push(newEvent);

    // Also scaffold default categories for this event
    const defaultCategories = [
      { name: 'Venue & Lodging', plannedPct: 0.28 },
      { name: 'Catering & Hospitality', plannedPct: 0.32 },
      { name: 'Decor & Production', plannedPct: 0.22 },
      { name: 'Photography & Cinema', plannedPct: 0.10 },
      { name: 'Entertainment & Sound', plannedPct: 0.05 },
      { name: 'Invitations & Gifting', plannedPct: 0.03 },
    ];

    defaultCategories.forEach((cat) => {
      this.data.budgetCategories.push({
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        eventId: newEvent.id,
        categoryName: cat.name,
        plannedAmount: Math.round(newEvent.budgetAmount * cat.plannedPct),
        committedAmount: 0,
        actualAmount: 0,
        priority: 'high',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    this.persist();
    return newEvent;
  }

  public updateEvent(id: string, updates: Partial<Event>): Event | undefined {
    const idx = this.data.events.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    // Strip immutable identity and ownership fields to prevent mass assignment
    const { id: _ignoredId, ownerUserId: _ignoredOwner, createdAt: _ignoredCreated, ...safeUpdates } = updates;
    this.data.events[idx] = {
      ...this.data.events[idx],
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.events[idx];
  }

  public deleteEvent(id: string): boolean {
    const idx = this.data.events.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    this.data.events.splice(idx, 1);
    // Non-destructive cleanup of associated records if needed
    this.data.budgetCategories = this.data.budgetCategories.filter(
      (b) => b.eventId !== id
    );
    this.data.expenses = this.data.expenses.filter((x) => x.eventId !== id);
    this.data.tasks = this.data.tasks.filter((t) => t.eventId !== id);
    this.persist();
    return true;
  }

  // Budget Category operations
  public getBudgetCategories(eventId: string): BudgetCategory[] {
    return this.data.budgetCategories.filter((b) => b.eventId === eventId);
  }

  public setBudgetCategories(
    eventId: string,
    categories: Array<Omit<BudgetCategory, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>>
  ): BudgetCategory[] {
    this.data.budgetCategories = this.data.budgetCategories.filter(
      (b) => b.eventId !== eventId
    );
    const newCats = categories.map((cat) => ({
      ...cat,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    this.data.budgetCategories.push(...newCats);
    this.persist();
    return newCats;
  }

  // Expense operations
  public getExpenses(eventId: string): Expense[] {
    return this.data.expenses.filter((e) => e.eventId === eventId);
  }

  public createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense {
    const newExpense: Expense = {
      ...expense,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.expenses.push(newExpense);

    // Update committed / actual in the category
    const cat = this.data.budgetCategories.find(
      (c) => c.id === expense.budgetCategoryId
    );
    if (cat) {
      cat.actualAmount += expense.actualAmount;
      cat.updatedAt = new Date().toISOString();
    }

    this.persist();
    return newExpense;
  }

  public updateExpense(id: string, updates: Partial<Expense>): Expense | undefined {
    const idx = this.data.expenses.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    const { id: _ignoredId, eventId: _ignoredEvent, createdAt: _ignoredCreated, ...safeUpdates } = updates;
    this.data.expenses[idx] = {
      ...this.data.expenses[idx],
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.expenses[idx];
  }

  public deleteExpense(id: string): boolean {
    const idx = this.data.expenses.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    this.data.expenses.splice(idx, 1);
    this.persist();
    return true;
  }

  // Task operations
  public getTasks(eventId: string): Task[] {
    return this.data.tasks.filter((t) => t.eventId === eventId);
  }

  public createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...task,
      id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.tasks.push(newTask);
    this.persist();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    const { id: _ignoredId, eventId: _ignoredEvent, createdAt: _ignoredCreated, ...safeUpdates } = updates;
    this.data.tasks[idx] = {
      ...this.data.tasks[idx],
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.tasks[idx];
  }

  public deleteTask(id: string): boolean {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.data.tasks.splice(idx, 1);
    this.persist();
    return true;
  }

  // Vendor operations
  public getVendors(): Vendor[] {
    return this.data.vendors;
  }

  public getVendor(id: string): Vendor | undefined {
    return this.data.vendors.find((v) => v.id === id);
  }

  public createVendor(vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Vendor {
    const newVendor: Vendor = {
      ...vendor,
      id: `vnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.vendors.push(newVendor);
    this.persist();
    return newVendor;
  }

  public updateVendor(id: string, updates: Partial<Vendor>): Vendor | undefined {
    const idx = this.data.vendors.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;
    this.data.vendors[idx] = {
      ...this.data.vendors[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.vendors[idx];
  }

  // Vendor Quotes
  public getVendorQuotes(eventId: string): VendorQuote[] {
    return this.data.vendorQuotes.filter((q) => q.eventId === eventId);
  }

  public createVendorQuote(
    quote: Omit<VendorQuote, 'id' | 'createdAt' | 'updatedAt'>
  ): VendorQuote {
    const newQuote: VendorQuote = {
      ...quote,
      id: `qte_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.vendorQuotes.push(newQuote);
    this.persist();
    return newQuote;
  }

  // AI Plans
  public getAIPlans(eventId: string): AIPlanVersion[] {
    return this.data.aiPlans
      .filter((p) => p.eventId === eventId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  public saveAIPlan(plan: Omit<AIPlanVersion, 'id' | 'createdAt'>): AIPlanVersion {
    const newPlan: AIPlanVersion = {
      ...plan,
      id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.aiPlans.unshift(newPlan);
    this.persist();
    return newPlan;
  }

  // Predictions
  public getLatestPrediction(eventId: string): Prediction | undefined {
    return this.data.predictions.find((p) => p.eventId === eventId);
  }

  public savePrediction(prediction: Omit<Prediction, 'id' | 'createdAt'>): Prediction {
    const newPred: Prediction = {
      ...prediction,
      id: `pred_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    // Replace latest
    this.data.predictions = this.data.predictions.filter(
      (p) => p.eventId !== prediction.eventId
    );
    this.data.predictions.push(newPred);
    this.persist();
    return newPred;
  }

  // Scenarios
  public saveScenario(scenario: {
    eventId: string;
    title: string;
    guestShift: number;
    decorTier: string;
    barPackage: string;
    simulatedOutlay: number;
    variance: number;
  }) {
    const item = {
      ...scenario,
      id: `scn_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.scenarios.push(item);
    this.persist();
    return item;
  }

  public getScenarios(eventId: string) {
    return this.data.scenarios.filter((s) => s.eventId === eventId);
  }

  public applyAIPlanToEvent(eventId: string, planId: string): { success: boolean; event: Event; categoriesUpdated: number; tasksAdded: number } {
    const event = this.getEvent(eventId);
    if (!event) throw new Error('Event not found');

    const plan = this.data.aiPlans.find((p) => p.id === planId && p.eventId === eventId);
    if (!plan) throw new Error('Plan not found');

    // 1. Update event details
    event.theme = plan.curationConcept || event.theme;
    event.readinessScore = Math.max(event.readinessScore, 92);
    event.updatedAt = new Date().toISOString();

    let categoriesUpdated = 0;
    // 2. If categories exist in planJson.budgetRebalance.categories, update budget categories
    if (plan.planJson?.budgetRebalance?.categories && plan.planJson.budgetRebalance.categories.length > 0) {
      // Retain expenses, but set up new budget categories
      this.data.budgetCategories = this.data.budgetCategories.filter((c) => c.eventId !== eventId);
      for (const cat of plan.planJson.budgetRebalance.categories) {
        this.data.budgetCategories.push({
          id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          eventId,
          categoryName: cat.name,
          plannedAmount: cat.amount,
          committedAmount: 0,
          actualAmount: 0,
          priority: ['high', 'medium', 'normal', 'low'].includes(cat.priority as string)
            ? (cat.priority as 'high' | 'medium' | 'normal' | 'low')
            : 'medium',
          status: 'pending',
          notes: cat.note,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        categoriesUpdated++;
      }
    }

    let tasksAdded = 0;
    // 3. Add milestone tasks from milestoneTimeline
    if (plan.planJson?.milestoneTimeline && plan.planJson.milestoneTimeline.length > 0) {
      for (const m of plan.planJson.milestoneTimeline) {
        this.data.tasks.push({
          id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          eventId,
          title: m.milestone,
          description: m.description,
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          priority: ['high', 'medium', 'normal', 'routine'].includes(m.priority as string)
            ? (m.priority as 'high' | 'medium' | 'normal' | 'routine')
            : 'medium',
          status: 'pending',
          assignedTo: 'Lead Planner',
          dueLabel: m.timeframe,
          category: 'AI Milestone',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        tasksAdded++;
      }
    }

    // 4. Add vendor procurement tasks from vendorChecklist
    if (plan.planJson?.vendorChecklist && plan.planJson.vendorChecklist.length > 0) {
      for (const v of plan.planJson.vendorChecklist) {
        this.data.tasks.push({
          id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          eventId,
          title: `Procure ${v.roleTitle} (${v.category})`,
          description: `Deliverables: ${v.keyDeliverables.join(', ')}. Target allocation: ₹${v.estimatedAllocation.toLocaleString('en-IN')}`,
          dueDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
          priority: v.status === 'must_hire' ? 'high' : 'medium',
          status: 'pending',
          assignedTo: 'Procurement Lead',
          dueLabel: v.bookingWindow,
          category: 'Vendor Sourcing',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        tasksAdded++;
      }
    }

    this.persist();
    return { success: true, event, categoriesUpdated, tasksAdded };
  }
}

export const db = new Database();
