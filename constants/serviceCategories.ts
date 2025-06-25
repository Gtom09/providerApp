export const SERVICE_CATEGORIES = [
  {
    id: 'engineer-interior',
    name: 'Engineer / Interior',
    icon: '🏗️',
    description: 'Engineering and Interior Design Services',
    basePrice: 99,
    imageUrl: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'plumber',
    name: 'Plumber',
    icon: '🔧',
    description: 'Plumbing and Water Related Services',
    basePrice: 99,
    imageUrl: 'https://media.istockphoto.com/id/1516511531/photo/a-plumber-carefully-fixes-a-leak-in-a-sink-using-a-wrench.jpg?auto=compress&cs=tinysrgb&w=400',

  },
  {
    id: 'granite-tiles',
    name: 'Granite & Tiles Laying',
    icon: '🏠',
    description: 'Floor and Wall Tiling Services',
    basePrice: 99,
    imageUrl: 'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'painting-cleaning',
    name: 'Painting & Cleaning',
    icon: '🎨',
    description: 'Painting and Cleaning Services',
    basePrice: 99,
    imageUrl: 'https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'contact-building',
    name: 'Contact & Building',
    icon: '🏢',
    description: 'Construction and Building Services',
    basePrice: 99,
    imageUrl: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'labor',
    name: 'Labor',
    icon: '👷',
    description: 'General Labor Services',
    basePrice: 0, // Free for labor category
    imageUrl: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'mason-mastri',
    name: 'Mason / Mastri',
    icon: '🧱',
    description: 'Masonry and Construction Work',
    basePrice: 99,
    imageUrl: 'https://images.pexels.com/photos/5691654/pexels-photo-5691654.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'interiors-building',
    name: 'Interiors of the Building',
    icon: '🏠',
    description: 'Interior Building Services',
    basePrice: 99,
    imageUrl: 'https://images.pexels.com/photos/6474938/pexels-photo-6474938.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'stainless-steel',
    name: 'Stainless Steel M.S',
    icon: '⚙️',
    description: 'Metal Work and Steel Services',
    basePrice: 99,
    imageUrl: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export const getServiceById = (id: string) => {
  return SERVICE_CATEGORIES.find(service => service.id === id);
};