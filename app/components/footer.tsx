import { Droplets, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Droplets className="h-6 w-6 text-blue-600" />
              <span>AquaTrans</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Profesjonalne beczkowozy do wody pitnej. Solidne rozwiązania dla Twojego biznesu.
            </p>
          </div>

          {/* Produkty */}
          <div>
            <h3 className="font-semibold mb-4">Produkty</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/?category=light" className="hover:text-blue-600">
                  Beczkowozy lekkie
                </Link>
              </li>
              <li>
                <Link to="/?category=medium" className="hover:text-blue-600">
                  Beczkowozy średnie
                </Link>
              </li>
              <li>
                <Link to="/?category=heavy" className="hover:text-blue-600">
                  Beczkowozy ciężkie
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-blue-600">
                  Wszystkie produkty
                </Link>
              </li>
            </ul>
          </div>

          {/* Firma */}
          <div>
            <h3 className="font-semibold mb-4">Firma</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/about" className="hover:text-blue-600">
                  O nas
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-600">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-blue-600">
                  Polityka prywatności
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-600">
                  Regulamin
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>ul. Wodna 123<br />00-001 Warszawa</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+48123456789" className="hover:text-blue-600">
                  +48 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:kontakt@aquatrans.pl" className="hover:text-blue-600">
                  kontakt@aquatrans.pl
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {currentYear} AquaTrans. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}
