import React, { useState } from 'react';

// import './CircleButtons.css'; // Create a CSS file for styling

function CircleButtons() {
  // Step 3: Create an array to hold boolean values for each button
  const [buttonStates, setButtonStates] = useState(Array(10).fill(false));

  // Step 4: Function to toggle the value of a button
  const toggleButton = (index: number) => {
    const newButtonStates = [...buttonStates];
    newButtonStates[index] = !newButtonStates[index];
    setButtonStates(newButtonStates);
  };

  // Calculate the angle between each button
  const angle = (2 * Math.PI) / 10;

  // Step 5: Render the buttons and handle click events
  return (
    <div className="circle-buttons-container">
      {
      buttonStates.map((isToggled, index) => {
//      const ang = index*angle > Math.PI? -index*angle: index*angle;

     //const ang = index*angle > Math.PI? index*angle - 2*Math.PI: index*angle;
     const ang = index*angle

    //  let xOffset = Math.cos(ang) * 200
    // //  if (ang < Math.PI / 2 || ang > 4*Math.PI/3){
    // //     xOffset = -Math.abs(xOffset);
    // //  }

    //  let yOffset = Math.sin(ang) * 200;
    //  if (ang > Math.PI) {
    //     yOffset = -Math.abs(yOffset);
    //  }

     // let ang;
      // if (index*angle > Math.PI)
      // {
      //   ang =
      // }

      //console.log("ANGLE, INDEX", (ang * 2 * Math.PI).toFixed(2), index);
      return (
        <button
          key={index}
          className={`circle-button ${isToggled ? 'toggled' : ''}`}
          style={{
            // Calculate the position of the button in the circle
            // transform: 'rotate(90deg)'
            transform: `translate(${100 *Math.cos(ang)}px, ${index * 50}px)`,
          }}
          onClick={() => toggleButton(index)}
        >
          {isToggled ? 'On' : 'Off'}
        </button>
      )
    }
      )}
    </div>
  );
}

export default CircleButtons;

