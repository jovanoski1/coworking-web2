import './App.css';
import React, { useState } from "react";
import {useRef} from "react";
import emailjs from '@emailjs/browser';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import Popup from './components/Popup';

function App() {
  const form=useRef();
  
  const [buttonPopup,setButtonPopup]=useState(false);
  const params = new URLSearchParams(window.location.search);

  const sendEmail = e => {
     e.preventDefault();

    emailjs.sendForm('service_mjucys7', 'template_q3h2s7u', form.current, 'YNnI5Oxb2jDlOkwVn')
      .then((result) => {
          console.log(result.text);
      }, (error) => {
          console.log(error.text);
      });
  };


  const onSubmitForm = async e => {
   
      e.preventDefault();
      const email = document.getElementById("userEmail").value;
      try{
        const hash=params.get('hash');
        const response = await fetch("https://coworking-khuti.ondigitalocean.app/api/updateTicket" ,{
         method: "PUT",
         headers:{"Content-Type": "application/json"},
         body: JSON.stringify({hash,email})
      });
       sendEmail(e);
       console.log(response);
     }
     catch(err)
     {
       console.error(err.message);
     }

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
      
      <Particles
        id="tsparticles"
        className="fireworks"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          fullScreen: {
            enable: true,
          },
          detectRetina: true,
          background: {
            color: "#FFFFFF",
          },
          fpsLimit: 60,
          emitters: {
            direction: "top",
            life: {
              count: 0, //no. of fireworks
              duration: 0.1,
              delay: 0.1,
            },
            rate: {
              delay: 0.03,
              quantity: 1,
            },
            size: {
              width: 100,
              height: 0,
            },
            position: {
              y: 100,
              x: 50,
            },
          },
          particles: {//properties of the main firework particle
            number: {
              value: 0, //to randomiser the number of particles
            },
            destroy: {
              mode: "split", //to get the fireworks effect
              split: {
                rate: {
                  value: 100, //amount of splits
                },
                particles: {
                  // setting properties of those particles formed after splitting
                  color: {
                    value: [
                      "#FFC0CB" /*Pink*/,
                      "#FFB6C1" /*LightPink*/,
                      "#FF69B4" /*HotPink*/,
                      "#FF1493" /*DeepPink*/,
                      "#DB7093" /*PaleVioletRed*/,
                      "#C71585" /*MediumVioletRed*/,
                      "#00FFFF", //acqua
                      "rgb(124, 252, 0)", //grassy green
                    ],
                  },
                  opacity: {
                    value: 1,
                    animation: {
                      enable: true,
                      speed: 0.2,
                      minimumValue: 0.1,
                      sync: false,
                      startValue: "max", //multiple fireworks
                      destroy: "min",
                    },
                  },
                  shape: {
                    type: "star",
                  },
                  size: {
                    value: 1,
                    animation: {
                      enable: false, //to get the sparkly feeling
                    },
                  },
                  life: {
                    count: 1, //amount of time
                    duration: {
                      value: {
                        min: 1,
                        max: 2,
                      },
                    },
                  },
                  move: {
                    //all about firework showers
                    enable: true, // to get the fireworks effect
                    gravity: {
                      enable: false, //stops gravity from pulling them up
                    },
                    speed: 3, //speed of the fireworks
                    direction: "none", //direction of the fireworks
                    outMode: "destroy", // avoids overlapping of fireworks
                  },
                },
              },
            },
            life: {
              count: 1,
            },
            shape: {
              type: "line",
            },
            size: {
              value: { min: 1, max: 100 },
              animation: {
                enable: true,
                sync: true,
                speed: 150,
                startValue: "random",
                destroy: "min",
              },
            },
            stroke: {
              color: {
                value: "#383838",
              },
              width: 1,
            },
            rotate: {
              path: true,//single path
            },
            move: {
              enable: true,
              gravity: {
                acceleration: 15,
                enable: true,
                inverse: true,//to avoid projectiles and follow a st line
                maxSpeed: 100,
              },
              speed: { min: 10, max: 20 },
              outModes: {
                default: "destroy",
              },
              trail: {// to give the split particle a trail so that we can see its dirn
                enable: true,
                length: 10,
              },
            },
          },
        }}
      />
      <div className="input-group input-group-lg"><h2>Redeem your card for BeoSpace</h2></div>
      
      <form onSubmit={onSubmitForm} ref={form}>
        <div className="input-group input-group-lg">
          <span className="input-group-text" id="inputGroup-sizing-lg">Email</span>
          <input type="text" id="userEmail" name='user_email' className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-lg" />
          <button className="btn btn-primary" type="submit" value="Submit" onClick={() => setButtonPopup(true)}>Submit</button>
          {/* <Popup trigger={buttonPopup}><h2>Cao</h2></Popup> */}
        </div>
      </form>
    </div>
  );
}

export default App;