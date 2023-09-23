import { useEffect, useState } from "react";
import { LockRing, Ring } from "./lock";
import { getSolution } from "./solver";
import { exampleKeys, exampleLocks, keyColors } from "./constants";
import "./App.css";
import Grid from "@mui/material/Grid";

enum SOLVE_STATES {
  unsolved = 0,
  solved = 1,
  failed = 2,
  inProgress = 3,
}

function App() {
  const numBits = 32; // bits per key/lock
  const maxKeys = 15;
  const maxLocks = 5;

  // positioning of SVG elements
  const keysSVGCircumference = 80;
  const keySVGRadius = keysSVGCircumference / (2 * Math.PI);
  const keysPerRow = 3;

  const unusedSlotColor = "gray";
  const lockUsedSlotColor = "black";

  // n rings and keys, numBits each
  const [lockBits, setLockBits] = useState(exampleLocks);
  const [keyBits, setKeyBits] = useState(exampleKeys);

  // set all the bits to unused color to start
  const [keyBitColors, setKeyBitColors] = useState<Array<Array<string>>>(
    keyBits.map((bits, i) =>
      bits.map((bit) => (bit === 1 ? keyColors[i] : unusedSlotColor))
    )
  );
  const [lockColors, setLockColors] = useState<Array<Array<string>>>(
    lockBits.map((bits) =>
      bits.map((bit) => (bit === 1 ? lockUsedSlotColor : unusedSlotColor))
    )
  );

  const numRings = (): number => {
    return lockBits?.length;
  };
  const addLockRing = () => {
    setLockBits([...lockBits, Array(numBits).fill(0)]);
    setLockColors([...lockColors, Array(numBits).fill(unusedSlotColor)]);
    setSolveState(SOLVE_STATES.unsolved);
  };
  const subLockRing = () => {
    const newLocks = [...lockBits];
    newLocks.pop();
    const newLockColors = [...lockColors];
    newLockColors.pop();
    setLockBits(newLocks);
    setLockColors(newLockColors);
    setSolveState(SOLVE_STATES.unsolved);
  };

  const numKeys = (): number => {
    return keyBits?.length;
  };
  const addKey = () => {
    setKeyBits([...keyBits, Array(numBits).fill(0)]);
    setKeyBitColors([...keyBitColors, Array(numBits).fill(unusedSlotColor)]);
    setSolveState(SOLVE_STATES.unsolved);
  };
  const subKey = () => {
    const newKeys = [...keyBits];
    newKeys.pop();
    const newColors = [...keyBitColors];
    newColors.pop();
    setKeyBits(newKeys);
    setKeyBitColors(newColors);
    setSolveState(SOLVE_STATES.unsolved);
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
    setSolveState(SOLVE_STATES.unsolved);
  };

  const toggleKeyBit = (keyIndex: number, bitIndex: number) => {
    const newBits = keyBits.map((k) => {
      return [...k];
    });
    const v = newBits[keyIndex][bitIndex];
    newBits[keyIndex][bitIndex] = v === 1 ? 0 : 1;

    const newColors = keyBitColors.map((key) => {
      return [...key];
    });
    newColors[keyIndex][bitIndex] =
      newBits[keyIndex][bitIndex] === 1 ? keyColors[keyIndex] : unusedSlotColor;

    setKeyBits(newBits);
    setKeyBitColors(newColors);
    setSolveState(SOLVE_STATES.unsolved);
  };

  const resetLockColors = () => {
    const newColors = lockBits.map((lockRing) =>
      lockRing.map((bit) => (bit !== 0 ? lockUsedSlotColor : unusedSlotColor))
    );
    setLockColors(newColors);
  };

  const getKeyElementPosition = (i: number, width: number, radius: number) => {
    const row = Math.floor(i / width);
    const col = i % width;
    const x = col * (2 * radius + 5) + radius + 7;
    const y = row * (2 * radius + 5) + radius + 1;
    return { x, y };
  };

  const [solveState, setSolveState] = useState<SOLVE_STATES>(
    SOLVE_STATES.unsolved
  );

  const [status, setStatus] = useState("Click Solve to begin!");

  useEffect(() => {
    if (solveState === SOLVE_STATES.solved) {
      setStatus("Two is binding... we're in!");
    } else if (solveState === SOLVE_STATES.failed) {
      resetLockColors();
      setStatus(
        "This lock was too tough to crack :( Make sure your locks are keys are set up right, or report a bug to /u/POWERSNUGGLE on reddit :)"
      );
    } else if (solveState === SOLVE_STATES.unsolved) {
      resetLockColors();
      setStatus(
        `Tap the edges of the circles to create your locks and keys.
        You can add/remove them with the controls above.
        Then, hit SOLVE to see where each key fits in the lock!
        You can show/hide the example at any time by using the buttons in the top corner.`
      );
    } else {
      setStatus("Working on it... this is a tough one!");
    }
  }, [solveState]);

  const solve = () => {
    setSolveState(SOLVE_STATES.inProgress);
    console.log("keys:", JSON.stringify(keyBits));
    console.log("locks:", JSON.stringify(lockBits));

    const solution = getSolution(keyBits, lockBits);
    if (solution) {
      setSolveState(SOLVE_STATES.solved);
    } else {
      setSolveState(SOLVE_STATES.failed);
    }

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
            newLockColors[lockIndex][i] = keyColors[k.id];
          }
        });
      }
    });
    setLockColors(newLockColors);
  };

  const clearAll = () => {
    // empty all locks and keys, reset to two, one
    setLockBits([Array(numBits).fill(0)]);
    setLockColors([Array(numBits).fill(unusedSlotColor)]);
    setKeyBits([Array(numBits).fill(0)]);
    setKeyBitColors([Array(numBits).fill(unusedSlotColor)]);
    setSolveState(SOLVE_STATES.unsolved);
  };
  const showExample = () => {
    setLockBits(exampleLocks);
    setLockColors(
      exampleLocks.map((bits) =>
        bits.map((bit) => (bit === 1 ? lockUsedSlotColor : unusedSlotColor))
      )
    );
    setKeyBits(exampleKeys);
    setKeyBitColors(
      exampleKeys.map((bits, i) =>
        bits.map((bit) => (bit === 1 ? keyColors[i] : unusedSlotColor))
      )
    );
  };

  return (
    <div className="App">
      <Grid container spacing={2}>
        <Grid item xs={3} />
        <Grid item xs={6}>
          <button
            onClick={addLockRing}
            disabled={
              numRings() >= maxLocks || solveState === SOLVE_STATES.inProgress
            }
          >
            + Lock Ring
          </button>
          <button
            onClick={subLockRing}
            disabled={numRings() <= 1 || solveState === SOLVE_STATES.inProgress}
          >
            - Lock Ring
          </button>
        </Grid>
        <Grid item xs={3}>
          <button
            onClick={clearAll}
            disabled={solveState === SOLVE_STATES.inProgress}
          >
            Clear All
          </button>{" "}
          <button
            onClick={showExample}
            disabled={solveState === SOLVE_STATES.inProgress}
          >
            Show Example
          </button>
        </Grid>
        <Grid item xs={12}>
          <button
            onClick={addKey}
            disabled={
              numKeys() >= maxKeys || solveState === SOLVE_STATES.inProgress
            }
          >
            + Key
          </button>
          <button
            onClick={subKey}
            disabled={numKeys() <= 1 || solveState === SOLVE_STATES.inProgress}
          >
            - Key
          </button>
          <Grid item xs={12}>
            <button
              onClick={solve}
              disabled={solveState === SOLVE_STATES.inProgress}
            >
              SOLVE
            </button>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {status}
        </Grid>
        <Grid item xs={12} md={6}>
          <LockRing
            numRings={numRings()}
            onBitToggle={toggleLockBit}
            lockBitArr={lockBits}
            lockColors={lockColors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 200"
            className="keysSVG"
          >
            {/* <svg style = {{ width: "inherit", height:"inherit"}} > */}
            {keyBits.map((k, i) => {
              const { x, y } = getKeyElementPosition(
                i,
                keysPerRow,
                keySVGRadius
              );
              return (
                <Ring
                  bits={keyBits[i]}
                  bitColors={keyBitColors[i]}
                  numSegments={32}
                  circumference={keysSVGCircumference}
                  onBitToggle={toggleKeyBit}
                  key={i}
                  ringNum={i}
                  xPos={x}
                  yPos={y}
                />
              );
            })}
          </svg>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
