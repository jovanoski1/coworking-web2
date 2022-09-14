import React from 'react'
import QRCode from 'react-qr-code';
function Popup({trigger, content}) {
  return (trigger)?(
    <div>
        <QRCode  
      title="title"
      value={content}
      bgColor={'#FFFFFF'}
      fgcolor={'#000000'}
      size={256}
      /> 
    </div>
  ):null;
}

export default Popup

