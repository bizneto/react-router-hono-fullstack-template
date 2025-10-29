export type Product = {
  id: string;
  name: string;
  capacity: number;
  price: number;
  description: string;
  specs: {
    material: string;
    pumpType: string;
    chassis: string;
    weight: number;
  };
  category: "light" | "medium" | "heavy";
  image: string;
  inStock: boolean;
};
