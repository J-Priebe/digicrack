import React, { useState, FC } from "react";
import logo from "./logo.svg";
import { LockRing, Ring } from "./lock";
import "./App.css";
import { getSolution } from "./solver";

function App() {
  // track the locks here and pass in a click function
  // start with 3 rings
  const numBits = 32;
  // const [numRings, setNumRings] = useState(3);

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
    const newState = lockBits.map((ring) => {
      return [...ring];
    });
    const v = newState[ringIndex][bitIndex];
    newState[ringIndex][bitIndex] = v === 1 ? 0 : 1;

    setLockBits(newState);
  };

  const toggleKeyBit = (keyIndex: number, bitIndex: number) => {
    const newState = keyBits.map((k) => {
      return [...k];
    });
    const v = newState[keyIndex][bitIndex];
    newState[keyIndex][bitIndex] = v === 1 ? 0 : 1;

    setKeyBits(newState);
  };

  const numKeys = (): number => {
    return keyBits?.length;
  };

  const addKey = () => {
    setKeyBits([...keyBits, Array(numBits).fill(0)]);
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
  ];

  const colors = [
    "#red", "#darkred",
    "#orange", "#darkorange",
    "#green",
    "#darkgreen",
    "#yellow",
    "#blue", "#lightblue",
    "#purple",
  ]

  const doThing = () => {
    const solution = getSolution(keyBits, lockBits)
    console.log('SOLUTION:', JSON.stringify(solution))
    solution?.forEach((k) => {
      if (k.currentAllocation) {
        const [offset, lockIndex] = k.currentAllocation;
        const rotated = k.rotated(offset);
        // keyBits[0] = 5;
      }
    })
  }

  return (
    <div className="App">
      <div>
        <div>
          Locks:
          {lockBits.map((l, i) => (
            <div key={i}>{JSON.stringify(l)}</div>
          ))}
        </div>
        <div>
          <button onClick={addRing} disabled={numRings() >= 5}>
            + Ring
          </button>
          <button onClick={subRing} disabled={numRings() <= 1}>
            - Ring
          </button>
        </div>
        <div>
          Keys:
          {keyBits.map((l, i) => (
            <div key={i}>{JSON.stringify(l)}</div>
          ))}
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
        />
        <svg width="50%" height="100%" viewBox="0 0 42 42" className="donut">
          {keyBits.map((k, i) => {
            return (
              <Ring
                bits={keyBits[i]}
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
