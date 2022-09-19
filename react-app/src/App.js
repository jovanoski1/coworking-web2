import './App.css';
import React, { useState } from "react";
import {useRef} from "react";
import emailjs from '@emailjs/browser';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import Form from './components/Form';
import Popup from './components/Popup';
import QRComponent from './components/QRComponent'


function App() {
  const form=useRef();
  const [emailSaved, setEmailSaved]=useState("");
  const [buttonPopup,setButtonPopup]=useState(false);
  const [emailProvided,setEmailProvided] = useState(false);
  const [text, setText] = useState();
  const params = new URLSearchParams(window.location.search);
  const hash=params.get('hash');
  const [email,setEmail]=useState("");

  const onSubmitForm = async e => {
    e.preventDefault();
    setButtonPopup(true);
    setEmailProvided(true);
    setEmailSaved(email);
    try {
      const body={email,hash};
      const response = await fetch(
        "https://coworking-khuti.ondigitalocean.app/api/sendCodeToEmail",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );
      if(response.status == 200)
       setText('Verification code has been sent to your email');
      else
       setText('Ticket has been already redeemed');
      console.log(response);
     } catch (err) {
      console.error(err.message);
     }
  }

  const onSubmitVerificationCode = async e => {
    e.preventDefault();
    setButtonPopup(true);
    const code = email;
    setEmail(emailSaved);
    setEmailProvided(true);
    
    console.log(email);
    console.log(code);
    try {
      const body={code:code,hash:hash,email:emailSaved};
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
        setText('You have failed to redeem your ticket for BeoSpace1');
    } catch (err) {
      console.error(err.message);
      setText('You have failed to redeem your ticket for BeoSpace2');
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
      <Form id="forma" sendEmailtoParent = {setEmail}isEmailProvided = {emailProvided}  eventFunc = {emailProvided? onSubmitVerificationCode: onSubmitForm}></Form>
      <div className="qrCode">
        <QRComponent trigger={hash} content={hash}></QRComponent>
      </div>
      </div>
      <div>
      <Popup trigger={buttonPopup} func={closePopUp} content={text}></Popup>
      </div>
    </div>
  );
}

export default App;
