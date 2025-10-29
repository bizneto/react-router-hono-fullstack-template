import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplets, Gauge, Weight, Package } from "lucide-react";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const categoryLabels = {
    light: "Lekki",
    medium: "Średni",
    heavy: "Ciężki",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Badge variant={product.inStock ? "default" : "secondary"}>
            {product.inStock ? "Dostępny" : "Niedostępny"}
          </Badge>
          <Badge variant="outline">{categoryLabels[product.category]}</Badge>
        </div>
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-950 rounded-lg flex items-center justify-center mb-3">
          <Droplets className="h-16 w-16 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-xl">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Droplets className="h-4 w-4" />
            <span>{product.capacity.toLocaleString()} L</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Gauge className="h-4 w-4" />
            <span>{product.specs.pumpType.split(" ")[2]}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Weight className="h-4 w-4" />
            <span>{product.specs.weight} kg</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Package className="h-4 w-4" />
            <span>{product.specs.chassis.split(" ")[0]}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-3">
        <div className="w-full text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {formatPrice(product.price)}
          </p>
        </div>
        <Link to={`/products/${product.id}`} className="w-full">
          <Button className="w-full" variant="default">
            Zobacz szczegóły
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
