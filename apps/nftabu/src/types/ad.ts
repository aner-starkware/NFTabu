import { Apt } from './apt';

export type Ad = {
  id: number;
  info: {
    apt: Apt;
    is_sale: boolean;
    price: number;
    description?: string;
    publication_date: { seconds: number };
    entry_date: { seconds: number };
    phone?: string;
    registered?: boolean;
    picture_url?: string;
  };
};
