import React from 'react'

function Popup(props) {
  return (props.trigger)?(
    <div>
        <div className="popup">
            <button >Close</button>
            {props.children}
        </div>
    </div>
  ):"";
}

export default Popup
