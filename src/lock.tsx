import { FC } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

interface IRing {
  circumference: number;
  numSegments: number;
  onBitToggle: (ringIndex: number, bitIndex: number) => void;
  ringNum: number;
  bits: Array<number>;
  bitColors: Array<string>;
  xPos: number;
  yPos: number;
}

export const Ring: FC<IRing> = (props) => {
  const toggleSlot = (index: number) => {
    props.onBitToggle(props.ringNum, index);
  };

  const radius = props.circumference / (2 * Math.PI);
  const offset = 0.1;
  const segmentLength = props.circumference / props.bits.length - offset;
  const strokeWidth = 2.5;

  const segmentsSVG = props.bits.map((s, i) => {
    return (
      <circle
        className="donut-segment"
        cx={props.xPos}
        cy={props.yPos}
        r={radius}
        fill="none"
        stroke={props.bitColors[i]}
        strokeWidth={strokeWidth}
        strokeDasharray={`${segmentLength} ${
          props.circumference - segmentLength
        }`}
        strokeDashoffset={
          (i * props.circumference) / props.numSegments + offset
        }
        onClick={() => toggleSlot(i)}
        key={i}
      ></circle>
    );
  });
  return (
    <>
      {segmentsSVG}
      {/* Hole goes on top so clicking outside ring doesnt trigger toggles */}
      <circle
        className="donut-hole"
        cx={props.xPos}
        cy={props.yPos}
        r={radius - strokeWidth / 2}
        fill="lightgray"
      ></circle>
    </>
  );
};

interface ILock {
  //   circumference: number;
  numRings: number;
  onBitToggle: (ringIndex: number, bitIndex: number) => void;
  lockBitArr: Array<Array<number>>;
  lockColors: Array<Array<string>>;
}

export const LockRing: FC<ILock> = (props) => {
  // circumference, stroke width for up to 5 rings
  const circumferences = [300, 250, 200, 150, 100];
  // const strokeWidths = [2,2,1.5,1.5,0.2];
  const iter = Array(props.numRings).fill(0);

  const theme = useTheme();
  const mdOrLarger = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" className="locksSVG">
      {iter.map((_, i) => {
        return (
          <Ring
            bits={props.lockBitArr[i]}
            bitColors={props.lockColors[i]}
            numSegments={32}
            circumference={circumferences[i]}
            onBitToggle={props.onBitToggle}
            key={i}
            ringNum={i}
            xPos={50}
            yPos={mdOrLarger ? 0 : 50}
          />
        );
      })}
    </svg>
  );
};
