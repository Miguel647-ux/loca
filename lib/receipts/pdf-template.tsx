import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReceiptWithRelations } from "@/types/database";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#18181B",
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7",
  },
  brand: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#71717A",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 140,
    color: "#71717A",
  },
  value: {
    flex: 1,
    fontWeight: "bold",
  },
  section: {
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#71717A",
    marginBottom: 8,
  },
  amountBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E4E4E7",
    borderRadius: 6,
  },
  amountLabel: {
    fontSize: 10,
    color: "#71717A",
    marginBottom: 4,
  },
  amount: {
    fontSize: 22,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#71717A",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#E4E4E7",
    paddingTop: 12,
  },
});

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

const METHOD_LABELS: Record<string, string> = {
  cash: "Espèces",
  bank_transfer: "Virement bancaire",
  mobile_money: "Mobile Money",
  other: "Autre",
};

export function ReceiptPdf({ receipt }: { receipt: ReceiptWithRelations }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Loca</Text>
          <Text style={styles.subtitle}>
            Plateforme de gestion locative
          </Text>
        </View>

        <Text style={styles.title}>Reçu de paiement</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Numéro de reçu</Text>
          <Text style={styles.value}>{receipt.receipt_number}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date d’émission</Text>
          <Text style={styles.value}>{formatDate(receipt.issued_at)}</Text>
        </View>

        {/* Propriété */}
        {receipt.property && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propriété</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nom</Text>
              <Text style={styles.value}>{receipt.property.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Adresse</Text>
              <Text style={styles.value}>
                {receipt.property.address}, {receipt.property.city}
              </Text>
            </View>
            {receipt.unit && (
              <View style={styles.row}>
                <Text style={styles.label}>Logement</Text>
                <Text style={styles.value}>{receipt.unit.unit_number}</Text>
              </View>
            )}
          </View>
        )}

        {/* Locataire */}
        {receipt.tenant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Locataire</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nom</Text>
              <Text style={styles.value}>
                {receipt.tenant.first_name} {receipt.tenant.last_name}
              </Text>
            </View>
            {receipt.tenant.phone && (
              <View style={styles.row}>
                <Text style={styles.label}>Téléphone</Text>
                <Text style={styles.value}>{receipt.tenant.phone}</Text>
              </View>
            )}
          </View>
        )}

        {/* Échéance */}
        {receipt.rent_due && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Échéance concernée</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Période</Text>
              <Text style={styles.value}>
                {formatPeriod(
                  receipt.rent_due.period_start,
                  receipt.rent_due.period_end
                )}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Montant dû</Text>
              <Text style={styles.value}>
                {formatCurrency(Number(receipt.rent_due.amount_due))}
              </Text>
            </View>
          </View>
        )}

        {/* Paiement */}
        {receipt.payment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails du paiement</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>
                {formatDate(receipt.payment.payment_date)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Méthode</Text>
              <Text style={styles.value}>
                {METHOD_LABELS[receipt.payment.payment_method] ??
                  receipt.payment.payment_method}
              </Text>
            </View>
            {receipt.payment.reference && (
              <View style={styles.row}>
                <Text style={styles.label}>Référence</Text>
                <Text style={styles.value}>{receipt.payment.reference}</Text>
              </View>
            )}
          </View>
        )}

        {/* Montant mis en avant */}
        {receipt.payment && (
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Montant reçu</Text>
            <Text style={styles.amount}>
              {formatCurrency(Number(receipt.payment.amount))}
            </Text>
          </View>
        )}

        <Text style={styles.footer}>
          Reçu généré automatiquement par Loca —{" "}
          {receipt.recorded_by
            ? `Enregistré par ${receipt.recorded_by.first_name} ${receipt.recorded_by.last_name}`
            : ""}
        </Text>
      </Page>
    </Document>
  );
}