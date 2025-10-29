-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  description TEXT NOT NULL,
  material TEXT NOT NULL,
  pump_type TEXT NOT NULL,
  chassis TEXT NOT NULL,
  weight INTEGER NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('light', 'medium', 'heavy')),
  image TEXT NOT NULL,
  in_stock INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'completed', 'archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_product_id ON inquiries(product_id);

-- Insert initial products
INSERT INTO products (id, name, capacity, price, description, material, pump_type, chassis, weight, category, image, in_stock) VALUES
('1', 'AquaTrans 3000', 3000, 125000, 'Kompaktowy beczkowóz idealny do małych i średnich gospodarstw. Solidna konstrukcja, łatwy w obsłudze.', 'Stal nierdzewna', 'Pompa wirowa 300 l/min', 'Mercedes Sprinter', 2500, 'light', '/images/tanker-light.jpg', 1),
('2', 'AquaTrans 5000 Pro', 5000, 185000, 'Średni beczkowóz z profesjonalnym wyposażeniem. Idealny do zaopatrzenia budów i większych gospodarstw.', 'Stal nierdzewna', 'Pompa wirowa 450 l/min', 'MAN TGL', 4200, 'medium', '/images/tanker-medium.jpg', 1),
('3', 'AquaTrans 8000 Heavy', 8000, 285000, 'Ciężki beczkowóz przemysłowy. Największa wydajność dla wymagających projektów.', 'Stal nierdzewna wzmocniona', 'Pompa wirowa 600 l/min', 'Scania P280', 6800, 'heavy', '/images/tanker-heavy.jpg', 1),
('4', 'AquaTrans 6000 EcoLine', 6000, 215000, 'Ekonomiczny model z doskonałym stosunkiem ceny do jakości. Niezawodny i oszczędny.', 'Stal nierdzewna', 'Pompa wirowa 400 l/min', 'Iveco Eurocargo', 5000, 'medium', '/images/tanker-medium.jpg', 1),
('5', 'AquaTrans 10000 Industrial', 10000, 385000, 'Największy model w ofercie. Dla profesjonalistów i dużych przedsiębiorstw. Maksymalna pojemność i wydajność.', 'Stal nierdzewna premium', 'Pompa wirowa 800 l/min', 'Volvo FH16', 8500, 'heavy', '/images/tanker-heavy.jpg', 1),
('6', 'AquaTrans 4000 Compact', 4000, 155000, 'Kompaktowy wymiary przy dużej pojemności. Świetny do pracy w trudno dostępnych miejscach.', 'Stal nierdzewna', 'Pompa wirowa 350 l/min', 'Fiat Ducato', 3200, 'light', '/images/tanker-light.jpg', 0);
