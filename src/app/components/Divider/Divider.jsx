const Divider = ({ color }) => {
  if (!color) throw new Error("Componente precisa de cor :(");

  const styles = {
    backgroundColor: color,
    height: "1px",
    width: "100%",
  };

  return <div style={styles}></div>;
};

export default Divider;
