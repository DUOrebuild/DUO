// This file is optional but included to avoid warnings in the console.
// You can remove it if you don't want to use it.
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB, getFMP }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
      getFMP(onPerfEntry);
    });
  }
};

export default reportWebVitals;