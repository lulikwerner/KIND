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

  const [bikeApiError, setBikeApiError] = useState("");


  /* =========================================================
     CHECK BIKE AVAILABILITY
  ========================================================= */

  const checkBikeAvailability = async () => {

    try {

      setCheckingBikes(true);
      setBikeApiError("");


      console.log("🚲 Checking bike availability...");


      /*
        If your backend uses:

        app.use("/", registerRouter)

        leave this as:
        /bike-availability


        If your backend uses:

        app.use("/api", registerRouter)

        change this to:
        /api/bike-availability
      */

      const res = await fetch("/bike-availability");


      console.log(
        "🚲 Bike availability HTTP status:",
        res.status
      );


      if (!res.ok) {

        throw new Error(
          `Bike availability request failed with status ${res.status}`
        );

      }


      const data = await res.json();


      console.log(
        "🚲 Bike availability response:",
        data
      );


      setBikesAvailable(
        data.available === true
      );


      setRemainingBikes(
        typeof data.remaining === "number"
          ? data.remaining
          : 0
      );


      /*
        If all bikes are gone,
        make sure the form cannot retain an old selection.
      */

      if (data.available !== true) {

        setForm((currentForm) => ({
          ...currentForm,
          need_bike: false
        }));

      }

    } catch (error) {

      console.error(
        "❌ Unable to check bike availability:",
        error
      );


      setBikeApiError(
        error.message ||
        "Unable to check bike availability."
      );


      /*
        Safer behavior:
        If we cannot verify bike availability,
        don't allow a bike reservation.
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
     CHECK BIKE AVAILABILITY ON PAGE LOAD
  ========================================================= */

  useEffect(() => {

    checkBikeAvailability();

  }, []);


  /* =========================================================
     HANDLE FORM FIELD CHANGES
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
  ========================================================= */

  const handleSubmit = (e) => {

    e.preventDefault();

    setShowWaiver(true);

  };


  /* =========================================================
     SUBMIT TO DATABASE
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
        "📤 Registration payload:",
        payload
      );


      const res = await fetch("/register", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)

      });


      const data = await res.json();


      console.log(
        "📥 Registration response:",
        data
      );


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
          Recheck bikes in case the last bike
          was just taken by another person.
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
        Update the available-bike count.
      */

      await checkBikeAvailability();

    } catch (error) {

      console.error(
        "❌ Registration error:",
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

    <>

      <Header />


      <main
        style={{
          maxWidth: "400px",
          margin: "40px auto 80px",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          fontFamily: "Arial, sans-serif"
        }}
      >


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
              RIDING FOR
          =================================================== */}

          <div>

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
              TEMPORARY BIKE DEBUG
          =================================================== */}

          <div
            style={{
              padding: "12px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffe69c",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >

            <strong>Bike Debug</strong>

            <br />

            checkingBikes:
            {" "}
            {String(checkingBikes)}

            <br />

            bikesAvailable:
            {" "}
            {String(bikesAvailable)}

            <br />

            remainingBikes:
            {" "}
            {remainingBikes}

            <br />

            {bikeApiError && (
              <>
                API Error:
                {" "}
                {bikeApiError}
              </>
            )}

          </div>


          {/* ===================================================
              CHECKING AVAILABILITY
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
              BIKE AVAILABLE
          =================================================== */}

          {!checkingBikes && bikesAvailable && (

            <div
              style={{
                marginBottom: "10px",
                padding: "15px",
                backgroundColor: "#f7f7f7",
                borderRadius: "8px",
                border: "1px solid #ddd"
              }}
            >

              <label
                htmlFor="need_bike"
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "10px"
                }}
              >
                Need a Bike?
              </label>


              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >

                <input
                  id="need_bike"
                  name="need_bike"
                  type="checkbox"
                  checked={form.need_bike}
                  onChange={handleChange}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer"
                  }}
                />


                <label
                  htmlFor="need_bike"
                  style={{
                    cursor: "pointer"
                  }}
                >
                  Yes, I need a City-provided bike.
                </label>

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
              NO BIKES AVAILABLE
          =================================================== */}

          {!checkingBikes && !bikesAvailable && !bikeApiError && (

            <p
              style={{
                padding: "12px",
                margin: 0,
                backgroundColor: "#f5f5f5",
                borderRadius: "6px",
                color: "#555",
                fontSize: "14px"
              }}
            >
              All City-provided bikes have been reserved.
            </p>

          )}


          {/* ===================================================
              REGISTER BUTTON
          =================================================== */}

          <button
            type="submit"
            className="register-btn"
          >
            Register
          </button>

        </form>

      </main>


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
                  In consideration of being able to participate in
                  K.I.N.D. BIKE RIDE (hereinafter referred to as
                  THE ACTIVITY) sponsored by the City of Tamarac,
                  Florida, held on October 17, 2026, I hereby
                  RELEASE, WAIVE, DISCHARGE, COVENANT NOT TO SUE
                  AND HOLD HARMLESS: the City of Tamarac, its
                  officials, employees, agents, volunteers,
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
                  I hereby elect to voluntarily participate in THE
                  ACTIVITY knowing that certain risks of harm are
                  or may be inherent in THE ACTIVITY and that THE
                  ACTIVITY may be hazardous to me and my property.
                  I agree to abide by all applicable laws, bike
                  safety protocols including wearing a bike helmet
                  and maintaining control of my bicycle at all
                  times to prevent harm to myself and other riders.
                </li>

                <li>
                  I further hereby AGREE TO INDEMNIFY AND HOLD
                  HARMLESS the RELEASEES from any loss, liability,
                  damage, demands, liens, liabilities, judgments
                  or costs, including court costs and attorney
                  fees, that they may incur due to my participation
                  in THE ACTIVITY.
                </li>

                <li>
                  It is my express intent that this Release and
                  Hold Harmless Agreement shall bind the members of
                  my family and spouse, if I am alive, and my heirs,
                  personal representatives, executors and assigns,
                  if I am deceased.
                </li>

                <li>
                  I understand while participating in THE ACTIVITY,
                  I may be photographed. I agree to allow my photo,
                  video, or film likeness to be used for any
                  legitimate purpose the RELEASEES decide.
                </li>

              </ol>


              <p>
                IN SIGNING THIS RELEASE, I ACKNOWLEDGE AND REPRESENT
                THAT I have read the foregoing Waiver of Liability
                and Hold Harmless Agreement, understand it and sign
                it voluntarily; I am at least eighteen (18) years
                of age and fully competent; and I execute the
                Release fully intending to be bound by same.
              </p>

            </div>


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

    </>

  );

}


export default App;