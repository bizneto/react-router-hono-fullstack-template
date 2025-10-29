import { useState } from "react";
import type { Route } from "./+types/products";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "@/types/product";
import { generateMetaTags, generateOrganizationSchema } from "@/lib/seo";

export function meta({ data }: Route.MetaArgs) {
  const url = typeof window !== "undefined" ? window.location.origin : "https://aquatrans.pl";

  return generateMetaTags(
    {
      title: "Katalog Beczkowozów",
      description:
        "Profesjonalne beczkowozy do wody pitnej. Szeroki wybór modeli od 3000L do 10000L. Solidne konstrukcje, konkurencyjne ceny.",
      keywords:
        "beczkowozy, beczkowóz na wodę, cysterny do wody, pojazdy do transportu wody, beczkowozy cena",
      ogType: "website",
    },
    url
  );
}

export function links() {
  return [
    {
      tagName: "script",
      type: "application/ld+json",
      children: JSON.stringify(generateOrganizationSchema()),
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const apiUrl = `${url.protocol}//${url.host}/api/products`;

  try {
    const response = await fetch(apiUrl);
    const data = (await response.json()) as { products: Product[] };
    return { products: data.products };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { products: [] };
  }
}

export default function Products({ loaderData }: Route.ComponentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);

  const filteredProducts = loaderData.products.filter((product) => {
    const categoryMatch = selectedCategory === "all" || product.category === selectedCategory;
    const stockMatch = !showOnlyInStock || product.inStock;
    return categoryMatch && stockMatch;
  });

  const categories = [
    { value: "all", label: "Wszystkie", count: loaderData.products.length },
    { value: "light", label: "Lekkie", count: loaderData.products.filter((p) => p.category === "light").length },
    { value: "medium", label: "Średnie", count: loaderData.products.filter((p) => p.category === "medium").length },
    { value: "heavy", label: "Ciężkie", count: loaderData.products.filter((p) => p.category === "heavy").length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar cartItemsCount={0} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Profesjonalne Beczkowozy
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Dostarczamy najwyższej jakości beczkowozy do wody pitnej.
            Solidne konstrukcje, niezawodne rozwiązania dla Twojego biznesu.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Filtry</CardTitle>
                <CardDescription>Dostosuj wyniki wyszukiwania</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Kategoria</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat.value}
                        variant={selectedCategory === cat.value ? "default" : "outline"}
                        className="w-full justify-between"
                        onClick={() => setSelectedCategory(cat.value)}
                      >
                        <span>{cat.label}</span>
                        <span className="text-xs opacity-70">({cat.count})</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant={showOnlyInStock ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setShowOnlyInStock(!showOnlyInStock)}
                  >
                    Tylko dostępne
                  </Button>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
                  <p>Znaleziono: <strong>{filteredProducts.length}</strong> produktów</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Nie znaleziono produktów spełniających kryteria
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
