import Link from "next/link";
import { Suspense } from "react";
import { getT } from "@/lib/i18n/server";

async function Confirmation({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const [{ orderId }, { t }] = await Promise.all([searchParams, getT()]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 text-3xl">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{t.confirmation.title}</h1>
      {orderId && (
        <p className="text-muted mb-1">
          {t.confirmation.orderId} <span className="font-mono font-medium text-foreground" dir="ltr">{orderId}</span>
        </p>
      )}
      <p className="text-muted mb-8">{t.confirmation.message}</p>
      <Link href="/products" className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-btn hover:bg-primary-hover">
        {t.confirmation.continue}
      </Link>
    </div>
  );
}

export default function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  return (
    <Suspense>
      <Confirmation searchParams={searchParams} />
    </Suspense>
  );
}
