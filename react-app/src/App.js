import './App.css';
import React, { useState } from "react";

function App() {
  const [email,setEmail] =useState("");
  const params = new URLSearchParams(window.location.search);

  const onSubmitForm = async e => {
    e.preventDefault();
     console.log(window.location.search)
     console.log(params.get('hash'));
    try{
      
      const body ={email};
      const hash=params.get('hash');
       const response = await fetch("https://coworking-khuti.ondigitalocean.app/api/updateTicket" ,{
        method: "PUT",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify({hash,email})
      });
      console.log(response)
    }
    catch(err)
    {
      console.error(err.message);
    }

  }

  return (
    <div className="App">
      <form onSubmit={onSubmitForm}>
        <label>Email</label>
        <input type="text" required value={email} onChange={e => setEmail(e.target.value)} />
        <input type="submit" value="Submit" />
      </form>
      
    </div>
  );
}

export default App;