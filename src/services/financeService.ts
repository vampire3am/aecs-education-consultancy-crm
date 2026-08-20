export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  receiptNo: string;
  studentCode: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  course: string;
  serviceCategory: string;
  coaIncomeCode: string; // e.g. "4112"
  coaAssetCode: string;  // e.g. "1115"
  subtotal: number;
  discount: number;
  grandTotal: number;
  amountReceived: number;
  balance: number;
  amountInWords: string;
  paymentMethod: string;
  status: "PAID" | "PENDING" | "PARTIAL";
  date: string;
}

export interface JournalEntry {
  id: string;
  voucherNo: string;
  date: string;
  referenceNo: string; // Invoice or Payroll or Commission Ref
  description: string;
  debitAccountCode: string;
  debitAccountName: string;
  creditAccountCode: string;
  creditAccountName: string;
  amount: number;
  preparedBy: string;
  status: "POSTED";
}

export interface UniversityCommission {
  id: string;
  agreementNo: string;
  universityName: string;
  country: string;
  studentName: string;
  studentCode: string;
  commissionType: "Percentage" | "Fixed Amount";
  ratePct: number;
  tuitionFeeAudNpr: number;
  commissionDueNpr: number;
  receivedNpr: number;
  status: "PENDING" | "RECEIVED" | "OVERDUE";
  dueDate: string;
}

const STORAGE_INVOICES = "aecs_persistent_invoices";
const STORAGE_JOURNALS = "aecs_persistent_journals";
const STORAGE_COMMISSIONS = "aecs_persistent_commissions";

export function numberToWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + inWords(n % 10000000) : "");
  }

  return inWords(Math.floor(num)) + " Nepalese Rupees Only";
}

const DEFAULT_INVOICES: InvoiceRecord[] = [];

const DEFAULT_COMMISSIONS: UniversityCommission[] = [];

const DEFAULT_JOURNALS: JournalEntry[] = [];

export const FinanceService = {
  getInvoices: async (): Promise<InvoiceRecord[]> => {
    const saved = localStorage.getItem(STORAGE_INVOICES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_INVOICES;
  },

  getJournals: async (): Promise<JournalEntry[]> => {
    const saved = localStorage.getItem(STORAGE_JOURNALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_JOURNALS;
  },

  getCommissions: async (): Promise<UniversityCommission[]> => {
    const saved = localStorage.getItem(STORAGE_COMMISSIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_COMMISSIONS;
  },

  createInvoice: async (payload: {
    studentCode: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    course: string;
    serviceCategory: string;
    coaIncomeCode: string;
    paymentMethod: string;
    subtotal: number;
    discount: number;
    amountReceived: number;
    status: "PAID" | "PENDING" | "PARTIAL";
  }): Promise<InvoiceRecord> => {
    const nextNum = Math.floor(146 + Math.random() * 850);
    const invoiceNo = `INV-2026-00${nextNum}`;
    const receiptNo = `AECS-00${nextNum}`;
    const grandTotal = Math.max(0, payload.subtotal - payload.discount);
    const balance = Math.max(0, grandTotal - payload.amountReceived);
    const words = numberToWords(payload.amountReceived > 0 ? payload.amountReceived : grandTotal);

    // Determine Asset Debit Account based on payment method
    let assetCode = "1111"; // Cash
    let assetName = "Cash in Hand (Kathmandu Counter)";
    if (payload.paymentMethod.includes("eSewa") || payload.paymentMethod.includes("Khalti")) {
      assetCode = "1115";
      assetName = "Digital Wallets (eSewa & Khalti)";
    } else if (payload.paymentMethod.includes("Bank") || payload.paymentMethod.includes("ConnectIPS")) {
      assetCode = "1113";
      assetName = "Bank Current Account (Nabil Bank)";
    }

    const newInvoice: InvoiceRecord = {
      id: `inv-${Date.now()}`,
      invoiceNo,
      receiptNo,
      studentCode: payload.studentCode,
      studentName: payload.studentName,
      studentEmail: payload.studentEmail,
      studentPhone: payload.studentPhone,
      course: payload.course,
      serviceCategory: payload.serviceCategory,
      coaIncomeCode: payload.coaIncomeCode,
      coaAssetCode: assetCode,
      subtotal: payload.subtotal,
      discount: payload.discount,
      grandTotal,
      amountReceived: payload.amountReceived,
      balance,
      amountInWords: words,
      paymentMethod: payload.paymentMethod,
      status: payload.status,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };

    const currentInvoices = await FinanceService.getInvoices();
    const updatedInvoices = [newInvoice, ...currentInvoices];
    localStorage.setItem(STORAGE_INVOICES, JSON.stringify(updatedInvoices));

    // AUTOMATIC DOUBLE-ENTRY JOURNAL ENTRY POSTING TO CHART OF ACCOUNTS
    if (payload.amountReceived > 0) {
      const newJournal: JournalEntry = {
        id: `j-${Date.now()}`,
        voucherNo: `JV-2026-00${nextNum}`,
        date: newInvoice.date,
        referenceNo: invoiceNo,
        description: `Student Fee Receipt - ${payload.studentName} (${payload.serviceCategory})`,
        debitAccountCode: assetCode,
        debitAccountName: assetName,
        creditAccountCode: payload.coaIncomeCode,
        creditAccountName: payload.serviceCategory,
        amount: payload.amountReceived,
        preparedBy: "AECS Automated Financial Gateway",
        status: "POSTED",
      };

      const currentJournals = await FinanceService.getJournals();
      const updatedJournals = [newJournal, ...currentJournals];
      localStorage.setItem(STORAGE_JOURNALS, JSON.stringify(updatedJournals));
    }

    return newInvoice;
  },

  createCommissionAgreement: async (payload: Omit<UniversityCommission, "id" | "agreementNo" | "commissionDueNpr" | "receivedNpr" | "status">): Promise<UniversityCommission> => {
    const due = payload.commissionType === "Percentage"
      ? (payload.tuitionFeeAudNpr * payload.ratePct) / 100
      : 500000;

    const newComm: UniversityCommission = {
      ...payload,
      id: `comm-${Date.now()}`,
      agreementNo: `AGR-2026-${Math.floor(100 + Math.random() * 900)}`,
      commissionDueNpr: due,
      receivedNpr: 0,
      status: "PENDING",
    };

    const current = await FinanceService.getCommissions();
    const updated = [newComm, ...current];
    localStorage.setItem(STORAGE_COMMISSIONS, JSON.stringify(updated));

    // Automatically post receivable to COA
    const newJournal: JournalEntry = {
      id: `j-comm-${Date.now()}`,
      voucherNo: `JV-REC-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      referenceNo: newComm.agreementNo,
      description: `University Commission Accrued - ${payload.universityName} (${payload.studentName})`,
      debitAccountCode: "1131",
      debitAccountName: "University Commissions Receivable (UK/Aus/Canada)",
      creditAccountCode: "4211",
      creditAccountName: "University Agency Commission Revenue",
      amount: due,
      preparedBy: "Admissions & University Relations",
      status: "POSTED",
    };

    const currentJournals = await FinanceService.getJournals();
    localStorage.setItem(STORAGE_JOURNALS, JSON.stringify([newJournal, ...currentJournals]));

    return newComm;
  },
};
