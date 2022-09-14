import React from 'react'
import '../Popup.css';

function Popup({trigger, func, content}) {
  return (trigger)?(
    <div>
        <div className="modal">
            <div className='popup-content'>
              <p>{content}</p>
              <button onClick={func}>Close</button>
            </div>
        </div>
    </div>
  ):null;
}

export default Popup

