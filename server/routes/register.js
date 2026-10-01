const express = require("express");

const router = express.Router();

const db = require("../db");
const transporter = require("../email");

require("dotenv").config();


/* =========================================================
   BIKE SETTINGS
========================================================= */

const TOTAL_BIKES = 4;


/* =========================================================
   GET BIKE AVAILABILITY
========================================================= */

router.get("/bike-availability", (req, res) => {

  const bikeCountSql = `
    SELECT COUNT(*) AS bikeCount
    FROM users
    WHERE need_bike = 1
  `;

  db.query(bikeCountSql, (err, results) => {

    if (err) {

      return res.status(500).json({
        success: false,
        available: false,
        remaining: 0,
        message: "Unable to check bike availability."
      });

    }


    const usedBikes =
      Number(results[0].bikeCount) || 0;


    const remainingBikes =
      Math.max(TOTAL_BIKES - usedBikes, 0);


    return res.json({
      success: true,
      total: TOTAL_BIKES,
      used: usedBikes,
      remaining: remainingBikes,
      available: remainingBikes > 0
    });

  });

});


/* =========================================================
   REGISTER
========================================================= */

router.post("/register", (req, res) => {

  try {

    const {
      firstName,
      lastName,
      dob,
      address,
      email,
      phone,
      waiverAccepted,
      waiverTimestamp,
      riding_for,
      need_bike,
      shirt_size
    } = req.body;


    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (
      !firstName ||
      !lastName ||
      !dob ||
      !address ||
      !email ||
      !phone
    ) {

      return res.status(400).json({
        success: false,
        message: "Please complete all required fields."
      });

    }


    /* =====================================================
       SHIRT SIZE VALIDATION
    ===================================================== */

    const validShirtSizes = [
      "S",
      "M",
      "L",
      "XL"
    ];


    if (!validShirtSizes.includes(shirt_size)) {

      return res.status(400).json({
        success: false,
        message: "Please select a valid shirt size."
      });

    }


    /* =====================================================
       REGISTRATION TIMESTAMP
    ===================================================== */

    const registrationTimestamp = new Date();

    const year = new Date().getFullYear();


    /*
      Change this date for each K.I.N.D. event.
    */

    const cutoffDate =
      `${year}-08-20 12:00:00`;


    /* =====================================================
       WAIVER VALIDATION
    ===================================================== */

    if (
      !waiverAccepted ||
      !waiverTimestamp
    ) {

      return res.status(400).json({
        success: false,
        message:
          "You must accept the waiver before registering."
      });

    }


    /* =====================================================
       CHECK FOR DUPLICATE REGISTRATION
    ===================================================== */

    const checkSql = `
      SELECT *
      FROM users
      WHERE email = ?
        AND waiver_timestamp IS NOT NULL
        AND waiver_timestamp >= ?
    `;


    db.query(
      checkSql,
      [
        email,
        cutoffDate
      ],
      (err, results) => {

        if (err) {

          return res.status(500).json({
            success: false,
            message: "Database error"
          });

        }


        /* =================================================
           ALREADY REGISTERED
        ================================================= */

        if (results.length > 0) {

          return res.status(400).json({
            success: false,
            message:
              "Thank you for your interest. It looks like you’re already signed up for this event."
          });

        }


        /* =================================================
           NO BIKE NEEDED
        ================================================= */

        if (!need_bike) {

          return insertRegistration();

        }


        /* =================================================
           CHECK BIKE AVAILABILITY
        ================================================= */

        const bikeCountSql = `
          SELECT COUNT(*) AS bikeCount
          FROM users
          WHERE need_bike = 1
        `;


        db.query(
          bikeCountSql,
          (bikeErr, bikeResults) => {

            if (bikeErr) {

              return res.status(500).json({
                success: false,
                message:
                  "Unable to verify bike availability."
              });

            }


            const usedBikes =
              Number(
                bikeResults[0].bikeCount
              ) || 0;


            /* =============================================
               ALL BIKES RESERVED
            ============================================= */

            if (usedBikes >= TOTAL_BIKES) {

              return res.status(409).json({
                success: false,
                message:
                  "We're sorry, all City-provided bikes have already been reserved."
              });

            }


            /* =============================================
               BIKE AVAILABLE
            ============================================= */

            return insertRegistration();

          }
        );


        /* =================================================
           INSERT REGISTRATION
        ================================================= */

        function insertRegistration() {

          const insertSql = `
            INSERT INTO users
            (
              first_name,
              last_name,
              dob,
              address,
              email,
              phone,
              waiver_accepted,
              waiver_timestamp,
              registration_timestamp,
              riding_for,
              need_bike,
              shirt_size
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;


          const insertValues = [
            firstName,
            lastName,
            dob,
            address,
            email,
            phone,
            waiverAccepted ? 1 : 0,
            waiverTimestamp,
            registrationTimestamp,
            riding_for || "",
            need_bike ? 1 : 0,
            shirt_size
          ];


          db.query(
            insertSql,
            insertValues,
            (insertErr) => {

              if (insertErr) {

                return res.status(500).json({
                  success: false,
                  message:
                    "Database insert error"
                });

              }


              /* ===========================================
                 SEND CONFIRMATION EMAIL
              =========================================== */

              const mailOptions = {

                from:
                  process.env.EMAIL_FROM,

                to: email,

                subject:
                  "Thank you for registering for the K.I.N.D. Ride event!",


                text: `Hello ${firstName},

Thank you for signing up!

Please arrive by 8:00 AM. The ride will begin promptly at 8:30 AM.

Event Date: October 17, 2026
Location: Tamarac Sports Complex
Address: 9901 NW 77th St, Tamarac, FL 33321

Shirt Size: ${shirt_size}

We look forward to seeing you there!`,


                html: `
                  <p>
                    Hello <strong>${firstName}</strong>,
                  </p>

                  <p>
                    Thank you for signing up!
                  </p>

                  <p>
                    Please arrive by
                    <strong>8:00 AM</strong>.
                    <br>
                    The ride will begin promptly at
                    <strong>8:30 AM</strong>.
                  </p>

                  <p>
                    <strong>📅 Event Date:</strong>
                    October 17, 2026
                    <br>

                    <strong>📍 Location:</strong>
                    Tamarac Sports Complex
                    <br><br>

                    <a
                      href="https://www.google.com/maps?q=9901+NW+77th+St,+Tamarac,+FL+33321"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      9901 NW 77th St,
                      Tamarac, FL 33321
                    </a>
                  </p>

                  <p>
                    <strong>Shirt Size:</strong>
                    ${shirt_size}
                  </p>

                  <p>
                    We look forward to seeing you there!
                  </p>
                `

              };


              transporter.sendMail(
                mailOptions,
                () => {
                  /*
                    Email errors are intentionally
                    not written to the console.
                  */
                }
              );


              /* ===========================================
                 SUCCESS
              =========================================== */

              return res.json({
                success: true,
                message:
                  "User registered successfully"
              });

            }
          );

        }

      }
    );


  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Internal server error"
    });

  }

});


module.exports = router;