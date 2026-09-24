// Sidebar structure for the admin. `ready: false` items open a "coming soon" page
// explaining what the section will hold once its data exists.

export type AdminNavItem = { label: string; href: string; ready?: boolean };
export type AdminNavSection = { id: string; label: string; emoji: string; href?: string; items?: AdminNavItem[] };

export const ADMIN_NAV: AdminNavSection[] = [
  { id: "dashboard", label: "Dashboard", emoji: "📊", href: "/admin" },
  {
    id: "orders",
    label: "Orders",
    emoji: "🛒",
    items: [
      { label: "All Orders", href: "/admin/orders" },
      { label: "Pending", href: "/admin/orders?status=pending" },
      { label: "Processing", href: "/admin/orders?status=processing" },
      { label: "Shipped", href: "/admin/orders?status=shipped" },
      { label: "Delivered", href: "/admin/orders?status=delivered" },
      { label: "Cancelled", href: "/admin/orders?status=cancelled" },
      { label: "Refunded", href: "/admin/orders?status=refunded" },
    ],
  },
  {
    id: "products",
    label: "Products",
    emoji: "📦",
    items: [
      { label: "All Products", href: "/admin/products" },
      { label: "Add Product", href: "/admin/products/new" },
      { label: "Digital Products", href: "/admin/products?type=digital" },
      { label: "Physical Products", href: "/admin/products?type=physical" },
      { label: "Categories", href: "/admin/categories" },
      { label: "Collections", href: "/admin/collections", ready: false },
      { label: "Product Reviews", href: "/admin/reviews", ready: false },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    emoji: "📋",
    items: [
      { label: "Stock Overview", href: "/admin/inventory" },
      { label: "Low Stock", href: "/admin/inventory?filter=low" },
      { label: "Stock Adjustment", href: "/admin/inventory/adjust" },
      { label: "Inventory History", href: "/admin/inventory/history" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    emoji: "👥",
    items: [
      { label: "All Customers", href: "/admin/customers" },
      { label: "New Customers", href: "/admin/customers?filter=new" },
      { label: "Customer Groups", href: "/admin/customers/groups", ready: false },
      { label: "Customer Details", href: "/admin/customers?hint=details" },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    emoji: "💳",
    items: [
      { label: "Transactions", href: "/admin/payments" },
      { label: "Successful", href: "/admin/payments?status=successful" },
      { label: "Failed", href: "/admin/payments?status=failed" },
      { label: "Refunds", href: "/admin/payments?status=refunds" },
      { label: "Payment Reports", href: "/admin/payments/reports" },
    ],
  },
  {
    id: "shipping",
    label: "Shipping",
    emoji: "🚚",
    items: [
      { label: "Shipping Orders", href: "/admin/shipping" },
      { label: "Pending Shipment", href: "/admin/shipping?status=pending" },
      { label: "Shipped", href: "/admin/shipping?status=shipped" },
      { label: "Delivered", href: "/admin/shipping?status=delivered" },
      { label: "Shipping Settings", href: "/admin/settings/shipping", ready: false },
    ],
  },
  {
    id: "digital",
    label: "Digital Products",
    emoji: "💻",
    items: [
      { label: "Digital Files", href: "/admin/digital/files", ready: false },
      { label: "Downloads", href: "/admin/digital/downloads", ready: false },
      { label: "Download History", href: "/admin/digital/history", ready: false },
      { label: "Access Management", href: "/admin/digital/access", ready: false },
    ],
  },
  {
    id: "website",
    label: "Website",
    emoji: "🏠",
    items: [
      { label: "Homepage", href: "/admin/website/homepage" },
      { label: "Theme", href: "/admin/website/theme" },
      { label: "Banners", href: "/admin/website/banners", ready: false },
      { label: "Featured Products", href: "/admin/website/featured" },
      { label: "Collections", href: "/admin/collections", ready: false },
      { label: "Announcement Bar", href: "/admin/website/announcement", ready: false },
      { label: "Pages", href: "/admin/website/pages", ready: false },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    emoji: "🎟️",
    items: [
      { label: "Coupons", href: "/admin/marketing/coupons", ready: false },
      { label: "Discounts", href: "/admin/marketing/discounts", ready: false },
      { label: "Campaigns", href: "/admin/marketing/campaigns", ready: false },
      { label: "Customer Offers", href: "/admin/marketing/offers", ready: false },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    emoji: "📈",
    items: [
      { label: "Sales", href: "/admin/reports/sales" },
      { label: "Products", href: "/admin/reports/products" },
      { label: "Customers", href: "/admin/reports/customers" },
      { label: "Inventory", href: "/admin/reports/inventory" },
      { label: "Profit", href: "/admin/reports/profit", ready: false },
    ],
  },
  {
    id: "reviews",
    label: "Reviews",
    emoji: "⭐",
    items: [
      { label: "All Reviews", href: "/admin/reviews", ready: false },
      { label: "Pending Reviews", href: "/admin/reviews?filter=pending", ready: false },
      { label: "Reported Reviews", href: "/admin/reviews?filter=reported", ready: false },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    emoji: "⚙️",
    items: [
      { label: "Store Settings", href: "/admin/settings/store", ready: false },
      { label: "Payment Settings", href: "/admin/settings/payments", ready: false },
      { label: "Shipping Settings", href: "/admin/settings/shipping", ready: false },
      { label: "Tax", href: "/admin/settings/tax", ready: false },
      { label: "Notifications", href: "/admin/settings/notifications", ready: false },
      { label: "Admin Users", href: "/admin/settings/admins" },
      { label: "Security", href: "/admin/settings/security", ready: false },
    ],
  },
];

/** What each not-yet-built page will do, shown on its placeholder. */
export const COMING_SOON: Record<string, string> = {
  "/admin/collections": "Group products into curated collections (e.g. Summer Picks) and show them on the storefront.",
  "/admin/reviews": "Customer reviews and star ratings on products, with approval before they go live.",
  "/admin/customers/groups": "Segment customers into groups such as VIP or Wholesale for targeted pricing and offers.",
  "/admin/settings/shipping": "Shipping zones, rates, free-shipping thresholds, and delivery estimates.",
  "/admin/digital/files": "Upload downloadable files and attach them to digital products.",
  "/admin/digital/downloads": "See which digital purchases have been downloaded and how many times.",
  "/admin/digital/history": "A log of every download with customer, file, and time.",
  "/admin/digital/access": "Grant, extend, or revoke download access for a customer.",
  "/admin/website/banners": "Hero and promotional banners for the home page with scheduling.",
  "/admin/website/announcement": "A short message strip at the top of every page, e.g. free delivery this week.",
  "/admin/website/pages": "Static pages such as About, Contact, Shipping Policy, and Returns.",
  "/admin/marketing/coupons": "Coupon codes with fixed or percentage discounts, usage limits, and expiry.",
  "/admin/marketing/discounts": "Automatic discounts by product, category, or cart value.",
  "/admin/marketing/campaigns": "Email and notification campaigns to customers.",
  "/admin/marketing/offers": "Personalised offers for customer groups.",
  "/admin/reports/profit": "Profit needs a cost price per product. Once cost prices are recorded, margins appear here.",
  "/admin/settings/store": "Store name, contact email, address, currency, and time zone.",
  "/admin/settings/payments": "Enable online payment providers such as Razorpay alongside Cash on Delivery.",
  "/admin/settings/tax": "GST rates by product category and tax-inclusive pricing.",
  "/admin/settings/notifications": "Email and SMS notifications for new orders, shipping updates, and low stock.",
  "/admin/settings/security": "Two-factor authentication, session management, and login history.",
};
