import { Product, Service, Barber } from "./types";

const PRODUCTS_KEY = "pk_products";
const SERVICES_KEY = "pk_services";
const BARBERS_KEY = "pk_barbers";

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ── Products ── */

export function getProducts(): Product[] {
  return read<Product>(PRODUCTS_KEY);
}

export function createProduct(
  data: Omit<Product, "id" | "created_at" | "updated_at">
): Product {
  const now = new Date().toISOString();
  const product: Product = {
    ...data,
    id: genId(),
    created_at: now,
    updated_at: now,
  };
  const all = getProducts();
  all.unshift(product);
  write(PRODUCTS_KEY, all);
  return product;
}

export function updateProduct(
  id: string,
  patch: Partial<Product>
): Product | null {
  const all = getProducts();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
  write(PRODUCTS_KEY, all);
  return all[idx];
}

export function deleteProduct(id: string): boolean {
  const all = getProducts();
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return false;
  write(PRODUCTS_KEY, next);
  return true;
}

/* ── Services ── */

export function getServices(): Service[] {
  return read<Service>(SERVICES_KEY);
}

export function createService(
  data: Omit<Service, "id" | "created_at" | "updated_at">
): Service {
  const now = new Date().toISOString();
  const service: Service = {
    ...data,
    id: genId(),
    created_at: now,
    updated_at: now,
  };
  const all = getServices();
  all.unshift(service);
  write(SERVICES_KEY, all);
  return service;
}

export function updateService(
  id: string,
  patch: Partial<Service>
): Service | null {
  const all = getServices();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
  write(SERVICES_KEY, all);
  return all[idx];
}

export function deleteService(id: string): boolean {
  const all = getServices();
  const next = all.filter((s) => s.id !== id);
  if (next.length === all.length) return false;
  write(SERVICES_KEY, next);
  return true;
}

/* ── Barbers ── */

export function getBarbers(): Barber[] {
  return read<Barber>(BARBERS_KEY);
}

export function createBarber(
  data: Omit<Barber, "id" | "created_at" | "updated_at">
): Barber {
  const now = new Date().toISOString();
  const barber: Barber = {
    ...data,
    id: genId(),
    created_at: now,
    updated_at: now,
  };
  const all = getBarbers();
  all.unshift(barber);
  write(BARBERS_KEY, all);
  return barber;
}

export function updateBarber(
  id: string,
  patch: Partial<Barber>
): Barber | null {
  const all = getBarbers();
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
  write(BARBERS_KEY, all);
  return all[idx];
}

export function deleteBarber(id: string): boolean {
  const all = getBarbers();
  const next = all.filter((b) => b.id !== id);
  if (next.length === all.length) return false;
  write(BARBERS_KEY, next);
  return true;
}
