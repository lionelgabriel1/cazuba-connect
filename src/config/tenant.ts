export const tenant = {
  name: import.meta.env.VITE_TENANT_NAME ?? "Cazuba Centro de Treinamento",
  shortName: import.meta.env.VITE_TENANT_SHORT ?? "CAZUBA",
  tagline: import.meta.env.VITE_TENANT_TAGLINE ?? "Capacitando talentos, construindo futuros.",
  logoUrl: import.meta.env.VITE_TENANT_LOGO_URL ?? "",
  primaryColor: import.meta.env.VITE_TENANT_PRIMARY ?? "#0D47A1",
  accentColor: import.meta.env.VITE_TENANT_ACCENT ?? "#FFC107",
  phone: import.meta.env.VITE_TENANT_PHONE ?? "",
  email: import.meta.env.VITE_TENANT_EMAIL ?? "",
  address: import.meta.env.VITE_TENANT_ADDRESS ?? "",
  studentCodePrefix: import.meta.env.VITE_TENANT_CODE_PREFIX ?? "CAZ",
  metaTitle: import.meta.env.VITE_TENANT_META_TITLE ?? "Cazuba Centro de Treinamento",
  metaDescription: import.meta.env.VITE_TENANT_META_DESC ?? "",
};
