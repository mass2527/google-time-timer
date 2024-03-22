function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        className="relative grid place-items-center"
        style={{
          width: "400px",
          height: "400px",
          borderRadius: "50%",
        }}
      >
        {Array(30)
          .fill(null)
          .map((_, i) => {
            const height = i % 5 === 0 ? 4 : 1;
            return (
              <div
                key={i}
                className="absolute bg-black"
                style={{
                  top: `calc(50% - ${height}px / 2)`,
                  height: `${height}px`,
                  border: "1px solid black",
                  transform: `rotate(${6 * i}deg)`,
                  width: `calc(100% + ${i % 5 === 0 ? 14 : 0}px)`,
                }}
              ></div>
            );
          })}

        <div
          className="bg-white z-10"
          style={{
            width: "calc(100% - 14px)",
            height: "calc(100% - 14px)",
            borderRadius: "50%",
          }}
        ></div>

        <div
          className="z-10 absolute"
          style={{
            width: "calc(100% - 14px)",
            height: "calc(100% - 14px)",
            borderRadius: "50%",
            backgroundColor: "#e31936",
          }}
        ></div>

        {Array(12)
          .fill(null)
          .map((_, i) => {
            const height = 10;

            return (
              <div
                key={i}
                className="absolute z-20 flex justify-end items-center"
                style={{
                  transform: `rotate(${270 + 30 * i}deg) translateX(50%)`,
                  top: `calc(50% - ${height}px / 2)`,
                  height: `${height}px`,
                  width: "calc(50% + 40px)",
                }}
              >
                <span
                  className="text-2xl font-semibold tracking-tight"
                  style={{
                    transform: `rotate(-${270 + 30 * i}deg)`,
                  }}
                >
                  {i === 0 ? 0 : 60 - 5 * i}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default App;
