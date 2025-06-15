export const SERVICE_CATEGORIES = [
  {
    id: 'engineer-interior',
    name: 'Engineer / Interior',
    icon: '🏗️',
    description: 'Engineering and Interior Design Services',
    basePrice: 99,
  },
  {
    id: 'plumber',
    name: 'Plumber',
    icon: '🔧',
    description: 'Plumbing and Water Related Services',
    basePrice: 99,
  },
  {
    id: 'granite-tiles',
    name: 'Granite & Tiles Laying',
    icon: '🏠',
    description: 'Floor and Wall Tiling Services',
    basePrice: 99,
  },
  {
    id: 'painting-cleaning',
    name: 'Painting & Cleaning',
    icon: '🎨',
    description: 'Painting and Cleaning Services',
    basePrice: 99,
  },
  {
    id: 'contact-building',
    name: 'Contact & Building',
    icon: '🏢',
    description: 'Construction and Building Services',
    basePrice: 99,
  },
  {
    id: 'labor',
    name: 'Labor',
    icon: '👷',
    description: 'General Labor Services',
    basePrice: 0, // Free for labor category
  },
  {
    id: 'mason-mastri',
    name: 'Mason / Mastri',
    icon: '🧱',
    description: 'Masonry and Construction Work',
    basePrice: 99,
  },
  {
    id: 'interiors-building',
    name: 'Interiors of the Building',
    icon: '🏠',
    description: 'Interior Building Services',
    basePrice: 99,
  },
  {
    id: 'stainless-steel',
    name: 'Stainless Steel M.S',
    icon: '⚙️',
    description: 'Metal Work and Steel Services',
    basePrice: 99,
  },
];

export const getServiceById = (id: string) => {
  return SERVICE_CATEGORIES.find(service => service.id === id);
};