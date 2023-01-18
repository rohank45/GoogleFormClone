module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        mobile: { min: "100px", max: "500px" },
        ipad: { min: "501px", max: "1000px" },
        laptop: { min: "1001px", max: "1500px " },
        pc: { min: "1501px" },
      },
      spacing: {
        150: "150px",
        200: "200px",
        230: "230px",
        250: "250px",
        270: "270px",
        280: "280px",
        300: "300px",
        320: "320px",
        330: "330px",
        680: "680px",
        480: "480px",
        450: "450px",
        400: "400px",
      },
      // lineHeight: {
      //   customLH: "0.5 !important",
      // },
      fontFamily: {
        nunito: ["nunito", "sans-serif"],
      },
      colors: {
        primary: "#006b5c",
        secondary: "#fafdfa",
        noteColor: "#88938F",
      },
    },
  },
  plugins: [],
};
