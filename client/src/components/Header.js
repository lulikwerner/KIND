function Header() {
  return (
    <header
      style={{
        backgroundColor: "#3a6fb6",
        color: "white",
        textAlign: "center",
        padding: "20px 0",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000
      }}
    >
      <img
        src="/images/Patterson.png"
        alt="Gobble Gobble"
        style={{
          width: "2000px",
          height: "200px",
          objectFit: "contain",
          marginBottom: "10px"
        }}
      />

      <h1
        style={{
          margin: 0,
          fontSize: "40px",
          fontWeight: "bold",
          lineHeight: "1.2"
        }}
      >
       K.I.N.D<br /> RIDE FOR MILES
      </h1>
    </header>
  );
}

export default Header;

