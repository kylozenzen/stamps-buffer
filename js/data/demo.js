'use strict';

window.DEMO_CLIENTS = [
  {
    id: 'client_brew',
    name: 'Marisol Vega',
    company: 'Barrio Brew Co.',
    email: 'marisol@barriobrew.com',
    approvalNote: 'Please double-check hours, event dates, and beer names before approving.',
    approvalOwner: 'Marisol Vega',
    approvalCode: '4821',
    color: '#f95630',
    colorText: '#fff',
    initials: 'BB'
  },
  {
    id: 'client_market',
    name: 'Derek Okafor',
    company: 'Southside Night Market',
    email: 'derek@southsidenightmarket.com',
    approvalNote: 'Approvals usually focus on vendor count, location, and dates.',
    approvalOwner: 'Derek Okafor',
    approvalCode: '7394',
    color: '#22d3ee',
    colorText: '#18181b',
    initials: 'NM'
  },
  {
    id: 'client_salon',
    name: 'Priya Nair',
    company: 'Studio Nair',
    email: 'priya@studionair.co',
    approvalNote: 'Keep captions minimal and polished. Avoid overpromising launch dates.',
    approvalOwner: 'Priya Nair',
    approvalCode: '6158',
    color: '#a78bfa',
    colorText: '#18181b',
    initials: 'SN'
  }
];

window.DEMO_POSTS = [
  {
    id: 'post_1',
    bufferId: 'buf_demo_001',
    clientId: 'client_brew',
    title: 'Fall tap list launch',
    caption: 'Fall is here and so is our new tap list. 🍂 Six new pours, one limited barrel-aged stout, and the return of our fan-favorite horchata cream ale. Come find your new favorite. Open Tue–Sun from 3pm.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    platform: 'Instagram',
    status: 'stamped',
    token: 'STM-brew-001',
    createdAt: '2024-10-01',
    comments: [
      { from: 'creator', name: 'Jordan', av: 'J', text: 'Here is the tap list post — went warm and cozy. Let me know on caption length.', time: '1:50 PM' },
      { from: 'client',  name: 'Marisol', av: 'M', text: 'Love the vibe — approved!', time: '2:14 PM' }
    ]
  },
  {
    id: 'post_2',
    bufferId: 'buf_demo_002',
    clientId: 'client_brew',
    title: 'Behind the bar reel',
    caption: 'Our head brewer has been working on something special for the past 6 weeks. Sneak peek dropping Friday.',
    image: 'https://images.unsplash.com/photo-1436076863579-8e5b2f72f5d7?w=800&q=80',
    platform: 'Instagram Reels',
    status: 'review',
    token: 'STM-brew-002',
    createdAt: '2024-10-08',
    comments: [
      { from: 'creator', name: 'Jordan', av: 'J', text: 'Reel cover ready — video sent separately via Drive.', time: '10:30 AM' }
    ]
  },
  {
    id: 'post_3',
    bufferId: 'buf_demo_003',
    clientId: 'client_brew',
    title: 'Weekend hours story',
    caption: 'We are open this Saturday 12–10pm for the game. Come early, grab a pint, stay late.',
    image: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?w=800&q=80',
    platform: 'Instagram Story',
    status: 'changes',
    token: 'STM-brew-003',
    createdAt: '2024-10-10',
    feedback: 'Hours are wrong — we close at 11pm on Saturdays. Fix before posting!',
    comments: [
      { from: 'creator', name: 'Jordan', av: 'J', text: 'Quick story for the weekend — good to go?', time: '3:00 PM' },
      { from: 'client',  name: 'Marisol', av: 'M', text: 'Hours are wrong — we close at 11pm on Saturdays. Fix before posting!', time: '4:22 PM' }
    ]
  },
  {
    id: 'post_4',
    bufferId: 'buf_demo_004',
    clientId: 'client_market',
    title: 'October market announcement',
    caption: 'The October Night Market is back. 40+ local vendors, live music, food trucks, and the good people of this city. Oct 19–20 at Hemisfair Park. Free entry.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    platform: 'Instagram',
    status: 'review',
    token: 'STM-mkt-001',
    createdAt: '2024-10-09',
    comments: [
      { from: 'creator', name: 'Sam', av: 'S', text: 'Event announcement ready — went warm night market feel.', time: '9:00 AM' }
    ]
  },
  {
    id: 'post_5',
    bufferId: 'buf_demo_005',
    clientId: 'client_salon',
    title: 'Rebrand reveal teaser',
    caption: 'Something new is coming to Studio Nair. Stay tuned.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    platform: 'Instagram',
    status: 'draft',
    token: 'STM-salon-001',
    createdAt: '2024-10-11',
    comments: []
  },
  {
    id: 'post_6',
    bufferId: 'buf_demo_006',
    clientId: null,
    title: 'Unassigned draft',
    caption: 'Great content sitting in Buffer, not yet assigned to a client.',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    platform: 'Twitter/X',
    status: 'draft',
    token: 'STM-un-001',
    createdAt: '2024-10-12',
    comments: []
  }
];
