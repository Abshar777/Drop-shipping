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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.confirmation.title}</h1>
      {orderId && (
        <p className="text-gray-600 mb-1">
          {t.confirmation.orderId} <span className="font-mono font-medium" dir="ltr">{orderId}</span>
        </p>
      )}
      <p className="text-gray-500 mb-8">{t.confirmation.message}</p>
      <Link href="/products" className="inline-block bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-md hover:bg-orange-700">
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
