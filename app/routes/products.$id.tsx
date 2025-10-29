import { useState } from "react";
import type { Route } from "./+types/products.$id";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Droplets, Gauge, Weight, Package, Truck, CheckCircle2, Mail, Phone, User, MessageSquare } from "lucide-react";
import type { Product } from "@/types/product";
import { Link } from "react-router";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Produkt ${params.id} - AquaTrans` },
    { name: "description", content: "Szczegóły beczkowozu" },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const apiUrl = `${url.protocol}//${url.host}/api/products/${params.id}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Product not found");
    }
    const data = (await response.json()) as { product: Product };
    return { product: data.product };
  } catch (error) {
    throw new Response("Not Found", { status: 404 });
  }
}

export default function ProductDetail({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          productId: product.id,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar cartItemsCount={0} />

      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            ← Powrót do katalogu
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image & Basic Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-950 rounded-lg flex items-center justify-center mb-6">
                  <Droplets className="h-32 w-32 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={product.inStock ? "default" : "secondary"}>
                    {product.inStock ? "Dostępny" : "Niedostępny"}
                  </Badge>
                  <Badge variant="outline">{categoryLabels[product.category]}</Badge>
                </div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{product.description}</p>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(product.price)}
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specyfikacja techniczna</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Droplets className="h-5 w-5" />
                    <span>Pojemność</span>
                  </div>
                  <span className="font-semibold">{product.capacity.toLocaleString()} L</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Package className="h-5 w-5" />
                    <span>Materiał zbiornika</span>
                  </div>
                  <span className="font-semibold">{product.specs.material}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Gauge className="h-5 w-5" />
                    <span>Pompa</span>
                  </div>
                  <span className="font-semibold">{product.specs.pumpType}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Truck className="h-5 w-5" />
                    <span>Podwozie</span>
                  </div>
                  <span className="font-semibold">{product.specs.chassis}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Weight className="h-5 w-5" />
                    <span>Masa własna</span>
                  </div>
                  <span className="font-semibold">{product.specs.weight} kg</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inquiry Form */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Wyślij zapytanie ofertowe</CardTitle>
                <CardDescription>
                  Skontaktujemy się z Tobą w ciągu 24h z indywidualną ofertą
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitStatus === "success" ? (
                  <div className="py-8 text-center space-y-4">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                    <h3 className="text-xl font-semibold">Dziękujemy za zapytanie!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Nasz zespół skontaktuje się z Tobą w ciągu 24 godzin.
                    </p>
                    <Button onClick={() => setSubmitStatus("idle")} variant="outline">
                      Wyślij kolejne zapytanie
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        Imię i nazwisko *
                      </label>
                      <Input
                        required
                        placeholder="Jan Kowalski"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4" />
                        Email *
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="jan@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4" />
                        Telefon
                      </label>
                      <Input
                        placeholder="+48 123 456 789"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4" />
                        Wiadomość
                      </label>
                      <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
                        placeholder="Dodatkowe informacje lub pytania..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    {submitStatus === "error" && (
                      <div className="text-sm text-red-500">
                        Wystąpił błąd. Spróbuj ponownie.
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Wysyłanie..." : "Wyślij zapytanie"}
                    </Button>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      * Pola wymagane
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
