import { useState} from "react";
import { LockRing, Ring } from "./lock";
import { getSolution } from "./solver";
import "./App.css";

function App() {
  // track the locks here and pass in a click function
  // start with 3 rings
  const numBits = 32;
  // const [numRings, setNumRings] = useState(3);

  // assign each key a color,
  // so that when we apply a solution we color the locks
  const colors = [
    "red",
    "darkgreen",
    "darkred",
    "orange",
    "magenta",
    "green",
    "pink",
    "yellow",
    "blue",
    "purple",
    "darkorange",
    "lightblue",
    "violet",
    "lightgreen",
    "white",
  ];

  // n rings of 32 bits each
  const [lockBits, setLockBits] = useState([
    // example lock
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1, 0, 1,
    ],
    [
      0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
      1, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 1,
    ],
  ]);

  const [keyBits, setKeyBits] = useState([
    // example keys
    [
      0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 1, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 1,
    ],
    [
      0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ],
  ]);

  const unusedSlotColor = "gray";
  const [keyColors, setKeyColors] = useState(
    keyBits.map((bits, i) =>
      bits.map((bit) => (bit === 1 ? colors[i] : unusedSlotColor))
    )
  );

  const lockUsedSlotColor = "black";
  // set all the lock bits to unused color to start
  const [lockColors, setLockColors] = useState<Array<Array<any>>>(
    lockBits.map((bits) =>
      bits.map((bit) => (bit === 1 ? lockUsedSlotColor : unusedSlotColor))
    )
  );

  const numRings = (): number => {
    return lockBits?.length;
  };

  const addRing = () => {
    setLockBits([...lockBits, Array(numBits).fill(0)]);
  };
  const subRing = () => {
    const newArr = [...lockBits];
    newArr.pop();
    setLockBits(newArr);
  };
  const toggleLockBit = (ringIndex: number, bitIndex: number) => {
    const newBits = lockBits.map((ring) => {
      return [...ring];
    });
    const v = newBits[ringIndex][bitIndex];
    newBits[ringIndex][bitIndex] = v === 1 ? 0 : 1;

    const newColors = lockColors.map((ring) => {
      return [...ring];
    });
    newColors[ringIndex][bitIndex] =
      newBits[ringIndex][bitIndex] === 1 ? lockUsedSlotColor : unusedSlotColor;

    setLockBits(newBits);
    setLockColors(newColors);
  };

  const toggleKeyBit = (keyIndex: number, bitIndex: number) => {
    const newBits = keyBits.map((k) => {
      return [...k];
    });
    const v = newBits[keyIndex][bitIndex];
    newBits[keyIndex][bitIndex] = v === 1 ? 0 : 1;

    const newColors = keyColors.map((key) => {
      return [...key];
    });
    newColors[keyIndex][bitIndex] =
      newBits[keyIndex][bitIndex] === 1 ? colors[keyIndex] : unusedSlotColor;

    setKeyBits(newBits);
    setKeyColors(newColors);
  };

  const numKeys = (): number => {
    return keyBits?.length;
  };

  const addKey = () => {
    setKeyBits([...keyBits, Array(numBits).fill(0)]);
    setKeyColors([...keyColors, Array(numBits).fill(unusedSlotColor)]);
  };
  const subKey = () => {
    const newArr = [...keyBits];
    newArr.pop();
    setKeyBits(newArr);
  };

  // TODO
  const keyRad = 35 / (2 * Math.PI);
  const keyXPos = [
    keyRad + 1,
    keyRad * 3 + 3,
    keyRad * 5 + 5,
    keyRad + 1,
    keyRad * 3 + 3,
    keyRad * 5 + 5,
    keyRad + 1,
    keyRad * 3 + 3,
    keyRad * 5 + 5,
    keyRad + 1,
    keyRad * 3 + 3,
    keyRad * 5 + 5,
    keyRad + 1,
    keyRad * 3 + 3,
    keyRad * 5 + 5,
  ];
  const keyYPos = [
    keyRad + 1,
    keyRad + 1,
    keyRad + 1,
    keyRad * 3 + 3,
    keyRad * 3 + 3,
    keyRad * 3 + 3,
    keyRad * 5 + 5,
    keyRad * 5 + 5,
    keyRad * 5 + 5,
    keyRad * 7 + 7,
    keyRad * 7 + 7,
    keyRad * 7 + 7,
    keyRad * 9 + 9,
    keyRad * 9 + 9,
    keyRad * 9 + 9,
  ];

  const doThing = () => {
    const solution = getSolution(keyBits, lockBits);
    // console.log("SOLUTION:", JSON.stringify(solution));
    const newLockColors = lockColors.map((l) => [...l]);
    solution?.forEach((k) => {
      if (k.currentAllocation) {
        const [offset, lockIndex] = k.currentAllocation;
        const rotated = k.rotated(offset);
        // Set the lock bits to the color of the key that fills it.
        // We use the ID of each key to map back to their
        // original color and position, since we
        // rearrange them before solving
        rotated.forEach((r, i) => {
          if (r === 1) {
            newLockColors[lockIndex][i] = colors[k.id];
          }
        });
      }
    });
    setLockColors(newLockColors);
  };

  return (
    <div className="App">
      <div>
        <div>
          <button onClick={addRing} disabled={numRings() >= 5}>
            + Ring
          </button>
          <button onClick={subRing} disabled={numRings() <= 1}>
            - Ring
          </button>
        </div>
        <div>
          <button onClick={addKey} disabled={numKeys() >= 15}>
            + Key
          </button>
          <button onClick={subKey} disabled={numKeys() <= 1}>
            - Key
          </button>
        </div>
        <div>
          <button onClick={doThing}>SOLVE</button>
        </div>
      </div>
      <div>
        <LockRing
          numRings={numRings()}
          onBitToggle={toggleLockBit}
          lockBitArr={lockBits}
          lockColors={lockColors}
        />
        <svg width="50%" height="100%" viewBox="0 0 42 100" className="donut">
          {keyBits.map((k, i) => {
            return (
              <Ring
                bits={keyBits[i]}
                bitColors={keyColors[i]}
                numSegments={32}
                circumference={35}
                onBitToggle={toggleKeyBit}
                key={i}
                ringNum={i}
                xPos={keyXPos[i]}
                yPos={keyYPos[i]}
              />
            );
          })}
        </svg>
      </div>
      <div>Keys:</div>
      <div></div>
    </div>
  );
}

export default App;
