export type Apt = {
    id: number;
    info: {
      address: { town: string, street: string, number: number };
      owner: string;
      area: number;
      floor: number;
    };
  };
  