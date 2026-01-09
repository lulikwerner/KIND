import { useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    address: "",
    email: "",
    phone: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
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
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)" ,
        fontFamily: "Arial, sans-serif"

      }}
    >
      <Header />

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "18px", width:"100%" }}
      >
        <div>
          <label style={{ fontWeight: "bold" }}>First Name</label>
          <input
            name="firstName"
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
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              fontFamily: "Arial, sans-serif",
              border: "1px solid #ccc"
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: "bold" }}>Address</label>
          <input
            name="address"
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
          type="submit"
          style={{
            display: "block",
            width:"105%",
            padding: "12px",
            backgroundColor: "#e77d2f",
            color: "black",
            border: "none",
            fontSize:"18px",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Register
        </button>
      </form>
<ToastContainer />

      <Footer />
    </div>
  );
}

export default App;




