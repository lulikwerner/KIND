function Header() {
  return (
    <header
      style={{
          backgroundColor:"#EB92A9",
        //backgroundColor: "#3a6fb6",
        //color: "white",
        color:"black",
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
          display: "block",
          margin: "0 auto 10px auto",
          width: "100%",
          maxWidth: "200px",
          height: "auto",
          objectFit: "contain"
        }}
      />

      <h1
        style={{
          margin: 0,
          fontSize: "40px",
          fontWeight: "bold",
          lineHeight: "1.2",
          color:"#000000"
        }}
      >
        K.I.N.D<br /> MILES FOR A CURE
      </h1>
    </header>
  );
}

export default Header;


