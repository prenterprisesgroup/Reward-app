const fs = require("fs");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { v4: uuidv4 } = require("uuid"); // Assume crypto/uuid is present, or I'll just use Date.now
const crypto = require("crypto");

const Company = require("../models/company.model");
const User = require("../models/user.model");
const WalletTransaction = require("../models/wallet-transaction.model");
const AuditLog = require("../models/audit-log.model");
const ReportJob = require("../models/report-job.model");

class ExportService {
  constructor() {
    this.reportsDir = path.join(__dirname, "../../tmp/reports");
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Main entrypoint for generating a report safely
   */
  async generateReport(jobId) {
    const job = await ReportJob.findById(jobId);
    if (!job) throw new Error("ReportJob not found");

    job.status = "PROCESSING";
    job.startedAt = new Date();
    await job.save();

    try {
      const { reportType, filters, format } = job;
      const fileName = `${reportType.toLowerCase()}_${crypto.randomBytes(6).toString("hex")}_${Date.now()}.${format.toLowerCase()}`;
      const filePath = path.join(this.reportsDir, fileName);

      let cursor;
      let headers = [];
      let mapper = (doc) => doc;

      // Map Query and Headers based on Report Type
      if (reportType === "COMPANIES") {
        const query = filters.status ? { status: filters.status } : {};
        cursor = Company.find(query).lean().cursor();
        headers = [
          { id: "displayId", title: "Company ID" },
          { id: "name", title: "Name" },
          { id: "status", title: "Status" },
          { id: "createdAt", title: "Joined At" },
        ];
        mapper = (doc) => ({
          displayId: doc.displayId,
          name: doc.name,
          status: doc.status,
          createdAt: doc.createdAt ? doc.createdAt.toISOString() : "",
        });
      } else if (reportType === "WORKERS") {
        const query = { role: "WORKER" };
        if (filters.company) query.company = filters.company;
        cursor = User.find(query).populate("company", "name").lean().cursor();
        headers = [
          { id: "name", title: "Name" },
          { id: "phone", title: "Phone" },
          { id: "companyName", title: "Company Name" },
          { id: "status", title: "Status" },
          { id: "createdAt", title: "Registered At" },
        ];
        mapper = (doc) => ({
          name: doc.name,
          phone: doc.phone,
          companyName: doc.company ? doc.company.name : "N/A",
          status: doc.status,
          createdAt: doc.createdAt ? doc.createdAt.toISOString() : "",
        });
      } else if (reportType === "TRANSACTIONS") {
        const query = {};
        if (filters.type) query.type = filters.type;
        cursor = WalletTransaction.find(query).lean().cursor();
        headers = [
          { id: "amount", title: "Amount" },
          { id: "type", title: "Type" },
          { id: "status", title: "Status" },
          { id: "createdAt", title: "Date" },
        ];
        mapper = (doc) => ({
          amount: doc.amount,
          type: doc.type,
          status: doc.status,
          createdAt: doc.createdAt ? doc.createdAt.toISOString() : "",
        });
      } else {
        throw new Error("Unsupported Report Type");
      }

      // Generate File Incrementally
      if (format === "CSV") {
        await this._generateCSV(filePath, headers, cursor, mapper);
      } else if (format === "EXCEL") {
        await this._generateExcel(filePath, headers, cursor, mapper, reportType);
      } else if (format === "PDF") {
        await this._generatePDF(filePath, headers, cursor, mapper, reportType);
      }

      const stats = fs.statSync(filePath);
      
      job.status = "COMPLETED";
      job.generatedFile = filePath;
      job.fileSize = stats.size;
      job.completedAt = new Date();
      await job.save();

    } catch (error) {
      job.status = "FAILED";
      job.failureReason = error.message;
      job.completedAt = new Date();
      await job.save();
    }
  }

  async _generateCSV(filePath, headers, cursor, mapper) {
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: headers,
    });
    
    let records = [];
    for await (const doc of cursor) {
      records.push(mapper(doc));
      if (records.length >= 500) { // Batch write to save RAM
        await csvWriter.writeRecords(records);
        records = [];
      }
    }
    if (records.length > 0) {
      await csvWriter.writeRecords(records);
    }
  }

  async _generateExcel(filePath, headers, cursor, mapper, sheetName) {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      filename: filePath,
      useStyles: true
    });
    const worksheet = workbook.addWorksheet(sheetName);
    
    worksheet.columns = headers.map(h => ({ header: h.title, key: h.id, width: 20 }));

    for await (const doc of cursor) {
      worksheet.addRow(mapper(doc)).commit();
    }

    worksheet.commit();
    await workbook.commit();
  }

  async _generatePDF(filePath, headers, cursor, mapper, title) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      doc.fontSize(16).text(`Report: ${title}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10);

      // Very rudimentary PDF table logic just to satisfy PDF requirement safely without memory blows
      let y = doc.y;
      headers.forEach((h, i) => {
        doc.text(h.title, 30 + (i * 100), y);
      });
      doc.moveDown();
      
      const processDocs = async () => {
        for await (const dbDoc of cursor) {
          const row = mapper(dbDoc);
          let y = doc.y;
          if (y > 750) {
            doc.addPage();
            y = 50;
          }
          headers.forEach((h, i) => {
            doc.text(String(row[h.id] || ""), 30 + (i * 100), y, { width: 90, lineBreak: false });
          });
          doc.moveDown();
        }
      };

      processDocs()
        .then(() => {
          doc.end();
        })
        .catch(reject);

      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }
}

module.exports = new ExportService();
