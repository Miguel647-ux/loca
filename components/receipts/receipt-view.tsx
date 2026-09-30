import Link from "next/link";

import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/validations/rent-payment";
import type { ReceiptWithRelations } from "@/types/database";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  })
    .format(n)
    .concat(" FCFA");
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function formatPeriod(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const fmt: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
  if (
    s.getUTCFullYear() === e.getUTCFullYear() &&
    s.getUTCMonth() === e.getUTCMonth()
  ) {
    return new Intl.DateTimeFormat("fr-FR", fmt).format(s);
  }
  return `${new Intl.DateTimeFormat("fr-FR", fmt).format(s)} → ${new Intl.DateTimeFormat("fr-FR", fmt).format(e)}`;
}

export function ReceiptView({ receipt }: { receipt: ReceiptWithRelations }) {
  return (
    <div className="rounded-lg border bg-card p-6 sm:p-8 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b">
        <div>
          <p className="font-heading text-2xl font-bold">Loca</p>
          <p className="text-sm text-muted-foreground">
            Reçu de paiement
          </p>
        </div>
        <div className="text-left sm:text-right space-y-1">
          <p className="font-mono text-sm font-medium">
            {receipt.receipt_number}
          </p>
          <p className="text-xs text-muted-foreground">
            Émis le {formatDate(receipt.issued_at)}
          </p>
        </div>
      </div>

      {/* Propriété + Locataire */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {receipt.property && (
          <Section title="Propriété">
            <Row label="Nom" value={receipt.property.name} />
            <Row
              label="Adresse"
              value={`${receipt.property.address}, ${receipt.property.city}`}
            />
            {receipt.unit && (
              <Row label="Logement" value={receipt.unit.unit_number} />
            )}
          </Section>
        )}

        {receipt.tenant && (
          <Section title="Locataire">
            <Row
              label="Nom"
              value={`${receipt.tenant.first_name} ${receipt.tenant.last_name}`}
            />
            {receipt.tenant.phone && (
              <Row label="Téléphone" value={receipt.tenant.phone} />
            )}
            {receipt.tenant.email && (
              <Row label="Email" value={receipt.tenant.email} />
            )}
          </Section>
        )}
      </div>

      {/* Échéance */}
      {receipt.rent_due && (
        <Section title="Échéance concernée">
          <Row
            label="Période"
            value={formatPeriod(
              receipt.rent_due.period_start,
              receipt.rent_due.period_end
            )}
          />
          <Row
            label="Montant dû"
            value={formatCurrency(Number(receipt.rent_due.amount_due))}
          />
        </Section>
      )}

      {/* Paiement */}
      {receipt.payment && (
        <Section title="Détails du paiement">
          <Row
            label="Date"
            value={formatDate(receipt.payment.payment_date)}
          />
          <Row
            label="Méthode"
            value={
              PAYMENT_METHOD_LABELS[
                receipt.payment.payment_method as PaymentMethod
              ] ?? receipt.payment.payment_method
            }
          />
          {receipt.payment.reference && (
            <Row label="Référence" value={receipt.payment.reference} />
          )}
        </Section>
      )}

      {/* Montant */}
      {receipt.payment && (
        <div className="rounded-lg bg-muted/40 p-5 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Montant reçu
          </span>
          <span className="font-heading text-2xl font-bold tabular-nums">
            {formatCurrency(Number(receipt.payment.amount))}
          </span>
        </div>
      )}

      {/* Pied */}
      <div className="pt-4 border-t text-xs text-muted-foreground">
        {receipt.recorded_by && (
          <p>
            Enregistré par{" "}
            <strong>
              {receipt.recorded_by.first_name}{" "}
              {receipt.recorded_by.last_name}
            </strong>
          </p>
        )}
        <p className="mt-1">Reçu généré automatiquement par Loca.</p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}