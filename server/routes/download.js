
const express = require("express");
const router = express.Router();

const path = require("path");
const db = require(path.join(__dirname, "..", "db"));
const ExcelJS = require("exceljs");

// Require a valid admin session
function requireAdmin(req, res, next) {
  if (!req.session || req.session.isAdmin !== true) {
    return res.status(401).json({
      ok: false,
      message: "Unauthorized. Please log in."
    });
  }

  next();
}

// Protected Excel download
router.get("/download", requireAdmin, async (req, res) => {
  try {
    const fromDate = req.query.from;

    if (
      typeof fromDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fromDate) ||
      Number.isNaN(Date.parse(fromDate))
    ) {
      return res.status(400).json({
        ok: false,
        message: "A valid 'from' date (YYYY-MM-DD) is required."
      });
    }

    const sql = `
      SELECT *
      FROM users
      WHERE registration_timestamp > ?
    `;

    db.query(sql, [fromDate], async (err, results) => {
      if (err) {
        console.error("MySQL SELECT error:", err);
        return res.status(500).json({
          ok: false,
          message: "Database error"
        });
      }

      try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Registrations");

        // Preserve existing export fields
        if (results.length > 0) {
          sheet.columns = Object.keys(results[0]).map((key) => ({
            header: key,
            key,
            width: 20
          }));

          results.forEach((row) => {
            sheet.addRow(row);
          });
        }

        const today = new Date().toISOString().split("T")[0];
        const filename = `KIND-${today}.xlsx`;

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );

        res.setHeader("Cache-Control", "no-store");

        await workbook.xlsx.write(res);
        res.end();
      } catch (error) {
        console.error("Excel generation error:", error);

        if (!res.headersSent) {
          return res.status(500).json({
            ok: false,
            message: "Error generating Excel file"
          });
        }

        res.destroy(error);
      }
    });
  } catch (error) {
    console.error("Download error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        ok: false,
        message: "Error generating file"
      });
    }
  }
});

module.exports = router;

/*

const express = require("express");
const router = express.Router();

const path = require("path");
const db = require(path.join(__dirname, "..", "db"));

const ExcelJS = require("exceljs");


router.get("/download", async (req, res) => {
  try {
    // 1. Read date from frontend
    const fromDate = req.query.from;

    if (!fromDate) {
      return res.status(400).send("Missing 'from' date");
    }

    // 2. Query MySQL using the dynamic date
    const sql = `
      SELECT *
      FROM users
      WHERE registration_timestamp > ?
    `;

    db.query(sql, [fromDate], async (err, results) => {
      if (err) {
        console.error("❌ MySQL SELECT error:", err);
        return res.status(500).send("Server error");
      }

      // 3. Create Excel
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Registrations");

      // 4. Add headers dynamically
      sheet.columns = Object.keys(results[0] || {}).map((key) => ({
        header: key,
        key: key,
        width: 20
      }));

      // 5. Add rows
      results.forEach((row) => sheet.addRow(row));

      // 6. Dynamic filename
      const today = new Date().toISOString().split("T")[0];
      const filename = `KIND-${today}.xlsx`;

      // 7. Send file
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

      await workbook.xlsx.write(res);
      res.end();
    });
  } catch (error) {
    console.error("❌ Download error:", error);
    res.status(500).send("Error generating file");
  }
});


module.exports = router;*/

