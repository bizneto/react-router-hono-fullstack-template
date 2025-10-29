import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Droplets, ShoppingCart } from "lucide-react";

type NavbarProps = {
  cartItemsCount?: number;
};

export function Navbar({ cartItemsCount = 0 }: NavbarProps) {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Droplets className="h-6 w-6 text-blue-600" />
          <span>AquaTrans</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/">
            <Button variant="ghost">Katalog</Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost">O nas</Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost">Kontakt</Button>
          </Link>
          <Link to="/cart">
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Zapytania
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
