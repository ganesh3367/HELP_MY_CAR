export const MECHANICS = [
    {
        id: '1',
        name: 'Quick Fix Motors',
        distance: '1.2 km',
        rating: 4.8,
        estimatedCost: '$20 - $100',
        address: '123 Auto Lane, Metropolis',
        lat: 37.78825,
        lng: -122.4324,
        phone: '+15550123',
        specialties: ['Engine', 'Electrical'],
    },
    {
        id: '2',
        name: 'Elite Auto Care',
        distance: '2.5 km',
        rating: 4.5,
        estimatedCost: '$30 - $150',
        address: '456 Service Blvd, Metropolis',
        lat: 37.78925,
        lng: -122.4344,
        phone: '+15550456',
        specialties: ['Tyre', 'Alignment'],
    },
    {
        id: '3',
        name: 'Master Mechanics',
        distance: '3.8 km',
        rating: 4.9,
        estimatedCost: '$15 - $80',
        address: '789 Repair Rd, Metropolis',
        lat: 37.78725,
        lng: -122.4364,
        phone: '+15550789',
        specialties: ['Battery', 'Fuel'],
    },
];

export const TOWING_SERVICES = [
    {
        id: '1',
        type: 'Flatbed Tow Truck',
        costPerKm: '$2.50',
        availability: 'Available',
        phone: '+15551111',
        image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=200&auto=format&fit=crop',
    },
    {
        id: '2',
        type: 'Wheel-Lift Truck',
        costPerKm: '$1.80',
        availability: '15 mins',
        phone: '+15552222',
        image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=200&auto=format&fit=crop',
    },
    {
        id: '3',
        type: 'Heavy Duty Tow',
        costPerKm: '$5.00',
        availability: 'Available',
        phone: '+15553333',
        image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=200&auto=format&fit=crop',
    },
];

export const SERVICE_CATEGORIES = [
    { id: 'engine', title: 'Engine Issue', basePrice: 50 },
    { id: 'tyre', title: 'Tyre Puncture', basePrice: 15 },
    { id: 'battery', title: 'Battery Issue', basePrice: 30 },
    { id: 'fuel', title: 'Fuel Problem', basePrice: 20 },
];
