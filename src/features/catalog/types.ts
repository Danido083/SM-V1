// Tipos do domínio de Catálogo

export interface Product {
  id: string | number;
  name: string;
  img: string;
  tag?: string;
  description?: string;
  category: string;
}

export interface LeadData {
  name: string;
  whatsapp: string;
  city: string;
}
