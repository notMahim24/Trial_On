export interface SizeChartRow {
  size: string;
  chest: string;
  waist: string;
  hips: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  video?: string;
  video2?: string;
  description: string;
  color?: string;
  size?: string;
  sizeChart?: SizeChartRow[];
  is_available?: boolean | number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
