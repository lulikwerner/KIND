import { useEffect, useState } from "react";

import Footer from "./components/Footer";
import Header from "./components/Header";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";


/*
=========================================================
API ADDRESS

If the Node/Express server is available on the same
registerkind.tamarac.gov domain, you do not need to
set anything.

If the API is on another address/port, set:

REACT_APP_API_URL=https://your-api-address

in the React production environment.
=========================================================
*/

const API_BASE = process.env.REACT_APP_API_URL || "";


function App() {

  /* =========================================================
     FORM STATE
  ========================================================= */

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    address: "",
    email: "",
    phone: "",
    riding_for: "",
    need_bike: false
  });


  /* =========================================================
     WAIVER STATE
  ========================================================= */

  const [showWaiver, setShowWaiver] = useState(false);

  const [waiverAccepted, setWaiverAccepted] = useState(false);

  const [waiverTimestamp, setWaiverTimestamp] = useState(null);


  /* =========================================================
     BIKE AVAILABILITY
  ========================================================= */

  const [checkingBikes, setCheckingBikes] = useState(true);

  const [bikesAvailable, setBikesAvailable] = useState(false);

  const [remainingBikes, setRemainingBikes] = useState(0);


  /* =========================================================
     CHECK BIKE AVAILABILITY
  ========================================================= */

  const checkBikeAvailability = async () => {

    try {

      setCheckingBikes(true);


      const response = await fetch(
        `${API_BASE}/bike-availability`,
        {
          method: "GET",
          headers: {
            Accept: "application/json"
          }
        }
      );


      if (!response.ok) {

        throw new Error(
          `Bike availability request failed: ${response.status}`
        );

      }


      /*
        Check that we actually received JSON.

        This prevents the "<!doctype html>" error you were
        receiving when the request reached the React page
        instead of Express.
      */

      const contentType =
        response.headers.get("content-type") || "";


      if (!contentType.includes("application/json")) {

        const responseText = await response.text();

        console.error(
          "Bike availability returned non-JSON:",
          responseText
        );

        throw new Error(
          "Bike availability endpoint did not return JSON."
        );

      }


      const data = await response.json();


      console.log(
        "Bike availability:",
        data
      );


      const remaining =
        Number(data.remaining) || 0;


      setRemainingBikes(remaining);


      setBikesAvailable(
        data.available === true &&
        remaining > 0
      );


      /*
        If no bikes are available, force need_bike
        back to false.
      */

      if (
        data.available !== true ||
        remaining <= 0
      ) {

        setForm((currentForm) => ({
          ...currentForm,
          need_bike: false
        }));

      }

    } catch (error) {

      console.error(
        "Unable to check bike availability:",
        error
      );


      /*
        If availability cannot be verified,
        do not allow bike selection.
      */

      setBikesAvailable(false);

      setRemainingBikes(0);


      setForm((currentForm) => ({
        ...currentForm,
        need_bike: false
      }));

    } finally {

      setCheckingBikes(false);

    }

  };


  /* =========================================================
     CHECK BIKES WHEN PAGE LOADS
  ========================================================= */

  useEffect(() => {

    checkBikeAvailability();

  }, []);


  /* =========================================================
     HANDLE INPUT CHANGES
  ========================================================= */

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));

  };


  /* =========================================================
     HANDLE NEED BIKE RADIO
  ========================================================= */

  const handleBikeChange = (needsBike) => {

    setForm((currentForm) => ({
      ...currentForm,
      need_bike: needsBike
    }));

  };


  /* =========================================================
     FORM SUBMISSION

     First show waiver.
  ========================================================= */

  const handleSubmit = (e) => {

    e.preventDefault();

    setShowWaiver(true);

  };


  /* =========================================================
     SEND REGISTRATION TO DATABASE
  ========================================================= */

  const submitToDatabase = async (
    accepted,
    timestamp
  ) => {

    try {

      const payload = {

        ...form,

        waiverAccepted: accepted,

        waiverTimestamp: timestamp

      };


      console.log(
        "Registration payload:",
        payload
      );


      const response = await fetch(
        `${API_BASE}/register`,
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(payload)

        }
      );


      const data = await response.json();


      /* =====================================================
         REGISTRATION FAILED
      ===================================================== */

      if (!data.success) {

        toast.error(
          data.message ||
          "Unable to complete the registration.",
          {
            position: "top-center",
            autoClose: 4000
          }
        );


        /*
          Somebody may have taken the last available bike
          while this person was completing the form.
        */

        await checkBikeAvailability();

        return;

      }


      /* =====================================================
         SUCCESS
      ===================================================== */

      toast.success(
        "The user has been registered",
        {
          position: "top-center",
          autoClose: 3000
        }
      );


      /* =====================================================
         RESET FORM
      ===================================================== */

      setForm({
        firstName: "",
        lastName: "",
        dob: "",
        address: "",
        email: "",
        phone: "",
        riding_for: "",
        need_bike: false
      });


      setWaiverAccepted(false);

      setWaiverTimestamp(null);


      /*
        Recount bikes.

        If this person reserved bike #4,
        the Need a Bike field will now disappear.
      */

      await checkBikeAvailability();

    } catch (error) {

      console.error(
        "Registration error:",
        error
      );


      toast.error(
        "There was a problem completing your registration. Please try again.",
        {
          position: "top-center",
          autoClose: 4000
        }
      );

    }

  };


  /* =========================================================
     ACCEPT WAIVER
  ========================================================= */

  const handleWaiverAccept = () => {

    if (!waiverAccepted) {

      toast.error(
        "You must agree to the waiver before completing your registration.",
        {
          position: "top-center",
          autoClose: 3000
        }
      );

      return;

    }


    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");


    setWaiverTimestamp(timestamp);

    setShowWaiver(false);


    submitToDatabase(
      true,
      timestamp
    );

  };


  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div
      style={{
        maxWidth: 400,
        margin: "450px auto 0",
        paddingBottom: "120px",
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        fontFamily: "Arial, sans-serif"
      }}
    >

      <Header />


      {/* =====================================================
          REGISTRATION FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          width: "100%"
        }}
      >


        {/* ===================================================
            INTRO
        =================================================== */}

        <p
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "20px"
          }}
        >

          Join us for the K.I.N.D. Ride for Miles as we cycle
          through Tamarac’s neighborhoods, promoting positivity,
          supporting local businesses, and fostering a spirit of
          kindness, connection, and respect within our community.

          <br />
          <br />

          In recognition of Breast Cancer Awareness Month, this
          month’s ride honors the strength and courage of those
          who have experienced breast cancer. We ride in support
          of survivors, in remembrance of those we have lost,
          and in honor of the loved ones whose journeys have
          touched our lives.

        </p>


        {/* ===================================================
            FIRST NAME
        =================================================== */}

        <div>

          <label
            htmlFor="firstName"
            style={{
              fontWeight: "bold"
            }}
          >
            First Name
          </label>

          <input
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box"
            }}
          />

        </div>


        {/* ===================================================
            LAST NAME
        =================================================== */}

        <div>

          <label
            htmlFor="lastName"
            style={{
              fontWeight: "bold"
            }}
          >
            Last Name
          </label>

          <input
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box"
            }}
          />

        </div>


        {/* ===================================================
            DOB
        =================================================== */}

        <div>

          <label
            htmlFor="dob"
            style={{
              fontWeight: "bold"
            }}
          >
            Date of Birth
          </label>

          <input
            id="dob"
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              minHeight: "18px",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "white",
              WebkitAppearance: "none",
              boxSizing: "border-box"
            }}
          />

        </div>


        {/* ===================================================
            ADDRESS
        =================================================== */}

        <div>

          <label
            htmlFor="address"
            style={{
              fontWeight: "bold"
            }}
          >
            Address
          </label>

          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box"
            }}
          />

        </div>


        {/* ===================================================
            EMAIL
        =================================================== */}

        <div>

          <label
            htmlFor="email"
            style={{
              fontWeight: "bold"
            }}
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box"
            }}
          />

        </div>


        {/* ===================================================
            PHONE
        =================================================== */}

        <div>

          <label
            htmlFor="phone"
            style={{
              fontWeight: "bold"
            }}
          >
            Phone Number
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box"
            }}
          />

        </div>


        {/* ===================================================
            RIDING IN HONOR / MEMORY OF
        =================================================== */}

        <div
          style={{
            marginBottom: "25px"
          }}
        >

          <label
            htmlFor="riding_for"
            style={{
              fontWeight: "bold"
            }}
          >

            Please leave the name of the person you are riding
            in honor or memory of:

          </label>


          <input
            id="riding_for"
            name="riding_for"
            value={form.riding_for}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: "8px",
              boxSizing: "border-box"
            }}
          />

        </div>




        {/* ===================================================
            NEED A BIKE

            THIS WHOLE SECTION ONLY EXISTS WHILE
            AT LEAST ONE OF THE FOUR BIKES IS AVAILABLE.
        =================================================== */}

        {!checkingBikes && bikesAvailable && (

          <div
            style={{
              marginBottom: "25px",
              padding: "15px",
              backgroundColor: "#f7f7f7",
              borderRadius: "8px",
              border: "1px solid #ddd"
            }}
          >

            <fieldset
              style={{
                border: 0,
                padding: 0,
                margin: 0
              }}
            >

              <legend
                style={{
                  fontWeight: "bold",
                  marginBottom: "10px"
                }}
              >
                Need a Bike?
              </legend>


              {/* YES */}

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  marginRight: "25px",
                  cursor: "pointer"
                }}
              >

                <input
                  type="radio"
                  name="need_bike"
                  value="yes"
                  checked={form.need_bike === true}
                  onChange={() =>
                    handleBikeChange(true)
                  }
                />

                Yes

              </label>


              {/* NO */}

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >

                <input
                  type="radio"
                  name="need_bike"
                  value="no"
                  checked={form.need_bike === false}
                  onChange={() =>
                    handleBikeChange(false)
                  }
                />

                No

              </label>


       

            </fieldset>

          </div>

        )}


        {/* ===================================================
            REGISTER
        =================================================== */}

        <button
          type="submit"
          className="register-btn"
        >
          Register
        </button>

      </form>


      {/* =====================================================
          WAIVER MODAL
      ===================================================== */}

      {showWaiver && (

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >

          <div
            style={{
              background: "white",
              width: "90%",
              maxWidth: "450px",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
            }}
          >

            <h2>
              K.I.N.D. Ride for Miles Waiver Agreement
            </h2>


            <h3
              style={{
                textAlign: "center"
              }}
            >
              Assumption of Risk, Waiver and Hold Harmless
            </h3>


            <div
              style={{
                height: "180px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "15px"
              }}
            >

              <ol>

                <li>

                  In consideration of being able to participate
                  in K.I.N.D. BIKE RIDE (hereinafter referred to
                  as THE ACTIVITY) sponsored by the City of
                  Tamarac, Florida, held on October 17, 2026, I
                  hereby RELEASE, WAIVE, DISCHARGE, COVENANT NOT
                  TO SUE AND HOLD HARMLESS: the City of Tamarac,
                  its officials, employees, agents, volunteers,
                  invitees and assigns of the City of Tamarac
                  (hereinafter referred to as RELEASEES) from any
                  and all liability, claims, demands, actions,
                  judgments, costs, expenses, court costs,
                  attorney fees and causes of action whatsoever
                  arising out of or related to any loss, damage,
                  or injury, including death, that may be
                  sustained by me, or any property belonging to
                  me, whether caused by THE ACTIVITY, including,
                  but not limited to SOLE, CONTRIBUTORY OR GROSS
                  NEGLIGENCE OF THE RELEASEES, or otherwise,
                  while participating in THE ACTIVITY.

                </li>


                <li>

                  I hereby elect to voluntarily participate in
                  THE ACTIVITY knowing that certain risks of harm
                  are or may be inherent in THE ACTIVITY and that
                  THE ACTIVITY may be hazardous to me and my
                  property. I agree to abide by all applicable
                  laws, bike safety protocols including wearing a
                  bike helmet and maintaining control of my
                  bicycle at all times to prevent harm to myself
                  and other riders and I understand I am subject
                  to immediate removal from THE ACTIVITY if I do
                  not comply. I VOLUNTARILY ASSUME FULL
                  RESPONSIBILITY FOR ANY RISKS OF LOSS, PROPERTY
                  DAMAGE OR PERSONAL INJURY, INCLUDING DEATH,
                  that may be sustained by me, or any loss or
                  damage to property owned by me, as a result of
                  being engaged in THE ACTIVITY, WHETHER CAUSED
                  BY, but not limited to, the SOLE, CONTRIBUTORY
                  OR GROSS NEGLIGENCE OF RELEASEES.

                </li>


                <li>

                  I further hereby AGREE TO INDEMNIFY AND HOLD
                  HARMLESS the RELEASEES from any loss,
                  liability, damage, demands, liens, liabilities,
                  judgments or costs, including court costs and
                  attorney fees, that they may incur due to my
                  participation in THE ACTIVITY, WHETHER CAUSED
                  BY OR CONTRIBUTED TO IN WHOLE OR PART by any
                  action or failure to act, negligence, breach
                  of contract, or other misconduct on the part
                  of RELEASEES or otherwise.

                </li>


                <li>

                  It is my express intent that this Release and
                  Hold Harmless Agreement shall bind the members
                  of my family and spouse, if I am alive, and my
                  heirs, personal representatives, executors and
                  assigns, if I am deceased, and shall be deemed
                  as a RELEASE, WAIVER, DISCHARGE AND COVENANT
                  NOT TO SUE the above named RELEASEES. I hereby
                  further agree that this Waiver of Liability and
                  Hold Harmless Agreement shall be construed in
                  accordance with the laws of the State of
                  Florida. If any portion of this Agreement is
                  held to be invalid, it is agreed that the
                  balance shall, notwithstanding, continue in
                  full legal force and effect.

                </li>


                <li>

                  I understand while participating in THE
                  ACTIVITY, I may be photographed. I agree to
                  allow my photo, video, or film likeness to be
                  used for any legitimate purpose the RELEASEES
                  decide, and assigns.

                </li>

              </ol>


              <p>

                IN SIGNING THIS RELEASE, I ACKNOWLEDGE AND
                REPRESENT THAT I have read the foregoing Waiver
                of Liability and Hold Harmless Agreement,
                understand it and sign it voluntarily; I am at
                least eighteen (18) years of age and fully
                competent; and I execute the Release for full,
                adequate and complete consideration fully
                intending to be bound by same.

              </p>

            </div>


            {/* =================================================
                WAIVER CHECKBOX
            ================================================= */}

            <label
              style={{
                display: "block",
                marginBottom: "15px"
              }}
            >

              <input
                type="checkbox"
                checked={waiverAccepted}
                onChange={(e) =>
                  setWaiverAccepted(
                    e.target.checked
                  )
                }
              />

              {" "}

              I have read and agree to the terms of the waiver.

            </label>


            {/* =================================================
                ACCEPT
            ================================================= */}

            <button
              type="button"
              onClick={handleWaiverAccept}
              style={{
                padding: "10px 15px",
                background: "#007ACC",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginRight: "10px"
              }}
            >
              Accept and Continue
            </button>


            {/* =================================================
                CANCEL
            ================================================= */}

            <button
              type="button"
              onClick={() => {

                setShowWaiver(false);


                toast.error(
                  "You must agree to the waiver before completing your registration.",
                  {
                    position: "top-center",
                    autoClose: 3000
                  }
                );

              }}
              style={{
                padding: "10px 15px",
                background: "#ccc",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>

          </div>

        </div>

      )}


      <ToastContainer />

      <Footer />

    </div>

  );

}


export default App;