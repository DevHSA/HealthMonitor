import logo from './logo.svg';
import './App.css';
import {fetchData} from './awsIoT';
import axios from "axios";
import React from "react";

const baseURL = "https://5tayx5prn2.execute-api.us-east-1.amazonaws.com/test/11";

function App() {

  const [post, setPost] = React.useState(null);

  React.useEffect(() => {
    
    axios.get(baseURL).then((response) => {
      setPost(response.data);
      console.log(response);
    });


  }, []);

  const fetchDataFormDynamoDb = () => {
    console.log("I am logging")
    fetchData('IoT_sensor_data')
  }

  if (!post) return null;

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => fetchDataFormDynamoDb()}> Fetch </button>
        <div>Hello!</div> 
        <div>
          <h1>{post.title}</h1>
          <p>{post.body}</p>
        </div>  
      </header>
    </div>
  );
}

export default App;
