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


module.exports = router;

