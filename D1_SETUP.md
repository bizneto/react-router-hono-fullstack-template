# Cloudflare D1 Database Setup Guide

## 📋 Szybki start

### 1. Utwórz bazę danych D1

```bash
# Utwórz nową bazę D1
npx wrangler d1 create aquatrans-db

# Wrangler zwróci database_id - SKOPIUJ GO!
# Przykład: database_id = "abc123-def456-ghi789"
```

### 2. Zaktualizuj wrangler.jsonc

Zamień `database_id` w pliku `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "aquatrans-db",
    "database_id": "WKLEJ-TUTAJ-SWOJE-DATABASE-ID" // ← Zmień to!
  }
]
```

### 3. Uruchom migrację (inicjalizacja bazy)

```bash
# Uruchom migrację SQL
npx wrangler d1 execute aquatrans-db --file=./migrations/0001_initial_schema.sql
```

To utworzy tabele `products` i `inquiries` oraz doda przykładowe produkty.

### 4. Zmień klucz API administratora

W `wrangler.jsonc` zmień domyślny klucz API:

```jsonc
"vars": {
  "VALUE_FROM_CLOUDFLARE": "Hello from Hono/CF",
  "ADMIN_API_KEY": "TWOJ-BEZPIECZNY-KLUCZ-123" // ← Zmień to!
}
```

Albo ustaw jako secret (bardziej bezpiecznie):

```bash
npx wrangler secret put ADMIN_API_KEY
# Wprowadź swój bezpieczny klucz
```

### 5. Build i deploy

```bash
# Build projektu
npm run build

# Deploy do Cloudflare Workers
npm run deploy
```

---

## 🔧 API Endpoints

### Publiczne API

#### GET /api/products
Pobierz wszystkie produkty

**Parametry query:**
- `category` - "light", "medium", "heavy", "all"
- `inStock` - "true" (tylko dostępne)

**Przykład:**
```bash
curl https://twoja-domena.workers.dev/api/products?category=medium&inStock=true
```

#### GET /api/products/:id
Pobierz szczegóły produktu

#### POST /api/inquiry
Wyślij zapytanie ofertowe

**Body:**
```json
{
  "productId": "1",
  "name": "Jan Kowalski",
  "email": "jan@example.com",
  "phone": "+48123456789",
  "message": "Pytanie o cenę"
}
```

---

### Admin API (wymagany header: `X-API-Key`)

Wszystkie zapytania admin wymagają nagłówka:
```
X-API-Key: TWOJ-BEZPIECZNY-KLUCZ-123
```

#### GET /api/admin/stats
Pobierz statystyki dashboardu

**Odpowiedź:**
```json
{
  "stats": {
    "products": 6,
    "inquiries": 15,
    "newInquiries": 3
  }
}
```

#### GET /api/admin/inquiries
Lista wszystkich zapytań

**Parametry:**
- `status` - "new", "in_progress", "completed", "archived", "all"

**Przykład:**
```bash
curl -H "X-API-Key: TWOJ-KLUCZ" \
  https://twoja-domena.workers.dev/api/admin/inquiries?status=new
```

#### PATCH /api/admin/inquiries/:id
Zaktualizuj status zapytania

**Body:**
```json
{
  "status": "in_progress"
}
```

#### POST /api/admin/products
Dodaj nowy produkt

**Body:**
```json
{
  "name": "AquaTrans 7000",
  "capacity": 7000,
  "price": 250000,
  "description": "Opis produktu",
  "material": "Stal nierdzewna",
  "pumpType": "Pompa wirowa 500 l/min",
  "chassis": "Volvo FL",
  "weight": 5500,
  "category": "medium",
  "inStock": true
}
```

#### PATCH /api/admin/products/:id
Zaktualizuj produkt

**Body (wszystkie pola opcjonalne):**
```json
{
  "price": 240000,
  "inStock": false
}
```

#### DELETE /api/admin/products/:id
Usuń produkt

---

## 🎨 Przykładowy Admin Panel (Frontend)

Stwórz plik `app/routes/admin.tsx`:

```tsx
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminPanel() {
  const [apiKey, setApiKey] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    // Sprawdź czy klucz działa
    fetch("/api/admin/stats", {
      headers: { "X-API-Key": apiKey },
    })
      .then((res) => {
        if (res.ok) {
          localStorage.setItem("adminApiKey", apiKey);
          setIsAuthenticated(true);
          loadInquiries();
        } else {
          alert("Nieprawidłowy klucz API");
        }
      });
  };

  const loadInquiries = () => {
    const key = localStorage.getItem("adminApiKey");
    fetch("/api/admin/inquiries?status=new", {
      headers: { "X-API-Key": key },
    })
      .then((res) => res.json())
      .then((data) => setInquiries(data.inquiries));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="password"
              placeholder="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <Button onClick={login} className="w-full">
              Zaloguj
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Panel Administracyjny</h1>

      <div className="grid gap-4">
        {inquiries.map((inquiry: any) => (
          <Card key={inquiry.id}>
            <CardHeader>
              <CardTitle>{inquiry.product_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Klient:</strong> {inquiry.name}</p>
              <p><strong>Email:</strong> {inquiry.email}</p>
              <p><strong>Telefon:</strong> {inquiry.phone || "---"}</p>
              <p><strong>Wiadomość:</strong> {inquiry.message || "---"}</p>
              <p><strong>Data:</strong> {new Date(inquiry.created_at).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

Dodaj route w `app/routes.ts`:
```ts
route("admin", "routes/admin.tsx"),
```

---

## 🔒 Bezpieczeństwo

1. **NIE** commituj prawdziwego klucza API do repo
2. Użyj Cloudflare Secrets dla produkcji:
   ```bash
   npx wrangler secret put ADMIN_API_KEY
   ```
3. Rozważ dodanie rate limiting
4. W przyszłości dodaj proper authentication (OAuth, JWT)

---

## 📊 Zarządzanie danymi lokalnie

### Podgląd danych lokalnie
```bash
npx wrangler d1 execute aquatrans-db --command="SELECT * FROM products"
```

### Dodaj produkt ręcznie
```bash
npx wrangler d1 execute aquatrans-db --command="
INSERT INTO products (id, name, capacity, price, description, material, pump_type, chassis, weight, category, image, in_stock)
VALUES ('7', 'AquaTrans 7000', 7000, 250000, 'Nowy model', 'Stal', 'Pompa 500', 'Volvo', 5500, 'medium', '/images/placeholder.jpg', 1)
"
```

### Backup bazy
```bash
npx wrangler d1 export aquatrans-db --output=backup.sql
```

---

## 🚀 Next Steps

1. Zbuduj pełny Admin Panel UI (products CRUD, inquiries management)
2. Dodaj email notifications (np. przez SendGrid/Resend)
3. Dodaj upload zdjęć produktów (Cloudflare R2)
4. Rozszerz schemat o więcej pól (specyfikacje, galerie, etc.)
5. Dodaj dashboard z wykresami (Chart.js, Recharts)

---

**Gotowe!** Twój sklep z beczkowozami działa teraz z prawdziwą bazą danych! 🎉
