import './App.css';
import React, { useState } from "react";
import {useRef} from "react";
import emailjs from '@emailjs/browser';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import Form from './components/Form';
import Popup from './components/Popup';
import QRCode from 'react-qr-code';

function App() {
  const form=useRef();
  
  const [buttonPopup,setButtonPopup]=useState(false);
  const [emailProvided,setEmailProvided] = useState(false);
  const [text, setText] = useState();
  const params = new URLSearchParams(window.location.search);
  const hash=params.get('hash');


  const onSubmitForm = async e => {
    e.preventDefault();
    const email = document.getElementById("userEmail").value;
    setEmailProvided(true);
    try {
     const body={email,hash};
     const response = await fetch(
       "https://coworking-khuti.ondigitalocean.app/api/generateVerificationCode",
       {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body)
       }
     );
     console.log(response);
    } catch (err) {
     console.error(err.message);
     console.log("Greska");
    }

  }
  const onSubmitVerificationCode = async e => {
    e.preventDefault();
    setButtonPopup(true);
    const code = document.getElementById("userEmail").value;

    setEmailProvided(true);
    try {
      const body={code,hash};
      const response = await fetch(
       "https://coworking-khuti.ondigitalocean.app/api/checkVerificationCode",
       {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body)
       }
      );
      console.log(response);
      if(response.status == 200)
      {
        setText('You have successfully redeemed your ticket for BeoSpace');
      }
      else
        setText('You have failed to redeem your ticket for BeoSpace');
    } catch (err) {
      console.error(err.message);
      setText('You have failed to redeem your ticket for BeoSpace');
    }
    
    
  }
  const closePopUp = () => {
    setButtonPopup(false);
  }

  const particlesInit = async (main) => {
    console.log(main);
    await loadFull(main);
  };
  
  const particlesLoaded = (container) => {
    console.log(container);
  };

  return (
    <div className="App">
      
      
      <div className="input-group input-group-lg"><h2>Redeem your card for BeoSpace</h2></div>
      <div>
      <Form isEmailProvided = {emailProvided} eventFunc = {emailProvided? onSubmitVerificationCode: onSubmitForm}></Form>
      <div className="qrCode">
        <QRCode  
      title="title"
      value={hash}
      bgColor={'#FFFFFF'}
      fgcolor={'#000000'}
      size={256}
      /> 
      </div>
      </div>
      <div>
      <Popup trigger={buttonPopup} func = {closePopUp} content={text}></Popup>
      </div>
    </div>
  );
}

export default App;
