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
        costPerKm: '₹350',
        availability: 'Available',
        phone: '+91 98765 43210',
        image: 'https://images.unsplash.com/photo-1549420015-c27ae38308cf?q=80&w=600&auto=format&fit=crop', // Better flatbed truck
    },
    {
        id: '2',
        type: 'Wheel-Lift Tow',
        costPerKm: '₹250',
        availability: '15 mins',
        phone: '+91 98765 43211',
        image: 'https://images.unsplash.com/photo-1628172948655-333e6f98fcde?q=80&w=600&auto=format&fit=crop', // Better tow truck
    },
    {
        id: '3',
        type: 'Heavy Duty Towing',
        costPerKm: '₹800',
        availability: 'Available',
        phone: '+91 98765 43212',
        image: 'https://images.unsplash.com/photo-1510250917036-edfa0d463d1a?q=80&w=600&auto=format&fit=crop', // Heavy truck
    },
];

export const SERVICE_CATEGORIES = [
    { id: 'engine', title: 'Engine Issue', basePrice: 50 },
    { id: 'tyre', title: 'Tyre Puncture', basePrice: 15 },
    { id: 'battery', title: 'Battery Issue', basePrice: 30 },
    { id: 'fuel', title: 'Fuel Problem', basePrice: 20 },
];
