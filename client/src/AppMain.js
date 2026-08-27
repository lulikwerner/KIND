import { useEffect, useState } from "react";

import Footer from "./components/Footer";
import Header from "./components/Header";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";


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
     BIKE AVAILABILITY STATE
  ========================================================= */

  const [bikesAvailable, setBikesAvailable] = useState(false);

  const [remainingBikes, setRemainingBikes] = useState(0);

  const [checkingBikes, setCheckingBikes] = useState(true);


  /* =========================================================
     CHECK BIKE AVAILABILITY
  ========================================================= */

  const checkBikeAvailability = async () => {

    try {

      setCheckingBikes(true);

      const res = await fetch("/bike-availability");

      if (!res.ok) {
        throw new Error("Unable to check bike availability.");
      }

      const data = await res.json();

      setBikesAvailable(data.available === true);

      setRemainingBikes(
        typeof data.remaining === "number"
          ? data.remaining
          : 0
      );


      /*
        If bikes have become unavailable while the user
        still has the checkbox selected, remove the selection.
      */

      if (!data.available) {

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
        Safer behavior:
        If we cannot confirm inventory, do not offer a bike.
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
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked
    } = e.target;


    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));

  };


  /* =========================================================
     INITIAL FORM SUBMIT

     Do not immediately send the registration.
     First show the waiver.
  ========================================================= */

  const handleSubmit = (e) => {

    e.preventDefault();

    setShowWaiver(true);

  };


  /* =========================================================
     SUBMIT REGISTRATION TO DATABASE
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


      const res = await fetch("/register", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)

      });


      const data = await res.json();


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
          Re-check availability.

          This is especially useful if somebody else reserved
          the fourth bike while this user had the page open.
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
        Refresh bike availability after every successful
        registration.

        If this registration reserved the fourth bike,
        the checkbox will disappear immediately.
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
            INTRO MESSAGE
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
              border: "1px solid #ccc"
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
              border: "1px solid #ccc"
            }}
          />

        </div>


        {/* ===================================================
            DATE OF BIRTH
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
              WebkitAppearance: "none"
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
              border: "1px solid #ccc"
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
              border: "1px solid #ccc"
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
              border: "1px solid #ccc"
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
              marginTop: "8px"
            }}
          />

        </div>


        {/* ===================================================
            BIKE AVAILABILITY
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

            <label
              htmlFor="need_bike"
              style={{
                fontWeight: "bold",
                display: "block"
              }}
            >
              Need a Bike?
            </label>


            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "8px"
              }}
            >

              <input
                id="need_bike"
                type="checkbox"
                name="need_bike"
                checked={form.need_bike}
                onChange={handleChange}
                style={{
                  transform: "scale(1.3)"
                }}
              />


              <span>
                Yes, I need a City-provided bike.
              </span>

            </div>


            <p
              style={{
                marginTop: "10px",
                marginBottom: 0,
                fontSize: "14px",
                color: "#555"
              }}
            >
              {remainingBikes === 1
                ? "1 bike is currently available."
                : `${remainingBikes} bikes are currently available.`}
            </p>

          </div>

        )}


        {/* ===================================================
            OPTIONAL MESSAGE WHILE CHECKING
        =================================================== */}

        {checkingBikes && (

          <p
            style={{
              fontSize: "14px",
              color: "#666",
              margin: 0
            }}
          >
            Checking bike availability...
          </p>

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
                  setWaiverAccepted(e.target.checked)
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