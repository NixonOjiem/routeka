
import { Ride, CommunityGroup } from './types';

export const INITIAL_RIDES: Ride[] = [
  {
    id: '1',
    driver: {
      id: 'd1',
      name: 'Sarah Chen',
      avatarUrl: 'https://picsum.photos/100/100?random=1',
      rating: 4.9,
      community: CommunityGroup.UNIVERSITY,
      verified: true
    },
    origin: '75 Liberty St, Toronto, ON',
    destination: '27 King\'s College Cir, Toronto, ON',
    date: new Date().toISOString().split('T')[0],
    time: '08:30 AM',
    seatsAvailable: 3,
    costPerSeat: 0,
    description: 'Driving to UofT campus for morning lectures. I have a spacious sedan. Coffee lovers welcome!',
    tags: ['Quiet', 'Mask Required']
  },
  {
    id: '2',
    driver: {
      id: 'd2',
      name: 'Marcus Rodriguez',
      avatarUrl: 'https://picsum.photos/100/100?random=2',
      rating: 4.7,
      community: CommunityGroup.CORPORATE_PARK,
      verified: true
    },
    origin: '65 Front St W, Toronto, ON',
    destination: '101 College St, Toronto, ON',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    seatsAvailable: 2,
    costPerSeat: 5,
    description: 'Daily commute from Union to MaRS tech hub. Splitting gas costs. I usually listen to podcasts.',
    tags: ['Podcasts', 'AC']
  },
  {
    id: '3',
    driver: {
      id: 'd3',
      name: 'Emily Blunt',
      avatarUrl: 'https://picsum.photos/100/100?random=3',
      rating: 5.0,
      community: CommunityGroup.NEIGHBORHOOD,
      verified: true
    },
    origin: '100 Main St W, Hamilton, ON',
    destination: '1280 Main St W, Hamilton, ON (McMaster)',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '08:15 AM',
    seatsAvailable: 3,
    costPerSeat: 4,
    description: 'Daily commute to McMaster University. Leaving from downtown Hamilton.',
    tags: ['Student Friendly', 'Music']
  }
];
