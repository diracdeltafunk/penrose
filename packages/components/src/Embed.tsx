import { CSSProperties, useState } from "react";
import { Simple } from "./Simple.js";
import Logo from "./icons/Logo.js";
import Resample from "./icons/Resample.js";

const footerStyle: CSSProperties = {
  display: "flex",
  overflow: "hidden",
  justifyContent: "space-between",
  padding: "0 1em",
  alignItems: "center",
  backgroundColor: "#40b4f7",
  borderRadius: "0 0 9px 9px",
};

const containerStyle: CSSProperties = {
  position: "relative",
  borderRadius: "10px",
  boxShadow: "0 5px 8px 0 rgba(0, 0, 0, 0.2)",
  overflow: "hidden",
  backgroundColor: "white",
};

const textStyle: CSSProperties = {
  fontFamily: '"Open Sans", sans-serif',
  color: "white",
  margin: "0.7em",
  fontWeight: "lighter",
  fontSize: "smaller",
};

const Heart = () => (
  <span role="img" aria-label="heart">
    💜
  </span>
);

interface EmbedState {
  variation: string;
}

export default (props: {
  trio: { substance: string; domain: string; style: string; variation: string };
}) => {
  const { trio } = props;
  const { variation, substance, style, domain } = trio;
  const [currVariation, setVariation] = useState(variation);

  return (
    <div className="embed-container" style={containerStyle}>
      <Simple
        name={"embed"}
        domain={domain}
        substance={substance}
        style={style}
        variation={currVariation}
        interactive={false}
        animate={true}
        excludeWarnings={[]}
      />
      <div style={{ width: "100%", height: "100%" }} />
      <div className="embed-footer" style={footerStyle}>
        <a href="https://penrose.cs.cmu.edu/">
          <Logo width={24} color={"white"} />
        </a>
        <div className="embed-text" style={textStyle}>
          Generated by Penrose with <Heart />
        </div>
        <div onClick={() => setVariation(Math.random().toString())}>
          <Resample size={24} color={"white"} />
        </div>
      </div>
    </div>
  );
};
