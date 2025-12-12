import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// Optional: Register a nice font (download Roboto or use any TTF)
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 12,
    backgroundColor: "#f9f9f9",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottom: "1px solid #eee",
  },
  label: {
    fontWeight: "bold",
    width: "50%",
  },
  value: {
    width: "50%",
    textAlign: "right",
  },
  table: {
    marginTop: 20,
    border: "1px solid #ddd",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 8,
  },
  tableCol: {
    width: "50%",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderTop: "2px solid #000",
    marginTop: 10,
  },
  netPay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0c6a0c",
  },
  footer: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 10,
    color: "#777",
  },
});

interface SalarySlipPDFProps {
  salary: {
    employee: {
      employeeName: string;
      designation: string;
      registrationNumber?: string;
    };
    amount: number;
    allowances: number | null;
    bonus: number | null;
    deductions: number | null;
    netPay: number;
    month: number;
    year: number;
    paymentDate?: Date | null;
    status: string;
  };
  schoolName?: string; // Optional: customize school name
  logoUrl?: string;    // Optional: school logo
}

const SalarySlipPDF: React.FC<SalarySlipPDFProps> = ({
  salary,
  schoolName = "Your School Name",
  logoUrl,
}) => {
  const monthName = new Date(0, salary.month - 1).toLocaleString("default", {
    month: "long",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {logoUrl && (
          /* eslint-disable-next-line jsx-a11y/alt-text */
          <Image src={logoUrl} style={{ width: 80, marginBottom: 20, alignSelf: "center" }} />
        )}

        <View style={styles.header}>
          <Text style={styles.title}>{schoolName}</Text>
          <Text style={styles.subtitle}>Salary Slip</Text>
          <Text style={{ marginTop: 10 }}>
            {monthName} {salary.year}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Employee Name</Text>
            <Text style={styles.value}>{salary.employee.employeeName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Designation</Text>
            <Text style={styles.value}>{salary.employee.designation}</Text>
          </View>
          {salary.employee.registrationNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>Employee ID</Text>
              <Text style={styles.value}>{salary.employee.registrationNumber}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Payment Status</Text>
            <Text style={styles.value}>{salary.status}</Text>
          </View>
          {salary.paymentDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Payment Date</Text>
              <Text style={styles.value}>
                {new Date(salary.paymentDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Earnings</Text>
            <Text style={styles.tableCol}>Amount (PKR)</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Base Salary</Text>
            <Text style={styles.value}>{salary.amount.toFixed(2)}</Text>
          </View>
          {(salary.allowances ?? 0) > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Allowances</Text>
              <Text style={styles.value}>{(salary.allowances ?? 0).toFixed(2)}</Text>
            </View>
          )}
          {(salary.bonus ?? 0) > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Bonus</Text>
              <Text style={styles.value}>{(salary.bonus ?? 0).toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.label}>Gross Pay</Text>
            <Text style={styles.value}>
              {(salary.amount + (salary.allowances ?? 0) + (salary.bonus ?? 0)).toFixed(2)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Deductions</Text>
            <Text style={styles.value}>-{(salary.deductions ?? 0).toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={{ ...styles.label, fontSize: 16 }}>Net Pay</Text>
            <Text style={{ ...styles.value, ...styles.netPay }}>
              {salary.netPay.toFixed(2)} PKR
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>This is a computer-generated salary slip.</Text>
          <Text>Generated on: {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SalarySlipPDF;