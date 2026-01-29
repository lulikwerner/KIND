import { useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    address: "",
    email: "",
    phone: ""
  });

  const [showWaiver, setShowWaiver] = useState(false);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
const [waiverTimestamp, setWaiverTimestamp] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Before submitting, show waiver modal
    setShowWaiver(true);
  };

  const submitToDatabase = async () => {
  const payload = {
    ...form,
    waiverAccepted,
    waiverTimestamp
  };

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!data.success) {
    toast.error(data.message, {
      position: "top-center",
      autoClose: 3000
    });
    return;
  }

  toast.success("The user has been registered", {
    position: "top-center",
    autoClose: 3000
  });

  // Reset form
  setForm({
    firstName: "",
    lastName: "",
    dob: "",
    address: "",
    email: "",
    phone: ""
  });

  setWaiverAccepted(false);
};


const handleWaiverAccept = () => {
  // Si no marcó el checkbox, no puede continuar
  if (!waiverAccepted) {
    toast.error("You must agree to the waiver before completing your registration.", {
      position: "top-center",
      autoClose: 3000
    });
    return;
  }

  // Crear timestamp
  const timestamp = new Date().toISOString();
  setWaiverTimestamp(timestamp);

  // Mostrar toast de aceptación
  toast.success("Waiver accepted. Completing your registration...", {
    position: "top-center",
    autoClose: 2000
  });

  // Cerrar modal
  setShowWaiver(false);

  // Enviar al backend
  submitToDatabase();
};


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

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "18px", width: "100%" }}
      >
        <div>
          <label style={{ fontWeight: "bold" }}>First Name</label>
          <input
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

        <div>
          <label style={{ fontWeight: "bold" }}>Last Name</label>
          <input
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

        <div>
          <label style={{ fontWeight: "bold" }}>Date of Birth</label>
          <input
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

        <div>
          <label style={{ fontWeight: "bold" }}>Address</label>
          <input
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

        <div>
          <label style={{ fontWeight: "bold" }}>Email</label>
          <input
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

        <div>
          <label style={{ fontWeight: "bold" }}>Phone Number</label>
          <input
            name="phone"
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

      <button
  type="button"
  className="register-btn"
  onClick={() => setShowWaiver(true)}
>
  Register
</button>

      </form>

      {/* WAIVER MODAL */}
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
            <h2>K.IN.D. Ride for Miles Waiver Agreement</h2>

            <div
              style={{
                height: "180px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "15px"
              }}
            >
              {/* Replace with your real waiver text */}
              <div>
        
<h3 style={{ textAlign: "center" }}>
  Assumption of Risk, Waiver and Hold Harmless
</h3>

<ol>
<li> In consideration of being able to participate in K.I.N.D. BIKE RIDE (hereinafter referred to as THE ACTIVITY) sponsored by the City of Tamarac, Florida, held on January 17, 2026, I hereby RELEASE, WAIVE, DISCHARGE, COVENANT NOT TO SUE AND HOLD HARMLESS: the City of Tamarac, its officials, employees, agents, volunteers, invitees and assigns of the City of Tamarac (hereinafter referred to as RELEASEES) from any and all liability, claims, demands, actions, judgments, costs, expenses, court costs, attorney fees and causes of action whatsoever arising out of or related to any loss, damage, or injury, including death, that may be sustained by me, or any property belonging to me, whether caused by THE ACTIVITY, including, but not limited to SOLE, CONTRIBUTORY OR GROSS NEGLIGENCE OF THE RELEASEES, or otherwise, while participating in THE ACTIVITY. 
</li>
<li>I hereby elect to voluntarily participate in THE ACTIVITY knowing that certain risks of harm are or may be inherent in THE ACTIVITY and that THE ACTIVITY may be hazardous to me and my property.  I agree to abide by all applicable laws, bike safety protocols including wearing a bike helmet and maintaining control of my bicycle at all times to prevent harm to myself and other riders and I understand I am subject to immediate removal from THE ACTIVITY if I do not comply.  I VOLUNTARILY ASSUME FULL RESPONSIBILITY FOR ANY RISKS OF LOSS, PROPERTY DAMAGE OR PERSONAL INJURY, INCLUDING DEATH, that may be sustained by me, or any loss or damage to property owned by me, as a result of being engaged in THE ACTIVITY, WHETHER CAUSED BY, but not limited to, the SOLE, CONTRIBUTORY OR GROSS NEGLIGENCE OF RELEASEES. 
</li>
<li> I further hereby AGREE TO INDEMNIFY AND HOLD HARMLESS the RELEASEES from any loss, liability, damage, demands, liens, liabilities, judgments or costs, including court costs and attorney fees, that they may incur due to my participation in THE ACTIVITY, WHETHER CAUSED BY OR CONTRIBUTED TO IN WHOLE OR PART by any action or failure to act, negligence, breach of contract, or other misconduct on the part of RELEASEES or otherwise. 
</li>
<li>It is my express intent that this Release and Hold Harmless Agreement shall bind the members of my family and spouse, if I am alive, and my heirs, personal representatives, executors and assigns, if I am deceased, and shall be deemed as a RELEASE, WAIVER, DISCHARGE AND COVENANT NOT TO SUE the above named RELEASEES.  I hereby further agree that this Waiver of Liability and Hold Harmless Agreement shall be construed in accordance with the laws of the State of Florida.  If any portion of this Agreement is held to be invalid, it is agreed that the balance shall, notwithstanding, continue in full legal force and effect. 
</li>
<li>I understand while participating in THE ACTIVITY, I may be photographed. I agree to allow my photo, video, or film likeness to be used for any legitimate purpose the RELEASEES decide, and assigns. 
</li>
 </ol>
<p>IN SIGNING THIS RELEASE, I ACKNOWLEDGE AND REPRESENT THAT I have read the foregoing Waiver of Liability and Hold Harmless Agreement, understand it and sign it voluntarily.; I am at least eighteen (18) years of age and fully competent; and I execute the Release For full, adequate and complete consideration fully intending to be bound by same. 
          </p>  
             </div>
           </div>

            <label style={{ display: "block", marginBottom: "15px" }}>
              <input
                type="checkbox"
                checked={waiverAccepted}
                onChange={(e) => setWaiverAccepted(e.target.checked)}
              />{" "}
              I have read and agree to the terms of the waiver.
            </label>

            <button
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

          <button onClick={() => { 
            setShowWaiver(false);
             toast.error("You must agree to the waiver before completing your registration.",
              { position: "top-center",
               autoClose: 3000 
               }); 
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
