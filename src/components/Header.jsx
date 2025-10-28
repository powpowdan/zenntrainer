export default function Header({ onStart, onPause, onReset, onSave, onLoad, onClear }) {
 
  return (
    <div
      style={{
        textAlign: "center",
        padding: "8px 0",
        backgroundColor: "#2b2a33",
      }}
    >
      <h2 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Zenn class tracker</h2>
         <button onClick={onStart} style={{ padding: "5px 10px", fontSize: "14px", margin: "0 10px 0 0",}}>
          Start
        </button>
        <button onClick={onPause} style={{ padding: "5px 10px", fontSize: "14px", margin: "0 10px 0 10px",}}>
          Pause
        </button>
        <button onClick={onReset} style={{ padding: "5px 10px", fontSize: "14px",}}>
          Reset
        </button>
          <div style={{ marginTop: "5px"}} >
        <button onClick={onSave} style={{ padding: "5px 10px", fontSize: "14px",  margin: "0 10px 0 0",}}>💾 Save</button>
        <button onClick={onLoad} style={{ padding: "5px 10px", fontSize: "14px", margin: "0 10px 0 10px",}}>📂 Load</button>
        <button onClick={onClear} style={{ padding: "5px 10px", fontSize: "14px",}}>🗑️ Clear</button>
      </div>
    </div>
  );
}
